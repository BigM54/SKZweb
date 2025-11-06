import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jwtVerify } from "https://deno.land/x/jose@v4.14.4/index.ts";

type Action = "get_state" | "create_group" | "update_prefs" | "list_rooms" | "choose_room";

type CreateGroupBody = {
  action: Action;
  residents: Array<string | null>; // [resident1, resident2, resident3, resident4]
};

type UpdatePrefsBody = {
  action: Action;
  ambiance?: "calme" | "anims" | "anims+";
  tabagns?: string;
};

type ChooseRoomBody = {
  action: Action;
  kgibs: string; // room identifier
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
  if (!token) return new Response(JSON.stringify({ error: "Missing token" }), { status: 401, headers: corsHeaders() });

  try {
    const secret = Deno.env.get("JWT_SECRET_SUPABASE");
    if (!secret) return new Response(JSON.stringify({ error: "Missing JWT secret" }), { status: 500, headers: corsHeaders() });

    let payload: any;
    try {
      const verified = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
      payload = verified.payload;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JWT" }), { status: 401, headers: corsHeaders() });
    }

    const userId = payload.sub as string;
    const userEmail = payload.email as string;
    if (!userId || !userEmail) return new Response(JSON.stringify({ error: "Invalid JWT payload" }), { status: 401, headers: corsHeaders() });

    // @ts-ignore
    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    const body = (await req.json()) as (CreateGroupBody | UpdatePrefsBody | ChooseRoomBody | { action: Action }) | undefined;
    const action = (body?.action ?? "get_state") as Action;

    // Helper: find the group where user participates (any column)
    const findUserGroup = async () => {
      const { data, error } = await supabase
        .from("residence")
        .select("id, responsable, resident1, resident2, resident3, resident4, kgibs, ambiance, tabagns")
        .or(`responsable.eq.${userId},resident1.eq.${userId},resident2.eq.${userId},resident3.eq.${userId},resident4.eq.${userId}`)
        .maybeSingle();
      if (error) throw error;
      return data as any | null;
    };

    if (action === "get_state") {
      const group = await findUserGroup();
      return new Response(JSON.stringify({ group }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders() } });
    }

  if (action === "create_group") {
      // Only create if the user is not already in any group (any column)
      const existing = await findUserGroup();
      if (existing) {
        return new Response(JSON.stringify({ error: "Tu appartiens déjà à un groupe de résidence." }), { status: 409, headers: corsHeaders() });
      }

      const residentsRaw = (body as CreateGroupBody)?.residents ?? [];
      // Must provide exactly 4 non-empty resident IDs
      if (residentsRaw.length !== 4 || residentsRaw.some(r => !r || String(r).trim() === "")) {
        return new Response(JSON.stringify({ error: "Tu dois renseigner les 4 résidents (IDs obligatoires)." }), { status: 400, headers: corsHeaders() });
      }
      const residents = residentsRaw.map(r => String(r).trim());
      // None of residents can be the responsable
      if (residents.includes(userId)) {
        return new Response(JSON.stringify({ error: "Ton ID ne peut pas apparaître dans la liste des résidents." }), { status: 400, headers: corsHeaders() });
      }
      // All distinct
      const uniqueCount = new Set(residents).size;
      if (uniqueCount !== residents.length) {
        return new Response(JSON.stringify({ error: "Chaque résident doit être unique (pas de doublon)." }), { status: 400, headers: corsHeaders() });
      }

      // Build members including responsable for conflict check
      const members = [userId, ...residents];
      // Check none of these members are present in any column in any row
      const orParts = ["responsable", "resident1", "resident2", "resident3", "resident4"].flatMap((col) => members.map((m) => `${col}.eq.${m}`));
      const { data: conflicts, error: confErr } = await supabase
        .from("residence")
        .select("id, responsable, resident1, resident2, resident3, resident4")
        .or(orParts.join(","));
      if (confErr) throw confErr;
      if (conflicts && conflicts.length > 0) {
        return new Response(JSON.stringify({ error: "Un ou plusieurs membres sont déjà dans un autre groupe." }), { status: 409, headers: corsHeaders() });
      }

      const payload: any = { responsable: userId };
      ["resident1", "resident2", "resident3", "resident4"].forEach((key, i) => {
        payload[key] = residents[i];
      });
      const { error: insErr } = await supabase.from("residence").insert(payload);
      if (insErr) throw insErr;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders() });
    }

    if (action === "update_prefs") {
      const group = await findUserGroup();
      if (!group) return new Response(JSON.stringify({ error: "Aucun groupe trouvé." }), { status: 404, headers: corsHeaders() });
      if (group.responsable !== userId) return new Response(JSON.stringify({ error: "Seul le responsable peut modifier les préférences." }), { status: 403, headers: corsHeaders() });

      const ambiance = (body as UpdatePrefsBody)?.ambiance;
      const tabagns = (body as UpdatePrefsBody)?.tabagns;
      const update: any = {};
      if (ambiance) update.ambiance = ambiance;
      if (tabagns) update.tabagns = tabagns;
      if (Object.keys(update).length === 0) return new Response(JSON.stringify({ error: "Aucun changement." }), { status: 400, headers: corsHeaders() });

      const { error: upErr } = await supabase.from("residence").update(update).eq("id", group.id);
      if (upErr) throw upErr;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders() });
    }

    if (action === "list_rooms") {
      const group = await findUserGroup();
      if (!group) return new Response(JSON.stringify({ error: "Aucun groupe trouvé." }), { status: 404, headers: corsHeaders() });
      const ambiance = group.ambiance;
      const tabagns = group.tabagns;
      // Fetch already taken kgibs
      const { data: taken } = await supabase.from("residence").select("kgibs").not("kgibs", "is", null);
      const takenSet = new Set((taken ?? []).map((r: any) => r.kgibs));
      // Fetch candidate rooms from 'chambres' filtered by prefs
      const { data: rooms, error: roomErr } = await supabase
        .from("chambres")
        .select("kgibs, ambiance, tabagns")
        .eq("ambiance", ambiance)
        .eq("tabagns", tabagns);
      if (roomErr) throw roomErr;
      const available = (rooms ?? []).filter((r: any) => !takenSet.has(r.kgibs));
      return new Response(JSON.stringify({ available }), { status: 200, headers: corsHeaders() });
    }

    if (action === "choose_room") {
      const group = await findUserGroup();
      if (!group) return new Response(JSON.stringify({ error: "Aucun groupe trouvé." }), { status: 404, headers: corsHeaders() });
      if (group.responsable !== userId) return new Response(JSON.stringify({ error: "Seul le responsable peut choisir la chambre." }), { status: 403, headers: corsHeaders() });
      const kgibs = (body as ChooseRoomBody)?.kgibs;
      if (!kgibs) return new Response(JSON.stringify({ error: "kgibs manquant" }), { status: 400, headers: corsHeaders() });

      // Check not already taken
      const { data: exists, error: exErr } = await supabase
        .from("residence")
        .select("id")
        .eq("kgibs", kgibs)
        .maybeSingle();
      if (exErr) throw exErr;
      if (exists) return new Response(JSON.stringify({ error: "Cette chambre est déjà prise." }), { status: 409, headers: corsHeaders() });

      const { error: upErr } = await supabase.from("residence").update({ kgibs }).eq("id", group.id);
      if (upErr) throw upErr;
      return new Response(JSON.stringify({ success: true, kgibs }), { status: 200, headers: corsHeaders() });
    }

    return new Response(JSON.stringify({ error: "Action inconnue" }), { status: 400, headers: corsHeaders() });
  } catch (e) {
    console.error("residence error", e);
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: corsHeaders() });
  }
});

export const config = {
  runtime: "edge",
  auth: false
};
