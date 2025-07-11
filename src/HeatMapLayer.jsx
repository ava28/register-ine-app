// src/components/HeatMapLayer.jsx
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatMapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Crear capa heatmap
    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 10,
      gradient: { 0.1: 'yellow', 0.5: 'lime', 1: 'green' },
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}
