import React, { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { database } from '../credenciales'

export default function RecuentoAfiliados() {
  const [resumen, setResumen] = useState([])
  const [loading, setLoading] = useState(true)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [agrupacion, setAgrupacion] = useState('afiliador') // 'afiliador', 'estado', 'seccion'

  useEffect(() => {
    const afiliadosRef = ref(database, 'afiliados')
    const unsubscribe = onValue(afiliadosRef, (snapshot) => {
      const data = snapshot.val() || {}

      const mapAgrupado = new Map()
      Object.values(data).forEach((afiliado) => {
        const afiliador = afiliado.afiliador || 'Desconocido'
        const seccion = afiliado.seccion || 'Sin sección'
        const fechaISO = afiliado.timestamp
          ? new Date(afiliado.timestamp).toISOString().slice(0, 10)
          : 'Sin fecha'
        const estado = afiliado.ubicacion?.estado || 'Sin estado'
        const direccion = afiliado.ubicacion?.direccion || 'Sin dirección'

        let key = ''
        switch (agrupacion) {
          case 'afiliador':
            key = afiliador
            break
          case 'estado':
            key = estado
            break
          case 'seccion':
            key = seccion
            break
          default:
            key = afiliador
        }

        if (estadoFiltro && estadoFiltro !== estado) return // filtrar por estado si seleccionado

        if (fechaDesde && fechaISO < fechaDesde) return
        if (fechaHasta && fechaISO > fechaHasta) return

        if (mapAgrupado.has(key)) {
          mapAgrupado.set(key, mapAgrupado.get(key) + 1)
        } else {
          mapAgrupado.set(key, 1)
        }
      })

      const resumenArr = Array.from(mapAgrupado.entries()).map(([clave, cantidad]) => ({
        clave,
        cantidad,
      }))

      setResumen(resumenArr)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [fechaDesde, fechaHasta, estadoFiltro, agrupacion])

  if (loading) return <p className="text-center mt-10">Cargando resumen...</p>

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Recuento de Afiliados</h1>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <div>
          <label className="block font-semibold mb-1">Agrupar por</label>
          <select
            value={agrupacion}
            onChange={(e) => setAgrupacion(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="afiliador">Afiliador</option>
            <option value="estado">Estado</option>
            <option value="seccion">Sección</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Filtrar por estado</label>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="">Todos</option>
            {/* Opciones de estado deberían generarse dinámicamente según datos reales */}
            <option value="Estado1">Estado1</option>
            <option value="Estado2">Estado2</option>
            <option value="Estado3">Estado3</option>
          </select>
        </div>

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

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b text-left">
              {agrupacion.charAt(0).toUpperCase() + agrupacion.slice(1)}
            </th>
            <th className="px-4 py-2 border-b text-center">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {resumen.length === 0 && (
            <tr>
              <td colSpan="2" className="text-center py-4 text-gray-600">
                No hay datos para mostrar
              </td>
            </tr>
          )}
          {resumen.map(({ clave, cantidad }, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{clave}</td>
              <td className="px-4 py-2 border-b text-center">{cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
