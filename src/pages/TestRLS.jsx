// pages/TestRLS.jsx
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser, useAuth } from "@clerk/clerk-react";

const { getToken } = useAuth();
const { user } = useUser();

const tables = [
  "AdminList",
  "anims",
  "busPlace",
  "cousin",
  "datePaiement",
  "dateShotgun",
  "options",
  "Paiements",
  "profils"
];

export default function TestRLS() {
  const [dataMap, setDataMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const token = await getToken({ template: 'supabase' });
      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      if (!user?.primaryEmailAddress?.emailAddress) return;
      const email = user.primaryEmailAddress.emailAddress;

      // Récupère options, acompte, profils et dateShotgun en parallèle

        const { data, error } = await supabase
            .from(table)
            .select("*")
            .limit(5); // juste un aperçu
            
            results[table] = {
            success: !error,
            rows: data || [],
            error: error ? error.message : null
            };
    }
    setDataMap(results);
    setLoading(false);
    fetchData();
  }, [user, getToken]);


  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Test RLS - Access Check</h1>
      <p>Cette page affiche les informations accessibles pour l’utilisateur courant.</p>
      {tables.map((table) => (
        <div key={table} style={{ marginBottom: "2rem" }}>
          <h2>{table}</h2>
          {dataMap[table].success ? (
            dataMap[table].rows.length > 0 ? (
              <table border="1" cellPadding="5">
                <thead>
                  <tr>
                    {Object.keys(dataMap[table].rows[0]).map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataMap[table].rows.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i}>{JSON.stringify(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Accès OK, mais table vide ou pas de lignes autorisées pour cet utilisateur.</p>
            )
          ) : (
            <p style={{ color: "red" }}>Erreur d’accès : {dataMap[table].error}</p>
          )}
        </div>
      ))}
    </div>
  );
}
