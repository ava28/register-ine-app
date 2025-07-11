// src/components/RootRedirect.jsx
import React, { useEffect, useState } from 'react'
import { auth } from '../credenciales'
import { onAuthStateChanged } from 'firebase/auth'
import { Navigate } from 'react-router-dom'

export default function RootRedirect() {
  const [checking, setChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user)
      setChecking(false)
    })
    return unsubscribe
  }, [])

  if (checking) {
    return <p>Cargando...</p>
  }

  return isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
}
