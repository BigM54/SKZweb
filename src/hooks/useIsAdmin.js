import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: {user} } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        setIsAdmin(false);
        return;
      }

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
  }, []);

  return { isAdmin };
}
