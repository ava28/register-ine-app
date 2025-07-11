import React, { useState } from 'react'
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import { auth } from '../credenciales'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      await signInWithEmailAndPassword(auth, email.trim(), password)
      navigate('/home')  // 🔁 Redirección después de login
    } catch (error) {
      console.error(error.code, error.message)
      alert('Error al iniciar sesión: ' + error.message)
    }
  }

  const handleResetPassword = async () => {
    if (!email) return alert('Primero escribe tu correo para restablecer tu contraseña.')
    try {
      await sendPasswordResetEmail(auth, email)
      alert('Se envió un correo para restablecer tu contraseña.')
    } catch (error) {
      alert('Error al enviar correo: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Recordarme
            </label>
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-blue-500 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl transition duration-300"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
