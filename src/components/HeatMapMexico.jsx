import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import mexicoGeoJson from '../data/mexico.json'; // asegúrate que tienes el archivo
import { ref, onValue } from 'firebase/database';
import { database } from '../credenciales';

const normalizeName = (name) => {
  if (!name) return '';
  return name.toLowerCase()
    .trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/\s+/g, '-'); // reemplaza espacios por guiones
};

const getColor = (value, max) => {
  if (value === 0) return '#ffffff'; // sin afiliados blanco
  const ratio = value / max;
  const r = Math.floor(255 * (1 - ratio));
  const g = Math.floor(255 * ratio);
  return `rgb(${r},${g},0)`; // de rojo a verde
};

export default function HeatMapMexico() {
  const [countsByState, setCountsByState] = useState({});
  const [maxCount, setMaxCount] = useState(0);

  useEffect(() => {
    const afiliadosRef = ref(database, 'afiliados');
    const unsubscribe = onValue(afiliadosRef, (snapshot) => {
      const data = snapshot.val() || {};
      const counts = {};

      Object.values(data).forEach((a) => {
        const estadoRaw = a.ubicacion?.estado;
        const estado = normalizeName(estadoRaw);
        if (!estado) return;
        counts[estado] = (counts[estado] || 0) + 1;
      });

      console.log('Conteo por estado:', counts);
      setCountsByState(counts);
      setMaxCount(Math.max(...Object.values(counts), 0));
    });

    return () => unsubscribe();
  }, []);

  const styleFeature = (feature) => {
    const estadoName = normalizeName(feature.properties.name);
    const count = countsByState[estadoName] || 0;
    return {
      fillColor: getColor(count, maxCount),
      weight: 1,
      color: 'black',
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature, layer) => {
    const estadoNameRaw = feature.properties.name;
    const estadoName = normalizeName(estadoNameRaw);
    const count = countsByState[estadoName] || 0;

    layer.bindTooltip(`${estadoNameRaw}: ${count} afiliado${count !== 1 ? 's' : ''}`, {
      sticky: true,
      direction: 'auto',
      opacity: 0.9,
    });
  };

  return (
    <MapContainer
      style={{ height: '600px', width: '100%' }}
      center={[23.6345, -102.5528]}
      zoom={5}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <GeoJSON
        data={mexicoGeoJson}
        style={styleFeature}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
}
