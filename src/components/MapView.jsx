import { useEffect, useRef } from 'react';

const loadLeaflet = (() => {
  let loaded = false;
  let promise;
  return () => {
    if (loaded) return Promise.resolve();
    if (promise) return promise;
    promise = new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        loaded = true;
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
    return promise;
  };
})();

export default function MapView({ billboards = [], center = [40.7128, -74.006], zoom = 12, onMapClick, onMarkerClick }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then(() => {
      if (cancelled) return;
      const L = window.L;
      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current).setView(center, zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance.current);
        if (onMapClick) {
          mapInstance.current.on('click', (e) => onMapClick(e.latlng));
        }
      }
      if (!markersLayer.current) {
        markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      }
      // render markers
      markersLayer.current.clearLayers();
      billboards.forEach((b) => {
        const isAvailable = b.status === 'available';
        const color = isAvailable ? '#16a34a' : '#ef4444';
        const L = window.L;
        const marker = L.circleMarker([b.lat, b.lng], {
          radius: 8,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.7,
        });
        marker.bindPopup(`<strong>${b.title}</strong><br/>${b.city || ''} ${b.address ? '• ' + b.address : ''}<br/>$${b.price || '—'}`);
        if (onMarkerClick) marker.on('click', () => onMarkerClick(b));
        marker.addTo(markersLayer.current);
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billboards]);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border" ref={mapRef} />
  );
}
