// supabase/functions/helloasso-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const rawBody = await req.text();
    console.log("📦 Raw payload:", rawBody);

    const parsed = JSON.parse(rawBody);
    console.log("🔍 Parsed JSON:", parsed);

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

    const { error } = await supabase.from("Acompte").insert({ email });

    if (error) {
      console.error("❌ Erreur Supabase:", error.message);
      return new Response("Erreur Supabase", { status: 500 });
    }

    console.log(`✅ Email ${email} enregistré dans Acompte`);
    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("❌ Erreur de traitement:", err);
    return new Response("Erreur serveur", { status: 500 });
  }
});
