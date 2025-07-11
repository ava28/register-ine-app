import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import mexicoGeoJson from '../data/mexico.json';
import { ref, onValue } from 'firebase/database';
import { database } from '../credenciales';

const normalizeName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
};

const getColor = (value, max) => {
  if (value === 0) return '#c8c8c8'; // gris para estados sin afiliados
  if (max === 0) return '#ffffff';   // fallback

  const ratio = value / max;

  let r, g, b;

  if (ratio <= 0.5) {
    // Rojo a Naranja
    const t = ratio / 0.5; // Normaliza de 0–0.5 a 0–1
    r = Math.round(204 + (235 - 204) * t);
    g = Math.round(1 + (174 - 1) * t);
    b = Math.round(1 + (0 - 1) * t);
  } else {
    // Naranja a Verde
    const t = (ratio - 0.5) / 0.5; // Normaliza de 0.5–1 a 0–1
    r = Math.round(235 + (44 - 235) * t);
    g = Math.round(174 + (195 - 174) * t);
    b = Math.round(0 + (0 - 0) * t);
  }

  return `rgb(${r},${g},${b})`;
};


export default function HeatMapMexico() {
  const [countsByState, setCountsByState] = useState({});
  const [maxCount, setMaxCount] = useState(0);

  // Obtención de afiliados y conteo por estado
  useEffect(() => {
    const afiliadosRef = ref(database, 'afiliados');
    const unsubscribe = onValue(afiliadosRef, (snapshot) => {
      const data = snapshot.val() || {};
      const counts = {};

      Object.values(data).forEach((a, i) => {
        const estadoRaw = a.ubicacion?.estado;
        if (!estadoRaw) {
          console.warn(`Afiliado ${i} sin estado definido`, a);
          return;
        }
        const estadoNorm = normalizeName(estadoRaw);
        counts[estadoNorm] = (counts[estadoNorm] || 0) + 1;
      });

      mexicoGeoJson.features.forEach((feature) => {
        const geoName = feature.properties?.name || '';
        const geoNorm = normalizeName(geoName);
        if (!(geoNorm in counts)) {
          counts[geoNorm] = 0;
        }
      });

      setCountsByState(counts);
    });

    return () => unsubscribe();
  }, []);

  // Recalcular el máximo después de actualizar countsByState
  useEffect(() => {
    const max = Math.max(...Object.values(countsByState), 0);
    setMaxCount(max);
  }, [countsByState]);

  const styleFeature = (feature) => {
    const estadoNorm = normalizeName(feature.properties.name);
    const count = countsByState[estadoNorm] || 0;
    return {
      fillColor: getColor(count, maxCount),
      weight: 1,
      color: 'black',
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature, layer) => {
    const estadoNameRaw = feature.properties?.name || '';
    const estadoNorm = normalizeName(estadoNameRaw);
    const count = countsByState[estadoNorm] || 0;

    layer.bindTooltip(`${estadoNameRaw}: ${count} afiliado${count !== 1 ? 's' : ''}`, {
      sticky: true,
      direction: 'auto',
      opacity: 0.9,
    });
  };

  if (!Object.keys(countsByState).length) {
    return <div>Cargando mapa de afiliados por estado...</div>;
  }

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
