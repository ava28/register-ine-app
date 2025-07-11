import React, { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { database } from '../credenciales'
import Navbar from './Navbar'

export default function ListaAfiliados() {
  const [afiliados, setAfiliados] = useState([])
  const [filtroSecciones, setFiltroSecciones] = useState([])
  const [seccionesDisponibles, setSeccionesDisponibles] = useState([])

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

        const seccionesUnicas = [...new Set(lista.map((a) => a.seccion || 'Sin sección'))]
        setSeccionesDisponibles(seccionesUnicas)
      } else {
        setAfiliados([])
        setSeccionesDisponibles([])
      }
    })
  }, [])

  const handleSelect = (e) => {
    const selected = e.target.value
    if (selected && !filtroSecciones.includes(selected)) {
      setFiltroSecciones([...filtroSecciones, selected])
    }
  }

  const quitarSeccion = (seccion) => {
    setFiltroSecciones(filtroSecciones.filter((s) => s !== seccion))
  }

  const afiliadosFiltrados =
    filtroSecciones.length === 0
      ? afiliados
      : afiliados.filter((a) => filtroSecciones.includes(a.seccion || 'Sin sección'))

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Afiliados Registrados</h1>

        {/* Filtros seleccionados */}
        <div className="mb-2 flex flex-wrap gap-2">
          {filtroSecciones.map((seccion) => (
            <span
              key={seccion}
              className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
            >
              {seccion}
              <button
                onClick={() => quitarSeccion(seccion)}
                className="ml-2 text-blue-500 hover:text-red-500 font-bold"
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        {/* Selector */}
        <form className="max-w-sm mb-6">
          <label
            htmlFor="secciones"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Selecciona una sección
          </label>
          <select
            id="secciones"
            onChange={handleSelect}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value=""
          >
            <option value="" disabled>
              Elige una sección
            </option>
            {seccionesDisponibles.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </form>

        {/* Tabla */}
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b text-left">Credencial ID</th>
              <th className="px-4 py-2 border-b text-left">Nombre</th>
              <th className="px-4 py-2 border-b text-left">Teléfono</th>
              <th className="px-4 py-2 border-b text-left">Sección</th>
              <th className="px-4 py-2 border-b text-left">Afiliador</th>
              <th className="px-4 py-2 border-b text-left">Fecha</th>
              <th className="px-4 py-2 border-b text-left">Estado</th>
              <th className="px-4 py-2 border-b text-left">Municipio</th>
              <th className="px-4 py-2 border-b text-left">Ubicación</th>
            </tr>
          </thead>
          <tbody>
            {afiliadosFiltrados.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{a.credencialId}</td>
                <td className="px-4 py-2 border-b">{a.nombre}</td>
                <td className="px-4 py-2 border-b">{a.telefono}</td>
                <td className="px-4 py-2 border-b">{a.seccion}</td>
                <td className="px-4 py-2 border-b">{a.afiliador}</td>
                <td className="px-4 py-2 border-b">
                  {a.timestamp ? new Date(a.timestamp).toLocaleString() : 'Sin fecha'}
                </td>
                <td className="px-4 py-2 border-b">
                  {a.ubicacion?.estado || 'No disponible'}
                </td>
                <td className="px-4 py-2 border-b">
                  {a.ubicacion?.municipio || 'No disponible'}
                </td>
                <td className="px-4 py-2 border-b">
                  {a.ubicacion?.direccion || 'No disponible'}
                </td>
              </tr>
            ))}
            {afiliadosFiltrados.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No hay afiliados que coincidan con el filtro
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
