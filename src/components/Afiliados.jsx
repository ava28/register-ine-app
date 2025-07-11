import React, { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { database } from '../credenciales'
import Navbar from './Navbar'

export default function Afiliados() {
  const [afiliados, setAfiliados] = useState([])

  useEffect(() => {
    const afiliadosRef = ref(database, 'afiliados')
    onValue(afiliadosRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const lista = Object.entries(data).map(([id, datos]) => ({
          id,
          ...datos,
        }))
        setAfiliados(lista)
      } else {
        setAfiliados([])
      }
    })
  }, [])

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Afiliados Registrados</h1>
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b text-left">Credencial ID</th>
              <th className="px-4 py-2 border-b text-left">Nombre</th>
              <th className="px-4 py-2 border-b text-left">Teléfono</th>
              <th className="px-4 py-2 border-b text-left">Sector</th>
              <th className="px-4 py-2 border-b text-left">Afiliador</th>
              <th className="px-4 py-2 border-b text-left">Fecha</th>
              <th className="px-4 py-2 border-b text-left">Ubicación</th>
            </tr>
          </thead>
          <tbody>
            {afiliados.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{a.credencialId}</td>
                <td className="px-4 py-2 border-b">{a.nombre}</td>
                <td className="px-4 py-2 border-b">{a.telefono}</td>
                <td className="px-4 py-2 border-b">{a.sector}</td>
                <td className="px-4 py-2 border-b">{a.afiliador}</td>
                <td className="px-4 py-2 border-b">{new Date(a.timestamp).toLocaleString()}</td>
                <td className="px-4 py-2 border-b">
                  {a.ubicacion
                    ? `${a.ubicacion.direccion}`
                    : 'No disponible'}
                </td>
              </tr>
            ))}
            {afiliados.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No hay afiliados registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
