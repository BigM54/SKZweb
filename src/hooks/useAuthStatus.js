import { useEffect, useState } from 'react'

export default function useAuthStatus () {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)

      try {
        const raw = localStorage.getItem('supabase.auth.token')
        if (!raw) {
          setUser(null)
          setLoading(false)
          return
        }

        const session = JSON.parse(raw)?.currentSession
        const token = session?.access_token

        if (!token) {
          setUser(null)
          setLoading(false)
          return
        }
        console.log('moooonstre')
        const res = await fetch(`https://vwwnyxyglihmsabvbmgs.supabase.co/auth/v1/user`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (res.status === 200) {
          const user = await res.json()
          setUser(user)
        } else {
          console.warn('Token invalide ou expiré, status:', res.status)
          setUser(null)
        }
      } catch (e) {
        console.error('Erreur de vérification d’auth:', e)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])
  return { user, loading }
}
