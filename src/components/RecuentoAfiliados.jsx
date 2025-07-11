import React, { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { database } from '../credenciales'
import Navbar from './Navbar'

export default function RecuentoAfiliados() {
  const [resumen, setResumen] = useState([])
  const [loading, setLoading] = useState(true)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  useEffect(() => {
    const afiliadosRef = ref(database, 'afiliados')
    const unsubscribe = onValue(afiliadosRef, (snapshot) => {
      const data = snapshot.val() || {}

      // Creamos un array plano con objetos:
      // { afiliador, sector, direccion, fecha (ISO), fechaDisplay, conteo }
      // Para agrupar vamos a usar un Map con clave compuesta
      const mapAgrupado = new Map()

      Object.values(data).forEach((afiliado) => {
        const afiliador = afiliado.afiliador || 'Desconocido'
        const sector = afiliado.sector || 'Sin sector'
        const fechaISO = afiliado.timestamp
          ? new Date(afiliado.timestamp).toISOString().slice(0, 10) // yyyy-mm-dd
          : 'Sin fecha'
        const fechaDisplay = afiliado.timestamp
          ? new Date(afiliado.timestamp).toLocaleDateString()
          : 'Sin fecha'
        const direccion = afiliado.ubicacion?.direccion || 'Sin dirección'

        const key = `${afiliador}|${sector}|${direccion}|${fechaISO}`

        if (mapAgrupado.has(key)) {
          mapAgrupado.get(key).conteo++
        } else {
          mapAgrupado.set(key, {
            afiliador,
            sector,
            direccion,
            fechaISO,
            fechaDisplay,
            conteo: 1,
          })
        }
      })

      setResumen(Array.from(mapAgrupado.values()))
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Filtrar por rango de fechas
  const resumenFiltrado = resumen.filter((item) => {
    if (!fechaDesde && !fechaHasta) return true
    if (!item.fechaISO || item.fechaISO === 'Sin fecha') return false
    if (fechaDesde && item.fechaISO < fechaDesde) return false
    if (fechaHasta && item.fechaISO > fechaHasta) return false
    return true
  })

  if (loading) return <p className="text-center mt-10">Cargando resumen...</p>

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Recuento de Afiliados por Usuario, Sector, Dirección y Fecha
        </h1>

        <div className="flex gap-4 justify-center mb-6">
          <div>
            <label className="block font-semibold mb-1">Fecha desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="border rounded px-3 py-1"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Fecha hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="border rounded px-3 py-1"
            />
          </div>
        </div>

        {resumenFiltrado.length === 0 ? (
          <p className="text-center text-gray-600">No hay datos para mostrar en el rango seleccionado.</p>
        ) : (
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b text-left">Afiliador</th>
                <th className="px-4 py-2 border-b text-left">Sector</th>
                <th className="px-4 py-2 border-b text-left">Dirección</th>
                <th className="px-4 py-2 border-b text-left">Fecha</th>
                <th className="px-4 py-2 border-b text-center">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {resumenFiltrado.map(({ afiliador, sector, direccion, fechaDisplay, conteo }, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{afiliador}</td>
                  <td className="px-4 py-2 border-b">{sector}</td>
                  <td className="px-4 py-2 border-b">{direccion}</td>
                  <td className="px-4 py-2 border-b">{fechaDisplay}</td>
                  <td className="px-4 py-2 border-b text-center">{conteo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
