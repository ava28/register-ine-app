// src/components/RequireAuth.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth, database } from '../credenciales';
import { ref, get } from 'firebase/database';

export default function RequireAuth({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState('loading'); // 'loading', 'unauth', 'admin', 'agente'

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setStatus('unauth');
        return;
      }

      try {
        const snap = await get(ref(database, `usuarios/${user.uid}`));
        const userData = snap.val();

        if (userData?.rol === 'admin') {
          setStatus('admin');
        } else if (userData?.rol === 'agente') {
          setStatus('agente');
        } else {
          setStatus('unauth');
        }
      } catch (err) {
        console.error('Error cargando datos del usuario:', err);
        setStatus('unauth');
      }
    });

    return () => unsubscribe();
  }, []);

  if (status === 'loading') return <p className="text-center p-4">Cargando...</p>;
  if (status === 'unauth') return <Navigate to="/login" replace />;

  // Redirigir agente si intenta acceder a rutas de admin
  if (status === 'agente' && location.pathname !== '/registrarafiliacion') {
    return <Navigate to="/registrarafiliacion" replace />;
  }

  return children;
}
