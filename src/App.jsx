// src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import RootRedirect from './components/RootRedirect'
import RequireAuth from './components/RequireAuth'
import PrivateAdminRoute from './components/PrivateAdminRoute'

import Login from './components/Login'
import Home from './components/Home'
import RegistrarUsuario from './components/From'
import Usuarios from './components/Usuarios'
import AfiliadosForm from './components/AfiliadosForm'
import Afiliados from './components/Afiliados'
import RecuentoAfiliados from './components/RecuentoAfiliados'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas para todos los usuarios autenticados */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/registrarafiliacion"
          element={
            <RequireAuth>
              <AfiliadosForm />
            </RequireAuth>
          }
        />
        <Route
          path="/afiliados"
          element={
            <RequireAuth>
              <Afiliados />
            </RequireAuth>
          }
        />

        {/* Rutas protegidas SOLO para administradores */}
        <Route
          path="/registrar"
          element={
            <PrivateAdminRoute>
              <RegistrarUsuario />
            </PrivateAdminRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateAdminRoute>
              <Usuarios />
            </PrivateAdminRoute>
          }
        />
        <Route
          path="/recuentoafiliados"
          element={
            <PrivateAdminRoute>
              <RecuentoAfiliados />
            </PrivateAdminRoute>
          }
        />

        {/* Ruta comodín para cualquier URL no reconocida */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
