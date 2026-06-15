"use client";

import { useState } from "react";
import { rangeStates, trendColors } from "@/data/rangeStates";
import { hotspots, migrationCorridors, Hotspot } from "@/data/hotspots";
import { MAP_VIEWBOX, regionLabels } from "@/data/mapGeometry";
import { HotspotPanel } from "./HotspotPanel";
import { cn } from "@/lib/utils";
import { LabelWithTooltip } from "@/components/ui/InfoTooltip";
import { HEC_INCIDENTS_TOOLTIP } from "@/lib/glossary";

export function RangeMap() {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [activeState, setActiveState] = useState<string | null>(null);

  const activeStateData = rangeStates.find((s) => s.id === activeState);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
          <svg
            viewBox={MAP_VIEWBOX}
            className="w-full h-auto min-h-[320px]"
            role="img"
            aria-label="Interactive map of Asian elephant range states across South and Southeast Asia"
          >
            <defs>
              <linearGradient id="ocean" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dce8e2" />
                <stop offset="100%" stopColor="#c5d9cf" />
              </linearGradient>
              <filter id="countryShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
              </filter>
              <filter id="hotspotGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ocean */}
            <rect x="0" y="0" width="800" height="520" fill="url(#ocean)" rx="12" />

            {/* Water labels */}
            {regionLabels.map((label) => (
              <text
                key={label.text}
                x={label.x}
                y={label.y}
                textAnchor="middle"
                className="fill-forest/20 pointer-events-none select-none"
                style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.08em" }}
              >
                {label.text.toUpperCase()}
              </text>
            ))}

            {/* Migration corridors (under countries) */}
            {migrationCorridors.map((corridor) => (
              <g key={corridor.id}>
                <line
                  x1={corridor.from.x}
                  y1={corridor.from.y}
                  x2={corridor.to.x}
                  y2={corridor.to.y}
                  stroke="#c47d5a"
                  strokeWidth="3"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                  opacity="0.45"
                />
              </g>
            ))}

            {/* Countries */}
            {rangeStates.map((state) => {
              const isActive = activeState === state.id;
              const colors = trendColors[state.populationTrend];
              return (
                <g key={state.id}>
                  <path
                    d={state.svgPath}
                    fill={isActive ? colors.hover : colors.fill}
                    stroke="#f7f4ef"
                    strokeWidth={isActive ? 2.5 : 1.5}
                    filter="url(#countryShadow)"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setActiveState(state.id)}
                    onMouseLeave={() => setActiveState(null)}
                    onClick={() => setActiveState(state.id)}
                  />
                  <text
                    x={state.label.x}
                    y={state.label.y}
                    textAnchor={state.label.anchor ?? "middle"}
                    className={cn(
                      "pointer-events-none select-none font-medium",
                      isActive ? "fill-ivory" : "fill-ivory/90"
                    )}
                    style={{
                      fontSize: state.id === "india" || state.id === "myanmar" ? "11px" : "9px",
                      textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                    }}
                  >
                    {state.shortName}
                  </text>
                </g>
              );
            })}

            {/* Hotspots */}
            {hotspots.map((hotspot) => {
              const isSelected = selectedHotspot?.id === hotspot.id;
              return (
                <g
                  key={hotspot.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedHotspot(hotspot)}
                >
                  {isSelected && (
                    <circle
                      cx={hotspot.x}
                      cy={hotspot.y}
                      r="16"
                      fill="#c47d5a"
                      opacity="0.25"
                    />
                  )}
                  <circle
                    cx={hotspot.x}
                    cy={hotspot.y}
                    r={isSelected ? 9 : 7}
                    fill="#c47d5a"
                    stroke="#f7f4ef"
                    strokeWidth="2.5"
                    filter={isSelected ? "url(#hotspotGlow)" : undefined}
                    className="transition-all duration-200"
                  />
                  <circle
                    cx={hotspot.x}
                    cy={hotspot.y}
                    r="18"
                    fill="transparent"
                  />
                </g>
              );
            })}

            {/* Compass */}
            <g transform="translate(720, 460)">
              <circle r="22" fill="#f7f4ef" fillOpacity="0.9" stroke="#e2ddd4" />
              <text y="-6" textAnchor="middle" className="fill-forest" style={{ fontSize: "10px", fontWeight: 700 }}>N</text>
              <line x1="0" y1="-4" x2="0" y2="-14" stroke="#1a3a2a" strokeWidth="1.5" />
            </g>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5 px-1">
            <div className="flex items-center gap-2 text-xs text-muted">
              <div className="w-3 h-3 rounded-sm" style={{ background: trendColors.stable.fill }} />
              Stable population
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <div className="w-3 h-3 rounded-sm" style={{ background: trendColors.increasing.fill }} />
              Increasing
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <div className="w-3 h-3 rounded-sm" style={{ background: trendColors.declining.fill }} />
              Declining
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <div className="w-6 border-t-2 border-dashed border-clay" />
              Migration corridor
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <div className="w-3 h-3 rounded-full bg-clay" />
              Coexistence hotspot
            </div>
          </div>

          {/* State info panel */}
          {activeStateData ? (
            <div className="mt-4 p-4 bg-forest/5 rounded-xl border border-forest/10">
              <p className="font-semibold text-forest">{activeStateData.name}</p>
              <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                <div>
                  <p className="text-muted text-xs">Wild Population</p>
                  <p className="font-medium text-forest">
                    {activeStateData.population.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted text-xs">Trend</p>
                  <p
                    className={cn(
                      "font-medium capitalize",
                      activeStateData.populationTrend === "increasing"
                        ? "text-green-700"
                        : activeStateData.populationTrend === "declining"
                        ? "text-red-700"
                        : "text-forest"
                    )}
                  >
                    {activeStateData.populationTrend}
                  </p>
                </div>
                <div>
                  <LabelWithTooltip
                    label="HEC Incidents/yr"
                    tooltip={HEC_INCIDENTS_TOOLTIP}
                    className="text-muted text-xs normal-case tracking-normal font-normal"
                  />
                  <p className="font-medium text-forest">
                    {activeStateData.hecIncidents.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted text-center py-2">
              Hover or tap a country to see population data
            </p>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <HotspotPanel
          hotspot={selectedHotspot}
          onClose={() => setSelectedHotspot(null)}
        />
      </div>
    </div>
  );
}
