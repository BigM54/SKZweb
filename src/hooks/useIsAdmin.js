import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';


export default function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const { getToken, userId } = useAuth();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!userId) {
        setIsAdmin(false);
        return;
      }

      const token = await getToken({ template: 'supabase' });

      const supabase = createClient('https://vwwnyxyglihmsabvbmgs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d255eHlnbGlobXNhYnZibWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUyOTYsImV4cCI6MjA2NTIzMTI5Nn0.cSj6J4XFwhP9reokdBqdDKbNgl03ywfwmyBbx0J1udw', {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const { data, error } = await supabase
        .from('AdminList')
        .select('id')
        .eq('id', userId)
        .single();

      if (error || !data) {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
    };

    checkAdmin();
  }, [getToken, userId]);

  return { isAdmin };
}
