'use client';
import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { ParkingLocation } from '@/contracts';
import { parking, zones } from './fixtures';
import { activityBand } from './risk';
const colors = { low: '#62a88e', medium: '#eebc58', high: '#e78875', unknown: '#94a3b8' };
export function CityMap({
  selected,
  onSelect,
  showZones,
  visibleIds,
}: {
  selected: ParkingLocation | null;
  onSelect: (id: string) => void;
  showZones: boolean;
  visibleIds: string[];
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markers = useRef<{ id: string; marker: maplibregl.Marker }[]>([]);
  const selectRef = useRef(onSelect);
  const [status, setStatus] = useState('Loading Maastricht map…');
  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    if (!container.current) return;
    let map: maplibregl.Map;
    const loadingTimeout = window.setTimeout(() => {
      setStatus('Basemap is taking longer than expected. Parking examples are available below.');
    }, 12000);
    try {
      map = new maplibregl.Map({
        container: container.current,
        center: [5.695, 50.847],
        zoom: 13.8,
        minZoom: 11,
        maxZoom: 18,
        style:
          process.env.NEXT_PUBLIC_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/positron',
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      map.on('error', () =>
        setStatus('Map tiles unavailable. You can still explore the parking list.'),
      );
      map.on('load', () => {
        window.clearTimeout(loadingTimeout);
        setStatus('');
      });
      map.on('style.load', () => {
        map.addSource('zones', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: zones.map((zone) => ({
              type: 'Feature',
              properties: { color: colors[activityBand(zone.count)] },
              geometry: { type: 'Polygon', coordinates: [zone.coordinates] },
            })),
          },
        });
        map.addLayer({
          id: 'zone-fill',
          type: 'fill',
          source: 'zones',
          paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.32 },
        });
        map.addLayer({
          id: 'zone-line',
          type: 'line',
          source: 'zones',
          paint: { 'line-color': ['get', 'color'], 'line-width': 2, 'line-opacity': 0.65 },
        });
      });
      markers.current = parking.map((place) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'parking-pin';
        el.textContent = 'P';
        el.setAttribute('aria-label', `Show ${place.name}`);
        el.addEventListener('click', () => selectRef.current(place.id));
        return {
          id: place.id,
          marker: new maplibregl.Marker({ element: el }).setLngLat(place.coordinates).addTo(map),
        };
      });
    } catch {
      queueMicrotask(() =>
        setStatus('Interactive map unavailable in this browser. Explore the parking list below.'),
      );
    }
    return () => {
      window.clearTimeout(loadingTimeout);
      markers.current.forEach(({ marker }) => marker.remove());
      markers.current = [];
      mapRef.current = null;
      map?.remove();
    };
  }, []);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    function apply() {
      for (const id of ['zone-fill', 'zone-line'])
        if (map?.getLayer(id))
          map.setLayoutProperty(id, 'visibility', showZones ? 'visible' : 'none');
    }
    apply();
    map.on('style.load', apply);
    return () => {
      map.off('style.load', apply);
    };
  }, [showZones]);
  useEffect(() => {
    markers.current.forEach(({ id, marker }) => {
      marker.getElement().style.display = visibleIds.includes(id) ? '' : 'none';
      marker.getElement().classList.toggle('selected', id === selected?.id);
    });
    if (selected)
      mapRef.current?.flyTo({ center: selected.coordinates, zoom: 15, essential: false });
  }, [selected, visibleIds]);
  return (
    <>
      <div
        className="map-canvas"
        ref={container}
        aria-label="Interactive map of Maastricht with illustrative theft zones and parking"
      />
      {status && (
        <div className="map-status" role="status">
          {status}
        </div>
      )}
    </>
  );
}
