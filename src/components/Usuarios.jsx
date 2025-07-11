import { useEffect, useState } from 'react'
import { database, auth } from '../credenciales'
import { ref, onValue, get, child } from 'firebase/database'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import Navbar from './Navbar'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Validar rol admin
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login')
        return
      }
      const rolSnap = await get(child(ref(database), `usuarios/${user.uid}/rol`))
      const rol = rolSnap.val()
      if (rol !== 'admin') {
        alert('No tienes permiso para ver esta página')
        navigate('/home')
      } else {
        // Cargar usuarios
        const usuariosRef = ref(database, 'usuarios')
        onValue(usuariosRef, (snapshot) => {
          const data = snapshot.val()
          if (data) {
            const lista = Object.entries(data).map(([uid, userData]) => ({
              uid,
              ...userData,
            }))
            setUsuarios(lista)
          } else {
            setUsuarios([])
          }
          setLoading(false)
        })
      }
    })
    return () => unsubscribe()
  }, [navigate])

  if (loading) return <p className="text-center mt-10">Cargando usuarios...</p>

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Lista de Usuarios</h1>
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 border-b">Correo</th>
              <th className="text-left px-4 py-2 border-b">Nombre</th>
              <th className="text-left px-4 py-2 border-b">Apellido</th>
              <th className="text-left px-4 py-2 border-b">Teléfono</th>
              <th className="text-left px-4 py-2 border-b">Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(({ uid, email, nombre, apellido, telefono, rol }) => (
              <tr key={uid} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{email}</td>
                <td className="px-4 py-2 border-b">{nombre}</td>
                <td className="px-4 py-2 border-b">{apellido}</td>
                <td className="px-4 py-2 border-b">{telefono}</td>
                <td className="px-4 py-2 border-b capitalize">{rol}</td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
