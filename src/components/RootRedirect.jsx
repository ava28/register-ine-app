// src/components/RequireAuth.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, database } from '../credenciales';
import { ref, onValue } from 'firebase/database';

export default function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setRedirectTo('/login');
      setLoading(false);
      return;
    }

    const userRef = ref(database, `usuarios/${user.uid}`);
    onValue(userRef, (snap) => {
      const userData = snap.val();
      if (!userData) {
        setRedirectTo('/login');
      } else if (userData.rol === 'admin') {
        setAuthorized(true);
      } else if (userData.rol === 'agente') {
        setRedirectTo('/registrarafiliacion');
      } else {
        setRedirectTo('/login'); // Fallback
      }
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  if (redirectTo) return <Navigate to={redirectTo} replace />;

  return children;
}
