import React, { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, database } from '../credenciales'
import { onValue, ref } from 'firebase/database'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [userUid, setUserUid] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Escuchar cambios de auth (login/logout)
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUid(user.uid)
        // Escuchar rol en DB para el usuario actual
        const userRef = ref(database, 'usuarios/' + user.uid)
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val()
          setUserRole(data?.rol || null)
        })
        // Cuando cambie usuario, limpiar escucha anterior
        return () => unsubscribeDb()
      } else {
        setUserUid(null)
        setUserRole(null)
      }
    })

    return () => {
      unsubscribeAuth()
    }
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      alert('Error al cerrar sesión: ' + error.message)
    }
  }

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-10">
      <div className="flex justify-between items-center h-16 px-4 md:px-6">
        <Link to="/home" className="text-xl font-bold text-gray-600">Afiliados</Link>

        {/* Botón hamburguesa */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Navegación desktop */}
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/home" className="text-gray-700 hover:text-gray-600 hover:font-bold">Inicio</Link>
          <Link to="/registrarafiliacion" className="text-gray-700 hover:text-gray-600 hover:font-bold">Registrar Afiliados</Link>
          <Link to="/afiliados" className="text-gray-700 hover:text-gray-600 hover:font-bold">Afiliados</Link>
          {userRole === 'admin' && (
            <>
              <Link to="/recuentoafiliados" className="text-gray-700 hover:text-gray-600 hover:font-bold">
                Recuento Afiliados
              </Link>
              <Link to="/registrar" className="text-gray-700 hover:text-gray-600 hover:font-bold">Registrar Usuario</Link>
              <Link to="/usuarios" className="text-gray-700 hover:text-gray-600 hover:font-bold">Usuarios</Link>
            </>
          )}
          {/*<Link to="/perfil" className="text-gray-700 hover:text-gray-600 hover:font-bold">Perfil</Link> */}
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {isOpen && (
        <div className="md:hidden bg-white px-4 pb-4 space-y-2">
          <Link to="/home" className="block text-gray-700 hover:text-gray-600 hover:font-bold">Inicio</Link>
          <Link to="/registrarafiliacion" className="block text-gray-700 hover:text-gray-600 hover:font-bold">Registrar Afiliados</Link>
          {userRole === 'admin' && (
            <>
            <Link to="/recuentoafiliados" className="text-gray-700 hover:text-gray-600 hover:font-bold">
                Recuento Afiliados
              </Link>
              <Link to="/registrar" className="block text-gray-700 hover:text-gray-600 hover:font-bold">Registrar Usuario</Link>
              <Link to="/usuarios" className="block text-gray-700 hover:text-gray-600 hover:font-bold">Usuarios</Link>
            </>
          )}
          <Link to="/perfil" className="block text-gray-700 hover:text-gray-600 hover:font-bold">Perfil</Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition w-full text-left"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  )
}
