import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
serve(async (req)=>{
  // Vérification du secret dans l'URL
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("Unauthorized", {
      status: 401
    });
  }
  try {
    const rawBody = await req.text();
    const parsed = JSON.parse(rawBody);
    const eventType = parsed?.eventType;
    if (eventType !== "Payment") {
      console.warn("❌ Ignored: eventType n'est pas Payment");
      return new Response("Ignored", {
        status: 200
      });
    }
    let email = parsed?.data?.payer?.email;
    if (!email) {
      console.error("❌ Email manquant dans le payload");
      return new Response("Bad Request: missing email", {
        status: 400
      });
    }
    email = email.toLowerCase();
    const formSlug = parsed?.data?.order?.formSlug;
    const amountReceivedCents = parsed?.data?.amount; // montant payé reçu en centimes
    const amountReceived = amountReceivedCents ? amountReceivedCents / 100 : 0; // conversion en euros
    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    let updateData = {};
    // target table for the upsert (default to Paiements)
    let tableTarget = "Paiements";
    switch(formSlug){
      case "paiement-skz":
        updateData = {
          acompteStatut: true
        };
        break;
      case "1er-echelon-skz":
        updateData = {
          paiement1Statut: true
        };
        break;
      case "paiement-2-skz":
        updateData = {
          paiement2Statut: true
        };
        break;
      case "paiement-3-skz":
        // On met à jour paiement3Recu, on récupère paiement3Montant pour vérifier
        // Attention : ici on doit d'abord récupérer paiement3Montant avant update
        {
          // Récupérer paiement3Montant existant
          const { data: existingRow, error: selectError } = await supabase.from("Paiements").select("paiement3Montant").eq("email", email).single();
          if (selectError) {
            console.error("❌ Erreur de récupération paiement3Montant:", selectError.message);
            return new Response("Erreur serveur", {
              status: 500
            });
          }
          const paiement3Montant = existingRow?.paiement3Montant ?? 0;
          const fraude = paiement3Montant !== amountReceived;
          updateData = {
            paiement3Recu: amountReceived,
            Fraude: fraude
          };
        }
        break;
      case "resto-biprom-s-skz":
        // For resto payments we mark the `resto` flag in the Paiements table
        updateData = {
          resto: true
        };
        // keep tableTarget = "Paiements"
        break;
      default:
        console.warn("❌ Formulaire non géré:", formSlug);
        return new Response("Formulaire ignoré", {
          status: 200
        });
    }
    // Mettre à jour la ligne existante ou insérer si inexistante
    // Ici on tente un UPSERT via .upsert() avec la clé email
    const { error } = await supabase.from(tableTarget).upsert({
      email,
      ...updateData
    }, {
      onConflict: "email"
    });
    if (error) {
      console.error("❌ Erreur Supabase:", error.message);
      return new Response("Erreur Supabase", {
        status: 500
      });
    }
    return new Response("OK", {
      status: 200
    });
  } catch (err) {
    console.error("❌ Erreur de traitement:", err);
    return new Response("Erreur serveur", {
      status: 500
    });
  }
});
