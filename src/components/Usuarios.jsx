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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn('🔒 Usuario no autenticado, redirigiendo a login...')
        navigate('/login')
        return
      }

      try {
        const rolSnap = await get(child(ref(database), `usuarios/${user.uid}/rol`))
        const rol = rolSnap.val()

        console.log('👤 Rol del usuario:', rol)

        if (rol !== 'admin') {
          alert('No tienes permiso para ver esta página')
          navigate('/home')
          return
        }

        // ✅ Usuario es administrador, cargar usuarios
        const usuariosRef = ref(database, 'usuarios')
        onValue(usuariosRef, (snapshot) => {
          const data = snapshot.val()
          console.log('📥 Datos de usuarios recibidos:', data)

          if (data) {
            const lista = Object.entries(data).map(([uid, userData]) => ({
              uid,
              ...userData,
            }))
            setUsuarios(lista)
            console.log('✅ Lista de usuarios cargada:', lista)
          } else {
            setUsuarios([])
            console.warn('⚠️ No hay usuarios en la base de datos.')
          }
          setLoading(false)
        })
      } catch (error) {
        console.error('❌ Error al obtener el rol:', error)
        navigate('/login')
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
            {usuarios.length > 0 ? (
              usuarios.map(({ uid, email, nombre, apellido, telefono, rol }) => (
                <tr key={uid} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{email}</td>
                  <td className="px-4 py-2 border-b">{nombre}</td>
                  <td className="px-4 py-2 border-b">{apellido}</td>
                  <td className="px-4 py-2 border-b">{telefono}</td>
                  <td className="px-4 py-2 border-b capitalize">{rol}</td>
                </tr>
              ))
            ) : (
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
