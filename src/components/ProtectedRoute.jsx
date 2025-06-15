import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate('/login')
      else setUser(user)
    })
  }, [])

  return user
}
