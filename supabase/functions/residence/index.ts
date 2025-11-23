import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jwtVerify } from "https://deno.land/x/jose@v4.14.4/index.ts";
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
}
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders()
    });
  }
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return new Response(JSON.stringify({
    error: "Missing token"
  }), {
    status: 401,
    headers: corsHeaders()
  });
  try {
    const secret = Deno.env.get("JWT_SECRET_SUPABASE");
    if (!secret) return new Response(JSON.stringify({
      error: "Missing JWT secret"
    }), {
      status: 500,
      headers: corsHeaders()
    });
    let payload;
    try {
      const verified = await jwtVerify(token, new TextEncoder().encode(secret), {
        algorithms: [
          "HS256"
        ]
      });
      payload = verified.payload;
    } catch  {
      return new Response(JSON.stringify({
        error: "Invalid JWT"
      }), {
        status: 401,
        headers: corsHeaders()
      });
    }
    const userId = payload.sub;
    const userEmail = payload.email;
    if (!userId || !userEmail) return new Response(JSON.stringify({
      error: "Invalid JWT payload"
    }), {
      status: 401,
      headers: corsHeaders()
    });
    // @ts-ignore
    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    const body = await req.json();
    const action = body?.action ?? "get_state";
    // Helper: find the group where user participates (any column)
    const findUserGroup = async ()=>{
      const { data, error } = await supabase.from("residence").select("responsable, resident1, resident2, resident3, resident4, kgibs").or(`responsable.eq.${userId},resident1.eq.${userId},resident2.eq.${userId},resident3.eq.${userId},resident4.eq.${userId}`).maybeSingle();
      if (error) throw error;
      return data;
    };
    if (action === "get_state") {
      const group = await findUserGroup();
      if (!group) {
        return new Response(JSON.stringify({ group: null }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders() }
        });
      }
      // Enrichir avec prenom/nom depuis profils si disponible
      const ids = [group.responsable, group.resident1, group.resident2, group.resident3, group.resident4].filter(Boolean);
      let map = {} as Record<string, { prenom?: string; nom?: string; tabagns?: string | null }>;
      let allP3 = false;
      let computedGroupe: string | null = null;
      if (ids.length) {
        const { data: profs } = await supabase.from('profils').select('id, prenom, nom, tabagns, peks, proms').in('id', ids);
        const tabs: string[] = [];
        (profs || []).forEach((p: any) => {
          map[p.id] = { prenom: p.prenom, nom: p.nom, tabagns: p.tabagns };
          if (p.tabagns) tabs.push(String(p.tabagns).toLowerCase());
        });
        allP3 = tabs.length > 0 && tabs.every(t => t === 'p3');
        // Calculer le groupe attribué (même logique que list_rooms)
        const normalize = (t: string | null | undefined) => {
          const v = (t || '').toString().toLowerCase();
          const allowed = ['sibers','chalons','cluns','intertbk','kin','boquette','bordels','archis','peks'];
          if (allowed.includes(v)) return v;
          if (v === 'p3') return null;
          return 'intertbk';
        };
        const tabsAll = ((profs || []) as any[]).map(p => (p.tabagns || '').toString().toLowerCase());
        const nonP3Tabs = tabsAll.filter(t => t && t !== 'p3');
        const uniqNonP3 = Array.from(new Set(nonP3Tabs));
        // If any non-P3 tab has at least 3 members, prefer that tab (handles cases like 3 vs 2 different tabs)
        const tabCounts: Record<string, number> = {};
        nonP3Tabs.forEach(t => { tabCounts[t] = (tabCounts[t] || 0) + 1; });
        const tabWithThreeOrMore = Object.entries(tabCounts).sort((a,b)=>b[1]-a[1])[0];
        const peksCount = ((profs || []) as any[]).filter(p => p.peks === true).length;
        let promsConscrits: number | null = null;
        const { data: ds } = await supabase.from('dateShotgun').select('promsConscrits').maybeSingle();
        if (ds && typeof ds.promsConscrits === 'number') promsConscrits = ds.promsConscrits;
        const olderCount = ((profs || []) as any[]).filter(p => typeof p.proms === 'number' && promsConscrits !== null && (p.proms + 2 < (promsConscrits as number))).length;
        if (!allP3) {
          if (peksCount > 2) {
            computedGroupe = 'peks';
          } else if (olderCount > 2) {
            computedGroupe = 'archis';
          } else if (tabWithThreeOrMore && tabWithThreeOrMore[1] >= 3) {
            computedGroupe = normalize(tabWithThreeOrMore[0]) || 'intertbk';
          } else if (uniqNonP3.length === 1) {
            computedGroupe = normalize(uniqNonP3[0]) || 'intertbk';
          } else if (uniqNonP3.length > 1) {
            computedGroupe = 'intertbk';
          } else {
            computedGroupe = 'intertbk';
          }
        } else {
          // Tous P3, groupe affiché par défaut si aucun choix enregistré: intertbk
          computedGroupe = 'intertbk';
        }
      }
      const members = [
        { role: 'responsable', id: group.responsable, ...map[group.responsable] },
        ...(group.resident1 ? [{ role: 'resident', id: group.resident1, ...map[group.resident1] }] : []),
        ...(group.resident2 ? [{ role: 'resident', id: group.resident2, ...map[group.resident2] }] : []),
        ...(group.resident3 ? [{ role: 'resident', id: group.resident3, ...map[group.resident3] }] : []),
        ...(group.resident4 ? [{ role: 'resident', id: group.resident4, ...map[group.resident4] }] : []),
      ];
      return new Response(JSON.stringify({ group: { ...group, members, allP3, computedGroupe } }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }
    if (action === "create_group") {
      // Only create if the user is not already in any group (any column)
      const existing = await findUserGroup();
      if (existing) {
        return new Response(JSON.stringify({
          error: "Tu appartiens déjà à un groupe de résidence."
        }), {
          status: 409,
          headers: corsHeaders()
        });
      }
      // Ensure userId not in any other row
      const { data: conflicts } = await supabase
        .from('residence')
        .select('responsable')
        .or(["responsable","resident1","resident2","resident3","resident4"].map(c=>`${c}.eq.${userId}`).join(','));
      if ((conflicts||[]).length>0) {
        return new Response(JSON.stringify({ error: "Tu es déjà dans un autre groupe." }), { status: 409, headers: corsHeaders() });
      }
      // Create empty group; residents will be added one by one
      const { error: insErr } = await supabase.from("residence").insert({ responsable: userId, resident1: null, resident2: null, resident3: null, resident4: null });
      if (insErr) throw insErr;
      return new Response(JSON.stringify({
        success: true
      }), {
        status: 200,
        headers: corsHeaders()
      });
    }
    if (action === "add_member") {
      const group = await findUserGroup();
      if (!group) return new Response(JSON.stringify({ error: "Aucun groupe trouvé." }), { status: 404, headers: corsHeaders() });
      if (group.responsable !== userId) return new Response(JSON.stringify({ error: "Seul le responsable peut ajouter un résident." }), { status: 403, headers: corsHeaders() });
      const memberId = String(body?.memberId || '').trim();
      if (!memberId) return new Response(JSON.stringify({ error: "memberId manquant" }), { status: 400, headers: corsHeaders() });
      if (memberId === userId) return new Response(JSON.stringify({ error: "Ton ID ne peut pas être ajouté comme résident." }), { status: 400, headers: corsHeaders() });
      const slots = [group.resident1, group.resident2, group.resident3, group.resident4];
      if (slots.every(Boolean)) return new Response(JSON.stringify({ error: "Groupe complet." }), { status: 409, headers: corsHeaders() });
      if (slots.includes(memberId)) return new Response(JSON.stringify({ error: "Ce membre est déjà dans le groupe." }), { status: 409, headers: corsHeaders() });
      const { data: conflicts2 } = await supabase
        .from('residence')
        .select('responsable')
        .or(["responsable","resident1","resident2","resident3","resident4"].map(c=>`${c}.eq.${memberId}`).join(','));
      if ((conflicts2||[]).length>0) return new Response(JSON.stringify({ error: "Ce membre est déjà dans un autre groupe." }), { status: 409, headers: corsHeaders() });
      const nextCol = ["resident1","resident2","resident3","resident4"].find(col => !group[col]);
      if (!nextCol) return new Response(JSON.stringify({ error: "Aucun emplacement libre." }), { status: 409, headers: corsHeaders() });
      const updateObj: any = {};
      updateObj[nextCol as string] = memberId;
      const { error: upErr } = await supabase.from('residence').update(updateObj).eq('responsable', group.responsable);
      if (upErr) throw upErr;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders() });
    }
    if (action === "remove_member") {
      const group = await findUserGroup();
      if (!group) return new Response(JSON.stringify({ error: "Aucun groupe trouvé." }), { status: 404, headers: corsHeaders() });
      if (group.responsable !== userId) return new Response(JSON.stringify({ error: "Seul le responsable peut retirer un résident." }), { status: 403, headers: corsHeaders() });
      const memberId = String(body?.memberId || '').trim();
      if (!memberId) return new Response(JSON.stringify({ error: "memberId manquant" }), { status: 400, headers: corsHeaders() });
      const update: any = {};
      ["resident1","resident2","resident3","resident4"].forEach(col => { if (group[col] === memberId) update[col] = null; });
      if (Object.keys(update).length === 0) return new Response(JSON.stringify({ error: "Ce résident n'est pas dans le groupe." }), { status: 404, headers: corsHeaders() });
      const { error: upErr } = await supabase.from('residence').update(update).eq('responsable', group.responsable);
      if (upErr) throw upErr;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders() });
    }
    if (action === "update_prefs") {
      const group = await findUserGroup();
      if (!group) return new Response(JSON.stringify({
        error: "Aucun groupe trouvé."
      }), {
        status: 404,
        headers: corsHeaders()
      });
      if (group.responsable !== userId) return new Response(JSON.stringify({
        error: "Seul le responsable peut modifier les préférences."
      }), {
        status: 403,
        headers: corsHeaders()
      });
      // Require full group before saving preferences
      const slotsCheckPrefs = [group.resident1, group.resident2, group.resident3, group.resident4];
      if (!slotsCheckPrefs.every(Boolean)) return new Response(JSON.stringify({ error: "Le groupe doit être complet avant d'enregistrer les préférences." }), { status: 403, headers: corsHeaders() });
      const ambiance = body?.ambiance;
      const incomingTab = body?.tabagns as string | undefined;
      // Validation: Only allow choosing tabagns if all members are P3 (but we don't persist it here)
      const idsForCheck = [group.responsable, group.resident1, group.resident2, group.resident3, group.resident4].filter(Boolean);
      let isAllP3 = false;
      let effectiveGroupe: string | null = null;
      if (idsForCheck.length) {
        const { data: profsAll } = await supabase.from('profils').select('id, tabagns, peks, proms').in('id', idsForCheck);
        const tabs = ((profsAll || []) as any[]).map(p => (p.tabagns || '').toString().toLowerCase()).filter(Boolean);
        isAllP3 = tabs.length > 0 && tabs.every(t => t === 'p3');
        const normalize = (t: string | null | undefined) => {
          const v = (t || '').toString().toLowerCase();
          const allowed = ['sibers','chalons','cluns','intertbk','kin','boquette','bordels','archis','peks'];
          if (allowed.includes(v)) return v;
          if (v === 'p3') return null;
          return 'intertbk';
        };
        const tabsAll = ((profsAll || []) as any[]).map(p => (p.tabagns || '').toString().toLowerCase());
        const nonP3Tabs = tabsAll.filter(t => t && t !== 'p3');
        const uniqNonP3 = Array.from(new Set(nonP3Tabs));
        const tabCountsAll: Record<string, number> = {};
        nonP3Tabs.forEach(t => { tabCountsAll[t] = (tabCountsAll[t] || 0) + 1; });
        const tabWithThreeOrMoreAll = Object.entries(tabCountsAll).sort((a,b)=>b[1]-a[1])[0];
        const peksCount = ((profsAll || []) as any[]).filter(p => p.peks === true).length;
        let promsConscrits: number | null = null;
        const { data: ds } = await supabase.from('dateShotgun').select('promsConscrits').maybeSingle();
        if (ds && typeof ds.promsConscrits === 'number') promsConscrits = ds.promsConscrits;
        const olderCount = ((profsAll || []) as any[]).filter(p => typeof p.proms === 'number' && promsConscrits !== null && (p.proms + 2 < (promsConscrits as number))).length;
        if (!isAllP3) {
          if (peksCount > 2) {
            effectiveGroupe = 'peks';
          } else if (olderCount > 2) {
            effectiveGroupe = 'archis';
          } else if (tabWithThreeOrMoreAll && tabWithThreeOrMoreAll[1] >= 3) {
            effectiveGroupe = normalize(tabWithThreeOrMoreAll[0]) || 'intertbk';
          } else if (uniqNonP3.length === 1) {
            effectiveGroupe = normalize(uniqNonP3[0]) || 'intertbk';
          } else if (uniqNonP3.length > 1) {
            effectiveGroupe = 'intertbk';
          } else {
            effectiveGroupe = 'intertbk';
          }
        } else {
          effectiveGroupe = normalize(incomingTab) || 'intertbk';
        }
      }
      return new Response(JSON.stringify({ success: true, allP3: isAllP3, computedGroupe: effectiveGroupe, ambiance: ambiance || null }), { status: 200, headers: corsHeaders() });
    }
    if (action === "list_rooms") {
      const group = await findUserGroup();
      if (!group) return new Response(JSON.stringify({
        error: "Aucun groupe trouvé."
      }), {
        status: 404,
        headers: corsHeaders()
      });
      const slotsCheck = [group.resident1, group.resident2, group.resident3, group.resident4];
      if (!slotsCheck.every(Boolean)) return new Response(JSON.stringify({ error: "Le groupe doit être complet pour voir les chambres." }), { status: 403, headers: corsHeaders() });
      const ambiance = body?.ambiance as string | undefined;
      if (!ambiance) return new Response(JSON.stringify({ error: "Ambiance requise" }), { status: 400, headers: corsHeaders() });
      const memberIds = [group.responsable, group.resident1, group.resident2, group.resident3, group.resident4].filter(Boolean);
      const { data: profs } = await supabase.from('profils').select('id, tabagns, peks, proms').in('id', memberIds as any);
      const tabs = ((profs || []) as any[]).map(p => (p.tabagns || '').toString().toLowerCase());
      const nonP3Tabs = tabs.filter(t => t && t !== 'p3');
      const uniqNonP3 = Array.from(new Set(nonP3Tabs));
      const tabCountsRooms: Record<string, number> = {};
      nonP3Tabs.forEach(t => { tabCountsRooms[t] = (tabCountsRooms[t] || 0) + 1; });
      const tabWithThreeOrMoreRooms = Object.entries(tabCountsRooms).sort((a,b)=>b[1]-a[1])[0];
      const allP3 = tabs.length > 0 && tabs.every(t => t === 'p3');
      const peksCount = ((profs || []) as any[]).filter(p => p.peks === true).length;
      let promsConscrits: number | null = null;
      const { data: ds } = await supabase.from('dateShotgun').select('promsConscrits').maybeSingle();
      if (ds && typeof ds.promsConscrits === 'number') promsConscrits = ds.promsConscrits;
      const olderCount = ((profs || []) as any[]).filter(p => typeof p.proms === 'number' && promsConscrits !== null && (p.proms + 2 < (promsConscrits as number))).length;
      const normalize = (t: string | null | undefined) => {
        const v = (t || '').toString().toLowerCase();
        const allowed = ['sibers','chalons','cluns','intertbk','kin','boquette','bordels','archis','peks'];
        if (allowed.includes(v)) return v;
        if (v === 'p3') return null;
        return 'intertbk';
      };
      let targetGroupe: string | null = null;
      if (!allP3) {
        if (peksCount > 2) {
          targetGroupe = 'peks';
        } else if (olderCount > 2) {
          targetGroupe = 'archis';
        } else if (tabWithThreeOrMoreRooms && tabWithThreeOrMoreRooms[1] >= 3) {
          targetGroupe = normalize(tabWithThreeOrMoreRooms[0]) || 'intertbk';
        } else if (uniqNonP3.length === 1) {
          targetGroupe = normalize(uniqNonP3[0]) || 'intertbk';
        } else if (uniqNonP3.length > 1) {
          targetGroupe = 'intertbk';
        } else {
          targetGroupe = 'intertbk';
        }
      } else {
        // Tous P3: autoriser le tabagns envoyé, sinon intertbk
        const incomingTab = body?.tabagns as string | undefined;
        targetGroupe = normalize(incomingTab) || 'intertbk';
      }

  // Fetch already taken kgibs and normalize to string for robust comparison
  const { data: taken } = await supabase.from("residence").select("kgibs").not("kgibs", "is", null);
  const takenSet = new Set(((taken ?? []) as any[]).map((r: any)=> String(r.kgibs)));
      // Fetch candidate rooms from 'chambres' filtered by prefs (ambiance + groupe)
  const { data: rooms, error: roomErr } = await supabase.from("chambres").select("kgibs, ambiance, groupe, etage, cote").eq("ambiance", ambiance).eq("groupe", targetGroupe);
      if (roomErr) throw roomErr;
    const available = ((rooms ?? []) as any[]).filter((r: any)=> !takenSet.has(String(r.kgibs)));
      return new Response(JSON.stringify({
        available,
        computedGroupe: targetGroupe,
        ambiance
      }), {
        status: 200,
        headers: corsHeaders()
      });
    }
    if (action === "choose_room") {
      const group = await findUserGroup();
      if (!group) return new Response(JSON.stringify({
        error: "Aucun groupe trouvé."
      }), {
        status: 404,
        headers: corsHeaders()
      });
      if (group.responsable !== userId) return new Response(JSON.stringify({
        error: "Seul le responsable peut choisir la chambre."
      }), {
        status: 403,
        headers: corsHeaders()
      });
      const slotsCheck2 = [group.resident1, group.resident2, group.resident3, group.resident4];
      if (!slotsCheck2.every(Boolean)) return new Response(JSON.stringify({ error: "Le groupe doit être complet avant de choisir une chambre." }), { status: 403, headers: corsHeaders() });
      const kgibs = body?.kgibs;
      if (!kgibs) return new Response(JSON.stringify({
        error: "kgibs manquant"
      }), {
        status: 400,
        headers: corsHeaders()
      });
      // Check not already taken
      const { data: exists, error: exErr } = await supabase.from("residence").select("responsable").eq("kgibs", kgibs).maybeSingle();
      if (exErr) throw exErr;
      if (exists) return new Response(JSON.stringify({
        error: "Cette chambre est déjà prise."
      }), {
        status: 409,
        headers: corsHeaders()
      });
      const { error: upErr } = await supabase.from("residence").update({
        kgibs
      }).eq("responsable", group.responsable);
      if (upErr) throw upErr;
      return new Response(JSON.stringify({
        success: true,
        kgibs
      }), {
        status: 200,
        headers: corsHeaders()
      });
    }
    if (action === "delete_group") {
      const group = await findUserGroup();
      if (!group) return new Response(JSON.stringify({ error: "Aucun groupe trouvé." }), { status: 404, headers: corsHeaders() });
      if (group.responsable !== userId) return new Response(JSON.stringify({ error: "Seul le responsable peut supprimer le groupe." }), { status: 403, headers: corsHeaders() });
      const { error: delErr } = await supabase.from('residence').delete().eq('responsable', group.responsable);
      if (delErr) throw delErr;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders() });
    }
    return new Response(JSON.stringify({
      error: "Action inconnue"
    }), {
      status: 400,
      headers: corsHeaders()
    });
  } catch (e) {
    console.error("residence error", e);
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    return new Response(JSON.stringify({
      error: msg
    }), {
      status: 500,
      headers: corsHeaders()
    });
  }
});
export const config = {
  runtime: "edge",
  auth: false
};
