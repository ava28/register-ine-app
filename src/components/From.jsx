// src/components/From.jsx
import { useState } from 'react'
import { auth, database } from '../credenciales'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { ref, set } from 'firebase/database'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

export default function From() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
    rol: '',
  })

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )
      const user = userCredential.user

      await set(ref(database, 'usuarios/' + user.uid), {
        email: formData.email,
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        rol: formData.rol,
      })


      // Redirigir a la vista de usuarios
      navigate('/home')

    } catch (error) {
      alert('Error al registrar: ' + error.message)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Registrar</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {[
              { label: 'Correo electrónico', name: 'email', type: 'email', placeholder: 'correo@ejemplo.com' },
              { label: 'Contraseña', name: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'Nombre', name: 'nombre', type: 'text', placeholder: 'Tu nombre' },
              { label: 'Apellido', name: 'apellido', type: 'text', placeholder: 'Tu apellido' },
              { label: 'Teléfono', name: 'telefono', type: 'text', placeholder: '614-XXX-XXXX' },
            ].map((input) => (
              <div key={input.name}>
                <label className="block text-sm font-medium text-gray-700">{input.label}</label>
                <input
                  type={input.type}
                  name={input.name}
                  value={formData[input.name]}
                  onChange={handleChange}
                  placeholder={input.placeholder}
                  required
                  className="mt-1 block w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}

            {/* Select rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona un rol</option>
                <option value="agente">Agente</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl transition"
            >
              Registrar
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
