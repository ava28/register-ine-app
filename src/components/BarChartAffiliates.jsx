import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ref, onValue } from 'firebase/database';
import { database } from '../credenciales';

const normalizeName = (name) => {
  if (!name) return '';
  return name.toLowerCase()
    .trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/\s+/g, '-');
};

export default function BarChartAffiliates() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const afiliadosRef = ref(database, 'afiliados');
    const unsubscribe = onValue(afiliadosRef, (snapshot) => {
      const afiliados = snapshot.val() || {};
      const counts = {};

      Object.values(afiliados).forEach((a) => {
        const estadoRaw = a.ubicacion?.estado;
        const estado = normalizeName(estadoRaw);
        if (!estado) return;
        counts[estado] = (counts[estado] || 0) + 1;
      });

      // Convertir objeto counts a array para Recharts [{ name: 'estado', count: x }, ...]
      const chartData = Object.entries(counts).map(([estado, count]) => ({
        name: estado.replace(/-/g, ' ').toUpperCase(),
        count,
      }));

      // Ordenar por cantidad descendente
      chartData.sort((a, b) => b.count - a.count);

      setData(chartData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#82ca9d" name="Afiliados" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
