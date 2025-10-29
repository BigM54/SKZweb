import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jwtVerify } from "https://deno.land/x/jose@v4.14.4/index.ts";
function calculerMontant(form) {
  const prix = {
    base: form.pack_archisPeks === 'oui' ? 495 : 445,
    pack_location: {
      snowboard: { bronze: 68, argent: 85, or: 108, platine: 142 },
      ski: { bronze: 68, argent: 85, or: 108, platine: 142 },
      chaussures: { bronze: 51, argent: 73, or: 94, platine: 127 },
      "ski + chaussures": { bronze: 75, argent: 95, or: 112, platine: 147 },
      "snow + chaussures": { bronze: 75, argent: 95, or: 112, platine: 147 }
    },
    casque: { oui: 28, non: 0 },
  type_forfait: { standard: 0, 'étendu (+ 200km)': 50 },
    assurance: { aucune: 0, zen: 38, skieur: 37, 'zen+skieur': 55 },
    masque: { oui: 37, non: 0 },
    pack_fumeur: { oui: 8, non: 0 },
    pack_soiree: { oui: 14, non: 0 },
    pack_grand_froid: { oui: 14, non: 0 },
    pack_jeux: { oui: 14, non: 0 },
    pain: 10,
    croissant: 9.5,
    pain_choco: 9.5,
    saucisson: 13,
    fromage: 14,
    biere: {
      'aucun': 0,
      'Blonde + Génép + Myrtille': 9,
      'Blonde + Ambrée + Blanche': 9,
      'Les 2 packs': 17
    },
    bus: {
      non: 0,
      sibers: 120,
      kin: 110,
      cluns: 100,
      p3: 140,
      boquette: 125,
      bordels: 125,
      birse: 125,
      chalons: 110
    }
  };
  const total = prix.base
    + (prix.pack_location[form.materiel_location]?.[form.pack_location] || 0)
    + (prix.casque[form.casque] || 0)
    + (prix.type_forfait[form.type_forfait] || 0)
    + (prix.assurance[form.assurance] || 0)
    + (prix.masque[form.masque] || 0)
    + (prix.pack_fumeur[form.pack_fumeur] || 0)
    + (prix.pack_soiree[form.pack_soiree] || 0)
    + (prix.pack_grand_froid[form.pack_grand_froid] || 0)
    + (prix.pack_jeux && form.pack_jeux === 'oui' ? prix.pack_jeux.oui : 0)
    + parseInt(form.pain || '0') * prix.pain
    + parseInt(form.croissant || '0') * prix.croissant
    + parseInt(form.pain_choco || '0') * prix.pain_choco
    + parseInt(form.saucisson || '0') * prix.saucisson
    + parseInt(form.fromage || '0') * prix.fromage
    + (prix.biere[form.biere] || 0)
    + (prix.bus[form.bus] || 0);
  return total;
}
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return new Response('Missing token', {
    status: 401
  });
  try {
    const rawForm = await req.json();
    // On retire le champ etudiantArchi si présent
    const { etudiantArchi, ...form } = rawForm;
    if (form.materiel_location === "aucun") {
      form.pack_location = "aucun";
    }
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return new Response('Missing token', {
      status: 401
    });
    // Vérifie le token JWT en HS256 avec la clé secrète Supabase
    const secret = Deno.env.get("JWT_SECRET_SUPABASE");
    if (!secret) {
      return new Response("Clé secrète JWT manquante", { status: 500 });
    }
    let payload;
    try {
      const verified = await jwtVerify(token, new TextEncoder().encode(secret), {
        algorithms: ["HS256"]
      });
      payload = verified.payload;
    } catch (err) {
      return new Response("Token JWT invalide", { status: 401 });
    }
    const userId = payload.sub;
    const userEmail = payload.email;
    if (!userId || !userEmail) {
      return new Response("Token JWT invalide : utilisateur ou email absent", {
        status: 401
      });
    }
  // @ts-ignore
    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    // Récupère proms et peks dans profils, promsConscrits dans dateShotgun
    const { data: profilData } = await supabase.from('profils').select('proms, peks').eq('email', userEmail).single();
    const { data: shotgunData } = await supabase.from('dateShotgun').select('promsConscrits').single();
    let pack_archisPeks = 'non';
    if (profilData && shotgunData) {
      const promoUser = Number(profilData.proms);
      const promoConscrits = Number(shotgunData.promsConscrits);
      // Si archi étudiant ou peks alors "oui", sinon "non"
      if (profilData.peks === true) {
        pack_archisPeks = 'oui';
      } else if (promoUser <= promoConscrits - 3 && etudiantArchi === 'oui') {
        pack_archisPeks = 'oui';
      }
    }
    form.pack_archisPeks = pack_archisPeks;
    const montant = calculerMontant(form);

    // Vérifie si l'acompte est payé avant de valider les choix
    const { data: acompteData, error: acompteError } = await supabase.from("Paiements").select("acompteStatut, dateAcompte").eq("email", userEmail).single();
    if (acompteError) throw acompteError;
    if (!acompteData || acompteData.acompteStatut !== true) {
      return new Response(JSON.stringify({
        error: "Acompte non payé. Merci de payer l'acompte avant de valider tes choix."
      }), {
        status: 403,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    // Vérifie la dateAcompte
    if (acompteData.dateAcompte) {
      // Nouvelle logique : date limite fixe
      const now = new Date();
      const deadline = new Date('2025-10-25T02:00:00.000Z');
      if (now > deadline) {
        return new Response(JSON.stringify({
          error: "Il n'est plus possible de modifier tes options ou le montant du paiement (date limite atteinte)."
        }), {
          status: 403,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }
    // mise à jour du montant dans la table Paiements
    const { error: updateError } = await supabase.from("Paiements").upsert({
      email: userEmail,
      paiement3Montant: montant - 425
    }).eq("email", userEmail);
    if (updateError) {
      throw updateError;
    }
    const { data: oldOptions } = await supabase.from('options').select('bus').eq('id', userId).single();
    const oldBus = oldOptions?.bus || null;
    const newBus = form.bus;
    // Si l'utilisateur change de bus
    if (oldBus && oldBus !== 'non' && oldBus !== newBus) {
      // -1 sur l'ancien bus
      const { data: oldBusRow } = await supabase.from('busPlace').select('nbInscrits').eq('tabagns', oldBus).single();
      if (oldBusRow) {
        await supabase.from('busPlace').update({ nbInscrits: Math.max(0, oldBusRow.nbInscrits - 1) }).eq('tabagns', oldBus);
      }
    }
    // +1 sur le nouveau bus
    if (newBus && newBus !== 'non' && oldBus !== newBus) {
      const { data: newBusRow } = await supabase.from('busPlace').select('nbInscrits').eq('tabagns', newBus).single();
      if (newBusRow) {
        await supabase.from('busPlace').update({ nbInscrits: newBusRow.nbInscrits + 1 }).eq('tabagns', newBus);
      }
    }
    // Mise à jour des options
    const { error: optionsError } = await supabase.from('options').upsert({
      ...form,
      id: userId
    });
    if (optionsError) throw optionsError;
    return new Response(JSON.stringify({
      success: true,
      montant
    }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (e) {
    console.error("Erreur serveur:", e);
    let message = '';
    if (e instanceof Error) message = e.message;
    else if (typeof e === 'object' && e !== null && 'message' in e) message = e.message;
    else message = JSON.stringify(e);
    return new Response(JSON.stringify({
      error: message
    }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});
export const config = {
  runtime: "edge",
  // ⛔ ceci empêche Supabase de vérifier automatiquement les tokens
  auth: false
};
