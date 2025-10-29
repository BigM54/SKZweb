import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jwtVerify } from "https://deno.land/x/jose@v4.14.4/index.ts";

type Action = "get" | "reserve" | "leave";

type Body = {
  action: Action;
  variant?: "calme" | "anims" | "anims+" | "anims++";
};

type BusPlaceRow = {
  tabagns: string;
  calme: number | null;
  anims: number | null;
  "anims+": number | null;
  "anims++": number | null;
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  } as Record<string, string>;
}

const ORDER = ["calme", "anims", "anims+", "anims++"] as const;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders() });
  }

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing token" }), { status: 401, headers: corsHeaders() });
  }

  try {
    // Verify JWT
    const secret = Deno.env.get("JWT_SECRET_SUPABASE");
    if (!secret) {
      return new Response(JSON.stringify({ error: "Missing JWT secret" }), { status: 500, headers: corsHeaders() });
    }
    let payload: any;
    try {
      const verified = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
      payload = verified.payload;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JWT" }), { status: 401, headers: corsHeaders() });
    }

    const userId = payload.sub as string;
    const userEmail = payload.email as string;
    if (!userId || !userEmail) {
      return new Response(JSON.stringify({ error: "Invalid JWT payload" }), { status: 401, headers: corsHeaders() });
    }

    // Supabase service client
    // @ts-ignore
    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    const body = (await req.json()) as Body | undefined;
    const action: Action = (body?.action ?? "get") as Action;

    // Get user's options to determine tabagns and current type
    const { data: optionsData, error: optionsErr } = await supabase
      .from("options")
      .select("id, bus, type_bus")
      .eq("id", userId)
      .maybeSingle();

    if (optionsErr) throw optionsErr;
    if (!optionsData || !optionsData.bus) {
      return new Response(JSON.stringify({ error: "Aucun bus (tabagns) sélectionné dans tes options." }), { status: 400, headers: corsHeaders() });
    }

    const tabagns = optionsData.bus as string; // e.g., 'sibers'
    const currentType = (optionsData as any).type_bus as string | null;

    // Fetch the row for this tabagns
    const { data: row, error: rowErr } = await supabase
      .from("busPlace")
      .select("tabagns, calme, anims, \"anims+\", \"anims++\"")
      .eq("tabagns", tabagns)
      .maybeSingle();
    if (rowErr) throw rowErr;
    if (!row) {
      return new Response(JSON.stringify({ error: "Aucune donnée de bus pour ce tabagns." }), { status: 404, headers: corsHeaders() });
    }

    const variants = ORDER
      .map((key) => ({ variant: key, places: (row as any)[key] as number | null }))
      .filter((v) => v.places !== null);

    if (action === "get") {
      return new Response(
        JSON.stringify({
          tabagns,
          currentVariant: currentType ?? null,
          variants
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders() } }
      );
    }

    if (action === "reserve") {
      const desired = (body?.variant ?? "") as string;
      if (!desired || !ORDER.includes(desired as any)) {
        return new Response(JSON.stringify({ error: "Variant invalide (calme | anims | anims+ | anims++)" }), { status: 400, headers: corsHeaders() });
      }

      if (currentType && currentType !== desired) {
        return new Response(JSON.stringify({ error: "Tu es déjà inscrit sur un autre bus. Quitte d'abord ce bus pour en choisir un autre." }), { status: 409, headers: corsHeaders() });
      }
      if (currentType === desired) {
        return new Response(JSON.stringify({ success: true, tabagns, variant: desired }), { status: 200, headers: corsHeaders() });
      }

      const currentPlaces = (row as any)[desired] as number | null;
      if (currentPlaces === null) {
        return new Response(JSON.stringify({ error: "Ce bus n'existe pas pour ton tabagns." }), { status: 404, headers: corsHeaders() });
      }
      if (currentPlaces <= 0) {
        return new Response(JSON.stringify({ error: "Ce bus est complet pour ton tabagns." }), { status: 409, headers: corsHeaders() });
      }

      // Decrement places (not atomic; acceptable for now)
      const updatePayload: Record<string, number> = { [desired]: currentPlaces - 1 } as any;
      const { error: decErr } = await supabase
        .from("busPlace")
        .update(updatePayload)
        .eq("tabagns", tabagns);
      if (decErr) throw decErr;

      const { error: optErr } = await supabase
        .from("options")
        .update({ type_bus: desired })
        .eq("id", userId);
      if (optErr) throw optErr;

      return new Response(JSON.stringify({ success: true, tabagns, variant: desired }), { status: 200, headers: corsHeaders() });
    }

    if (action === "leave") {
      if (!currentType) {
        return new Response(JSON.stringify({ error: "Tu n'es inscrit dans aucun bus." }), { status: 400, headers: corsHeaders() });
      }
      const places = (row as any)[currentType] as number | null;
      if (places === null) {
        return new Response(JSON.stringify({ error: "Ce bus n'existe pas/plus pour ton tabagns." }), { status: 404, headers: corsHeaders() });
      }

      // Increment places when leaving
      const updatePayload: Record<string, number> = { [currentType]: places + 1 } as any;
      const { error: incErr } = await supabase
        .from("busPlace")
        .update(updatePayload)
        .eq("tabagns", tabagns);
      if (incErr) throw incErr;

      const { error: optErr } = await supabase
        .from("options")
        .update({ type_bus: null })
        .eq("id", userId);
      if (optErr) throw optErr;

      return new Response(JSON.stringify({ success: true, tabagns, variant: null }), { status: 200, headers: corsHeaders() });
    }

    return new Response(JSON.stringify({ error: "Action inconnue" }), { status: 400, headers: corsHeaders() });
  } catch (e) {
    console.error("bus_choice error", e);
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: corsHeaders() });
  }
});

export const config = {
  runtime: "edge",
  auth: false
};
