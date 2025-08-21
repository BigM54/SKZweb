import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "https://deno.land/x/jose@v4.14.4/index.ts";

function calculerMontant(form: any): number {
  const prix = {
    pack_location: { snowboard: { bronze: 68, argent: 88, or: 108, platine: 142 }, ski: { bronze: 68, argent: 88, or: 108, platine: 142 }, chaussures: { bronze: 51, argent: 73, or: 94, platine: 127 }, complet: { bronze: 75, argent: 92, or: 112, platine: 147 } },
    casque: { oui: 28, non: 0 },
    type_forfait: { standard: 0, étendu: 50 },
    assurance: { aucune: 0, zen: 38, skieur: 37, 'zen+skieur': 55 },
    masque: { oui: 48, non: 0 },
    pack_fumeur: { oui: 10, non: 0 },
    pack_soiree: { oui: 12, non: 0 },
    pack_grand_froid: { oui: 14, non: 0 },
    pain: 12, croissant: 10, pain_choco: 13,
    saucisson: 13, fromage: 15, biere: 12,
    bus: { non: 0, sibers: 125, kin: 115, cluns: 105, p3: 115, boquette: 130, bordels: 125, birse: 130, chalons: 120 }
  };

  const total =
    459+
    (prix.pack_location[form.materiel_location]?.[form.pack_location] || 0) +
    (prix.casque[form.casque] || 0) +
    (prix.type_forfait[form.type_forfait] || 0) +
    (prix.assurance[form.assurance] || 0) +
    (prix.masque[form.masque] || 0) +
    (prix.pack_fumeur[form.pack_fumeur] || 0) +
    (prix.pack_soiree[form.pack_soiree] || 0) +
    (prix.pack_grand_froid[form.pack_grand_froid] || 0) +
    (parseInt(form.pain || '0') * prix.pain) +
    (parseInt(form.croissant || '0') * prix.croissant) +
    (parseInt(form.pain_choco || '0') * prix.pain_choco) +
    (parseInt(form.saucisson || '0') * prix.saucisson) +
    (parseInt(form.fromage || '0') * prix.fromage) +
    (parseInt(form.biere || '0') * prix.biere) +
    (prix.bus[form.bus] || 0);


  return total;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return new Response('Missing token', { status: 401 });

  try {
    const form = await req.json();

    if (form.materiel_location === "aucun") {
      form.pack_location = "aucun";
    }

    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return new Response('Missing token', { status: 401 });

    // Vérifie le token Clerk
    const JWKS = createRemoteJWKSet(new URL('https://brave-platypus-78.clerk.accounts.dev/.well-known/jwks.json'));
    const { payload } = await jwtVerify(token, JWKS);
    const userId = payload.sub;
    const userEmail = payload.email;

    if (!userId || !userEmail) {
      return new Response("Invalid Clerk token", { status: 401 });
    }

    const montant = calculerMontant(form);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!  // Clé secrète serveur
    );

    // Vérifie si l'acompte est payé avant de valider les choix
    const { data: acompteData, error: acompteError } = await supabase
      .from("Paiements")
      .select("acompteStatut, dateAcompte")
      .eq("email", userEmail)
      .single();
    if (acompteError) throw acompteError;
    if (!acompteData || acompteData.acompteStatut !== true) {
      return new Response(JSON.stringify({ error: "Acompte non payé. Merci de payer l'acompte avant de valider tes choix." }), {
        status: 403,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }
    // Vérifie la dateAcompte
    if (acompteData.dateAcompte) {
      const acompteDate = new Date(acompteData.dateAcompte);
      const now = new Date();
      const diffDays = (now.getTime() - acompteDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        return new Response(JSON.stringify({ error: "Il n'est plus possible de modifier tes options ou le montant du paiement (plus de 7 jours depuis l'acompte)." }), {
          status: 403,
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    // mise à jour du montant dans la table Paiements
    const { error: updateError } = await supabase
      .from("Paiements")
      .upsert({ email : userEmail, paiement3Montant: (montant-450) })
      .eq("email", userEmail);

    if (updateError) {
      throw updateError;
    }

    const { error : optionsError } = await supabase.from('options').upsert({
      ...form,
      id: userId
    });
    if (optionsError) throw optionsError;

    return new Response(JSON.stringify({ success: true, montant }), {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    console.error("Erreur serveur:", e);
    return new Response(JSON.stringify({ error: e.message || e.toString() }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
});

export const config = {
  runtime: "edge",
  // ⛔ ceci empêche Supabase de vérifier automatiquement les tokens
  auth: false,
};

