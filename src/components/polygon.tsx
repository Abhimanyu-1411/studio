'use client';

import {
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

type PolygonProps = google.maps.PolygonOptions & {
  onClick?: (e: google.maps.MapMouseEvent) => void;
};

export const Polygon = (props: PolygonProps) => {
  const { onClick, ...options } = props;
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLib) return;

    const p = new mapsLib.Polygon({ map, ...options });
    setPolygon(p);

    return () => {
      p.setMap(null);
    };
  }, [map, mapsLib, options]);

  useEffect(() => {
    if (!polygon || !onClick) return;
    const listener = polygon.addListener('click', onClick);
    return () => {
      listener.remove();
    };
  }, [polygon, onClick]);

  return null;
};
