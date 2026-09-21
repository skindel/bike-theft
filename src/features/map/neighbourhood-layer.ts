import { GeoJsonLayer } from '@deck.gl/layers';
import type { PickingInfo } from '@deck.gl/core';
import type { Feature, Geometry } from 'geojson';
import {
  colorForRate,
  type NeighbourhoodFeature,
  type NeighbourhoodProperties,
} from './neighbourhoods';
export type NeighbourhoodPick = PickingInfo<Feature<Geometry, NeighbourhoodProperties>>;
export function neighbourhoodLayer({
  features,
  max,
  visible,
  onHover,
}: {
  features: NeighbourhoodFeature[];
  max: number | null;
  visible: boolean;
  onHover: (info: NeighbourhoodPick) => void;
}) {
  return new GeoJsonLayer<NeighbourhoodProperties>({
    id: 'neighbourhood-choropleth',
    data: features,
    visible,
    filled: true,
    stroked: true,
    pickable: true,
    autoHighlight: true,
    highlightColor: [255, 255, 255, 60],
    getFillColor: (feature) => colorForRate(feature.properties.rate, max),
    getLineColor: [226, 232, 240, 130],
    lineWidthUnits: 'pixels',
    getLineWidth: 1,
    onHover,
    updateTriggers: { getFillColor: [max] },
  });
}
