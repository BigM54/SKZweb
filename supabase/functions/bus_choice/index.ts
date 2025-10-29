import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jwtVerify } from "https://deno.land/x/jose@v4.14.4/index.ts";

type Action = "get" | "reserve";

type ReserveBody = {
  action: Action;
  variant?: "calme" | "anims" | "anims+";
};

type BusRow = {
  tabagns: string;
  variant: string;
  nbInscrits: number;
  nbMax: number;
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  } as Record<string, string>;
}

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

    const body = (await req.json()) as ReserveBody | undefined;
    const action: Action = (body?.action ?? "get") as Action;

    // Get user's options to determine tabagns
    const { data: optionsData, error: optionsErr } = await supabase
      .from("options")
      .select("id, bus, bus_variant")
      .eq("id", userId)
      .maybeSingle();

    if (optionsErr) throw optionsErr;
    if (!optionsData || !optionsData.bus) {
      return new Response(JSON.stringify({ error: "Aucun bus (tabagns) sélectionné dans tes options." }), { status: 400, headers: corsHeaders() });
    }

    const tabagns = optionsData.bus as string; // e.g., 'sibers'

    // Fetch all three variants for this tabagns
    const { data: rows, error: rowsErr } = await supabase
      .from("busPlaceVariant")
      .select("tabagns, variant, nbInscrits, nbMax")
      .eq("tabagns", tabagns);
    if (rowsErr) throw rowsErr;

    const normalize = (s: string) => s.toLowerCase();

    if (action === "get") {
      const variants = (rows ?? []).map((r: BusRow) => ({
        tabagns: r.tabagns,
        variant: r.variant,
        nbInscrits: r.nbInscrits,
        nbMax: r.nbMax,
        dispo: Math.max(0, (r.nbMax ?? 0) - (r.nbInscrits ?? 0))
      }));
      return new Response(
        JSON.stringify({
          tabagns,
          currentVariant: optionsData.bus_variant ?? null,
          variants
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders() } }
      );
    }

    if (action === "reserve") {
      const desired = (body?.variant ?? "") as string;
      if (!desired || !["calme", "anims", "anims+"].includes(desired)) {
        return new Response(JSON.stringify({ error: "Variant invalide (calme | anims | anims+)" }), { status: 400, headers: corsHeaders() });
      }

      const currentVariant = optionsData.bus_variant as string | null;

      // If switching, decrement old one first
      if (currentVariant && normalize(currentVariant) !== normalize(desired)) {
        const { data: oldRow } = await supabase
          .from("busPlaceVariant")
          .select("nbInscrits")
          .eq("tabagns", tabagns)
          .eq("variant", currentVariant)
          .maybeSingle();
        if (oldRow && typeof oldRow.nbInscrits === "number" && oldRow.nbInscrits > 0) {
          await supabase
            .from("busPlaceVariant")
            .update({ nbInscrits: oldRow.nbInscrits - 1 })
            .eq("tabagns", tabagns)
            .eq("variant", currentVariant);
        }
      }

      // Try to increment desired variant if capacity allows
      const { data: newRow, error: newErr } = await supabase
        .from("busPlaceVariant")
        .select("nbInscrits, nbMax")
        .eq("tabagns", tabagns)
        .eq("variant", desired)
        .maybeSingle();
      if (newErr) throw newErr;
      if (!newRow) {
        return new Response(JSON.stringify({ error: "Bus introuvable pour ce tabagns/variant" }), { status: 404, headers: corsHeaders() });
      }
      const canTake = (newRow.nbMax ?? 0) - (newRow.nbInscrits ?? 0) > 0;
      if (!canTake) {
        return new Response(JSON.stringify({ error: "Ce bus est complet pour ton tabagns." }), { status: 409, headers: corsHeaders() });
      }

      // Increment chosen bus
      await supabase
        .from("busPlaceVariant")
        .update({ nbInscrits: (newRow.nbInscrits ?? 0) + 1 })
        .eq("tabagns", tabagns)
        .eq("variant", desired);

      // Update user's option with chosen variant
      const { error: optErr } = await supabase
        .from("options")
        .update({ bus_variant: desired })
        .eq("id", userId);
      if (optErr) throw optErr;

      return new Response(JSON.stringify({ success: true, tabagns, variant: desired }), { status: 200, headers: corsHeaders() });
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
