import React, { useEffect, useState, useMemo } from 'react';
import Navbar from './Navbar';
import HeatMapMexico from './HeatMapMexico';
import BarChartAffiliates from './BarChartAffiliates';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../credenciales';

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [totalAffiliates, setTotalAffiliates] = useState(0);
  const [affiliatesByState, setAffiliatesByState] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'estado', direction: 'asc' });

  const ESTADOS_MEXICO = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
    "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México",
    "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit",
    "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
    "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
  ];

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      onValue(ref(database, `usuarios/${user.uid}`), (snap) => {
        setUserData(snap.val());
      });
    }
  }, []);

  useEffect(() => {
    const afiliadosRef = ref(database, 'afiliados');
    const unsubscribe = onValue(afiliadosRef, (snap) => {
      const data = snap.val() || {};
      setTotalAffiliates(Object.keys(data).length);

      // Inicializar conteo con 0 para todos los estados oficiales
      const conteo = {};
      ESTADOS_MEXICO.forEach((estado) => {
        conteo[estado] = 0;
      });

      // Contar solo afiliados cuyo estado coincida EXACTAMENTE con el estado oficial
      Object.values(data).forEach((afiliado) => {
        const estadoAfiliado = afiliado.estado || afiliado.ubicacion?.estado || null;
        if (estadoAfiliado && conteo.hasOwnProperty(estadoAfiliado)) {
          conteo[estadoAfiliado]++;
        }
      });

      setAffiliatesByState(conteo);
    });

    return () => unsubscribe();
  }, []);

  // Construimos la lista ordenada con useMemo para optimizar
  const estadosConConteo = useMemo(() => {
    // Transformar a array [{ estado, conteo }]
    const arr = ESTADOS_MEXICO.map(estado => ({
      estado,
      conteo: affiliatesByState[estado] || 0
    }));

    // Ordenar segun sortConfig
    if (!sortConfig) return arr;

    return arr.sort((a, b) => {
      if (sortConfig.key === 'estado') {
        // Orden alfabético
        if (a.estado < b.estado) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a.estado > b.estado) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      } else if (sortConfig.key === 'conteo') {
        // Orden numérico
        if (a.conteo < b.conteo) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a.conteo > b.conteo) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      return 0;
    });
  }, [affiliatesByState, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Función para mostrar flechas en el header
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <>
      <Navbar />
      <div className="pt-20 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            {/* Gráfica */}
            <div className="bg-white shadow rounded p-4">
              <h2 className="font-bold text-lg mb-4">Afiliaciones por estado - Gráfica</h2>
              <div className="w-full h-[350px] overflow-x-auto">
                <BarChartAffiliates />
              </div>
            </div>

            {/* Tabla dinámica */}
            <div className="bg-white shadow rounded p-4">
              <h2 className="font-bold text-lg mb-4">Afiliaciones por estado - Tabla</h2>
              <div className="overflow-auto max-h-64 border rounded">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-100 sticky top-0 cursor-pointer select-none">
                    <tr>
                      <th
                        className="px-4 py-2 border-b"
                        onClick={() => requestSort('estado')}
                      >
                        Estado{getSortIndicator('estado')}
                      </th>
                      <th
                        className="px-4 py-2 border-b"
                        onClick={() => requestSort('conteo')}
                      >
                        Afiliaciones{getSortIndicator('conteo')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadosConConteo.map(({ estado, conteo }) => (
                      <tr key={estado} className="odd:bg-white even:bg-gray-50">
                        <td className="px-4 py-2 border-b">{estado}</td>
                        <td className="px-4 py-2 border-b">{conteo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="h-full">
            <div className="bg-white shadow rounded p-4 h-full flex flex-col">
              <h2 className="font-bold text-lg mb-4">Mapa Afiliciones (por estado)</h2>
              <div className="w-full flex-grow">
                <HeatMapMexico />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
