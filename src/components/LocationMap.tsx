import React, { useState } from 'react';
import { CommercialStore } from '../services/location/types';
import { MapPin, Store, Compass } from 'lucide-react';

interface LocationMapProps {
  centerLat: number;
  centerLng: number;
  addressTitle: string;
  radius: number;
  competitors: CommercialStore[];
}

export const LocationMap: React.FC<LocationMapProps> = ({
  centerLat,
  centerLng,
  addressTitle,
  radius,
  competitors,
}) => {
  const [selectedStore, setSelectedStore] = useState<CommercialStore | null>(null);

  // SVG Coordinate Conversion
  // Center is at (300, 200) on a 600x400 viewBox
  const svgWidth = 600;
  const svgHeight = 400;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  // Scale: map radius in meters to 140px on SVG
  const scale = 140 / (radius || 500);

  return (
    <div className="relative w-full bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-900 shadow-md">
      {/* Map Control / Header */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-xs font-bold text-white shadow-sm">
        <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
        <span>반경 {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`} 상권 레이더</span>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-[11px] font-bold text-slate-300">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> 동일업종
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> 기타/유사업종
        </span>
      </div>

      {/* SVG GIS Visualizer */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-72 sm:h-96 object-cover select-none"
      >
        {/* Background Grid Lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
            <stop offset="70%" stopColor="rgba(59, 130, 246, 0.08)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.0)" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="#0f172a" />
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Concentric Radius Rings */}
        <circle cx={centerX} cy={centerY} r={140} fill="url(#radarGlow)" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
        <circle cx={centerX} cy={centerY} r={95} fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
        <circle cx={centerX} cy={centerY} r={50} fill="none" stroke="#93c5fd" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />

        {/* Crosshairs */}
        <line x1={centerX} y1={20} x2={centerX} y2={svgHeight - 20} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2 2" />
        <line x1={40} y1={centerY} x2={svgWidth - 40} y2={centerY} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2 2" />

        {/* Competitor Pins */}
        {competitors.map((store) => {
          // Approx distance in meters
          const dLat = (store.lat - centerLat) * 111000;
          const dLng = (store.lng - centerLng) * 88800;

          const px = centerX + dLng * scale;
          const py = centerY - dLat * scale; // Invert Y for screen coordinates

          const isSame = store.isSameCategory;
          const color = isSame ? '#f43f5e' : '#38bdf8';

          return (
            <g
              key={store.id}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => setSelectedStore(store)}
            >
              <circle
                cx={px}
                cy={py}
                r={isSame ? 7 : 5}
                fill={color}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-all"
              />
              <text
                x={px}
                y={py - 10}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                className="pointer-events-none drop-shadow-md"
              >
                {store.name.length > 6 ? `${store.name.slice(0, 5)}…` : store.name}
              </text>
            </g>
          );
        })}

        {/* Center Marker (Target Property) */}
        <g>
          <circle cx={centerX} cy={centerY} r="18" fill="#3b82f6" opacity="0.3" className="animate-ping" />
          <circle cx={centerX} cy={centerY} r="10" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx={centerX} cy={centerY} r="4" fill="#ffffff" />
          <text
            x={centerX}
            y={centerY + 24}
            textAnchor="middle"
            fill="#60a5fa"
            fontSize="11"
            fontWeight="900"
            className="drop-shadow-md"
          >
            📍 분석 대상 점포
          </text>
        </g>
      </svg>

      {/* Selected Store Tooltip Box */}
      {selectedStore && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3.5 rounded-2xl text-white shadow-xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedStore.isSameCategory ? 'bg-rose-500' : 'bg-blue-400'
                }`}
              />
              <strong className="text-xs font-black">{selectedStore.name}</strong>
              {selectedStore.branch && (
                <span className="text-[10px] text-slate-400">({selectedStore.branch})</span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 mt-1 font-medium">
              {selectedStore.mainCategory} &gt; {selectedStore.midCategory} ({selectedStore.subCategory})
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-bold">
              <span>직선거리: {selectedStore.distance}m</span>
              <span>{selectedStore.roadAddress || selectedStore.address}</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedStore(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
