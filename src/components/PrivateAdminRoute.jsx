import React, { useEffect, useState } from 'react'
import { auth, database } from '../credenciales'
import { onAuthStateChanged } from 'firebase/auth'
import { ref, get } from 'firebase/database'
import { Navigate } from 'react-router-dom'

export default function PrivateAdminRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const snapshot = await get(ref(database, 'usuarios/' + user.uid + '/rol'))
        const rol = snapshot.val()
        setIsAdmin(rol === 'admin')
      } catch {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  if (loading) return <p>Cargando...</p>
  if (!isAdmin) return <Navigate to="/home" replace />
  return children
}
