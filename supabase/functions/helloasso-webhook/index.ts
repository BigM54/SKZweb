// supabase/functions/helloasso-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const rawBody = await req.text();
    const parsed = JSON.parse(rawBody);

    const eventType = parsed?.eventType;
    const email = parsed?.data?.payer?.email;

    if (eventType !== "Payment") {
      console.warn("❌ Ignored: eventType n'est pas Payment");
      return new Response("Ignored", { status: 200 });
    }

    if (!email) {
      console.error("❌ Email manquant dans le payload");
      return new Response("Bad Request: missing email", { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("Paiements").insert({ email, paiement1Statut: true });

    if (error) {
      console.error("❌ Erreur Supabase:", error.message);
      return new Response("Erreur Supabase", { status: 500 });
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("❌ Erreur de traitement:", err);
    return new Response("Erreur serveur", { status: 500 });
  }
});
