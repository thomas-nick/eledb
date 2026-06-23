"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, GeoJSON, Polyline, CircleMarker, useMap } from "react-leaflet";
import type { Layer, PathOptions } from "leaflet";
import { rangeStates, trendColors } from "@/data/rangeStates";
import { hotspots, migrationCorridors } from "@/data/hotspots";
import { HotspotPanel } from "@/components/map/HotspotPanel";
import {
  GEOJSON_URL,
  MAP_CENTER,
  MAP_ZOOM,
  RANGE_ISO3,
  featureToRangeId,
  trendFill,
} from "@/lib/rangeMapGeo";
import type { Hotspot } from "@/data/hotspots";
import { cn } from "@/lib/utils";
import { LabelWithTooltip } from "@/components/ui/InfoTooltip";
import { HEC_INCIDENTS_TOOLTIP } from "@/lib/glossary";
import { track } from "@/lib/analytics";
import "leaflet/dist/leaflet.css";

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export function RangeMapLeaflet() {
  const router = useRouter();
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [activeStateId, setActiveStateId] = useState<string | null>(null);

  const stateById = useMemo(
    () => Object.fromEntries(rangeStates.map((s) => [s.id, s])),
    []
  );

  const activeStateData = activeStateId ? stateById[activeStateId] : null;

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then((data: GeoJSON.FeatureCollection) => {
        const features = data.features.filter((f) => {
          const iso =
            f.properties?.["ISO_A3"] ??
            f.properties?.["ISO_A3_EH"] ??
            f.properties?.["iso_a3"];
          return typeof iso === "string" && RANGE_ISO3.has(iso.toUpperCase());
        });
        setGeoData({ type: "FeatureCollection", features });
      })
      .catch(() => setLoadError(true));
  }, []);

  const styleFeature = useCallback(
    (feature?: GeoJSON.Feature): PathOptions => {
      const id = feature ? featureToRangeId(feature) : null;
      const state = id ? stateById[id] : null;
      const active = id === activeStateId;
      const fill = state ? trendFill(state.populationTrend, active) : "#c5d9cf";
      return {
        fillColor: fill,
        fillOpacity: active ? 0.85 : 0.65,
        color: active ? "#1a3a2a" : "#ffffff",
        weight: active ? 2 : 1.2,
      };
    },
    [activeStateId, stateById]
  );

  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: Layer) => {
      const id = featureToRangeId(feature);
      if (!id) return;
      const state = stateById[id];
      if (!state) return;

      layer.on({
        mouseover: () => setActiveStateId(id),
        mouseout: () => setActiveStateId((cur) => (cur === id ? null : cur)),
        click: () => {
          track("map_country_click", { country: state.name, slug: id });
          router.push(`/countries/${id}`);
        },
      });

      layer.bindTooltip(
        `<strong>${state.name}</strong><br/>~${state.population.toLocaleString()} wild`,
        { sticky: true, opacity: 0.95 }
      );
    },
    [router, stateById]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {loadError ? (
            <div className="h-[420px] flex items-center justify-center text-sm text-slate-500 p-8 text-center">
              Could not load map geography. Check your network connection and refresh.
            </div>
          ) : (
            <MapContainer
              center={MAP_CENTER}
              zoom={MAP_ZOOM}
              className="h-[420px] md:h-[480px] w-full z-0"
              scrollWheelZoom
              aria-label="Interactive map of Asian elephant range states"
            >
              <MapResizeFix />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {geoData && (
                <GeoJSON
                  key={activeStateId ?? "base"}
                  data={geoData}
                  style={styleFeature}
                  onEachFeature={onEachFeature}
                />
              )}
              {migrationCorridors.map((corridor) => (
                <Polyline
                  key={corridor.id}
                  positions={corridor.path}
                  pathOptions={{
                    color: "#c47d5a",
                    weight: 3,
                    opacity: 0.7,
                    dashArray: "8 6",
                  }}
                />
              ))}
              {hotspots.map((hotspot) => {
                const selected = selectedHotspot?.id === hotspot.id;
                return (
                  <CircleMarker
                    key={hotspot.id}
                    center={[hotspot.lat, hotspot.lng]}
                    radius={selected ? 11 : 8}
                    pathOptions={{
                      color: "#f7f4ef",
                      weight: 2.5,
                      fillColor: "#c47d5a",
                      fillOpacity: selected ? 1 : 0.9,
                    }}
                    eventHandlers={{
                      click: () => {
                        track("map_hotspot_click", {
                          hotspot: hotspot.name,
                          country: hotspot.country,
                        });
                        setSelectedHotspot(hotspot);
                      },
                    }}
                  />
                );
              })}
            </MapContainer>
          )}

          <div className="flex flex-wrap gap-x-5 gap-y-2 px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <LegendSwatch color={trendColors.stable.fill} label="Stable" />
            <LegendSwatch color={trendColors.increasing.fill} label="Increasing" />
            <LegendSwatch color={trendColors.declining.fill} label="Declining" />
            <span className="flex items-center gap-2">
              <span className="w-6 border-t-2 border-dashed border-clay" />
              Migration corridor
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-clay" />
              Coexistence hotspot
            </span>
          </div>

          {activeStateData ? (
            <div className="mx-4 mb-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{activeStateData.name}</p>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs">Wild population</p>
                      <p className="font-medium text-slate-900">
                        {activeStateData.population.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Trend</p>
                      <p
                        className={cn(
                          "font-medium capitalize",
                          activeStateData.populationTrend === "increasing"
                            ? "text-emerald-700"
                            : activeStateData.populationTrend === "declining"
                            ? "text-red-700"
                            : "text-slate-900"
                        )}
                      >
                        {activeStateData.populationTrend}
                      </p>
                    </div>
                    <div>
                      <LabelWithTooltip
                        label="HEC incidents/yr"
                        tooltip={HEC_INCIDENTS_TOOLTIP}
                        className="text-slate-500 text-xs normal-case tracking-normal font-normal"
                      />
                      <p className="font-medium text-slate-900">
                        {activeStateData.hecIncidents.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/countries/${activeStateData.id}`}
                  className="shrink-0 text-sm font-medium text-forest hover:underline"
                >
                  Country hub →
                </Link>
              </div>
            </div>
          ) : (
            <p className="mx-4 mb-4 text-sm text-slate-500 text-center py-1">
              Hover a country for stats · click to open its country hub
            </p>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <HotspotPanel hotspot={selectedHotspot} onClose={() => setSelectedHotspot(null)} />
      </div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
