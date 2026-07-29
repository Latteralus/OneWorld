"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface AirportMapMarker {
  id: string;
  ident: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface AirportMapProps {
  markers: AirportMapMarker[];
  styleUrl: string;
  /** [longitude, latitude] */
  center?: [number, number];
  zoom?: number;
  className?: string;
}

/** Airport map view (spec section 12.5) - MapLibre GL JS, configured via env so the tile provider is replaceable. */
export function AirportMap({ markers, styleUrl, center, zoom = 4, className }: AirportMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const fallbackCenter: [number, number] = markers[0]
      ? [markers[0].longitude, markers[0].latitude]
      : [-98.5, 39.8]; // center of the contiguous U.S.

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: center ?? fallbackCenter,
      zoom,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    const markerInstances = markers.map((airport) => {
      const popup = new maplibregl.Popup({ offset: 12 }).setHTML(
        `<strong>${airport.ident}</strong><br/>${escapeHtml(airport.name)}`,
      );
      return new maplibregl.Marker({ color: "#e5e5e5" })
        .setLngLat([airport.longitude, airport.latitude])
        .setPopup(popup)
        .addTo(map);
    });

    return () => {
      for (const marker of markerInstances) marker.remove();
      map.remove();
    };
  }, [markers, styleUrl, center, zoom]);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-96 w-full rounded-lg border border-neutral-800"}
    />
  );
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}
