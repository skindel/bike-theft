'use client';
import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { ParkingLocation } from '@/contracts';
import { theftHeatmapLayer, type TheftHeatPoint } from './theft-heatmap';
import { neighbourhoodLayer, type NeighbourhoodPick } from './neighbourhood-layer';
import type { NeighbourhoodFeature } from './neighbourhoods';
// MapLibre cannot resolve its own worker module through the bundler, and without a worker
// no vector tile is ever parsed. scripts/copy-maplibre-worker.mjs puts it under public/.
maplibregl.config.WORKER_URL = '/maplibre/maplibre-gl-worker.mjs';
export function CityMap({
  selected,
  onSelect,
  showNeighbourhoods,
  neighbourhoods,
  neighbourhoodMax,
  onHoverNeighbourhood,
  showHeatmap,
  heatPoints,
  showParkings,
  parkingLocations,
  visibleIds,
}: {
  selected: ParkingLocation | null;
  onSelect: (id: string) => void;
  showNeighbourhoods: boolean;
  neighbourhoods: NeighbourhoodFeature[];
  neighbourhoodMax: number | null;
  onHoverNeighbourhood: (info: NeighbourhoodPick) => void;
  showHeatmap: boolean;
  heatPoints: TheftHeatPoint[];
  showParkings: boolean;
  parkingLocations: ParkingLocation[];
  visibleIds: string[];
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
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
        style: process.env.NEXT_PUBLIC_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/dark',
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      const overlay = new MapboxOverlay({ interleaved: false, layers: [] });
      overlayRef.current = overlay;
      map.addControl(overlay as unknown as maplibregl.IControl, 'top-left');
      map.on('error', () =>
        setStatus('Map tiles unavailable. You can still explore the parking list.'),
      );
      map.on('load', () => {
        window.clearTimeout(loadingTimeout);
        setStatus('');
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
      overlayRef.current?.finalize();
      overlayRef.current = null;
      mapRef.current = null;
      map?.remove();
    };
  }, []);
  useEffect(() => {
    overlayRef.current?.setProps({
      layers: [
        neighbourhoodLayer({
          features: neighbourhoods,
          max: neighbourhoodMax,
          visible: showNeighbourhoods,
          onHover: onHoverNeighbourhood,
        }),
        theftHeatmapLayer(heatPoints, showHeatmap),
      ],
    });
  }, [
    neighbourhoods,
    neighbourhoodMax,
    showNeighbourhoods,
    onHoverNeighbourhood,
    heatPoints,
    showHeatmap,
  ]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markers.current.forEach(({ marker }) => marker.remove());
    markers.current = parkingLocations.map((place) => {
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
  }, [parkingLocations]);
  useEffect(() => {
    markers.current.forEach(({ id, marker }) => {
      const visible = showParkings && visibleIds.includes(id);
      marker.getElement().style.display = visible ? '' : 'none';
      marker.getElement().classList.toggle('selected', id === selected?.id);
    });
    if (selected)
      mapRef.current?.flyTo({ center: selected.coordinates, zoom: 15, essential: false });
    // parkingLocations is a dep so visibility/selection re-apply right after markers
    // are recreated by the effect above (which runs first, in source order).
  }, [selected, visibleIds, showParkings, parkingLocations]);
  return (
    <>
      <div
        className="map-canvas"
        ref={container}
        aria-label="Interactive map of Maastricht neighbourhoods shaded by recorded bicycle theft activity, with parking examples"
      />
      {status && (
        <div className="map-status" role="status">
          {status}
        </div>
      )}
    </>
  );
}
