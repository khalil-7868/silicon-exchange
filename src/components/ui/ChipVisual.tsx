import React from 'react';

interface ChipVisualProps {
  chip: string;
  className?: string;
  compact?: boolean;
}

export function ChipVisual({ chip, className = '', compact = false }: ChipVisualProps) {
  // Determine color theme based on chip family
  let accentColor = '#00F0FF'; // default cyan
  let secondaryColor = '#3B82F6'; // blue
  let dieType = 'Hopper Matrix';

  if (chip.includes('B200')) {
    accentColor = '#00FF88'; // Blackwell emerald
    secondaryColor = '#00E5FF';
    dieType = 'Dual Blackwell Die';
  } else if (chip.includes('MI300X')) {
    accentColor = '#FF3366'; // AMD Crimson
    secondaryColor = '#FF8800';
    dieType = 'CDNA 3 Multi-Chiplet';
  } else if (chip.includes('M3 Ultra')) {
    accentColor = '#A855F7'; // Apple Purple/Silver
    secondaryColor = '#38BDF8';
    dieType = 'UltraFusion Interconnect';
  } else if (chip.includes('RTX 5090') || chip.includes('4090')) {
    accentColor = '#76B900'; // GeForce Green
    secondaryColor = '#00F0FF';
    dieType = 'Ada/Blackwell Monolithic';
  } else if (chip.includes('TPU')) {
    accentColor = '#4285F4'; // Google Blue
    secondaryColor = '#EA4335';
    dieType = 'Matrix Multiply Unit';
  } else if (chip.includes('Gaudi')) {
    accentColor = '#F59E0B'; // Intel Amber
    secondaryColor = '#EF4444';
    dieType = 'Habana TPC Array';
  }

  if (compact) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 48 48"
          className="w-8 h-8 rounded border border-white/10 bg-[#0B0F19]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer substrate */}
          <rect x="4" y="4" width="40" height="40" rx="3" stroke="#334155" strokeWidth="1.5" />
          {/* Silicon Die */}
          <rect
            x="14"
            y="14"
            width="20"
            height="20"
            rx="1.5"
            fill={accentColor}
            fillOpacity="0.15"
            stroke={accentColor}
            strokeWidth="1.2"
          />
          {/* Core grid */}
          <line x1="24" y1="14" x2="24" y2="34" stroke={accentColor} strokeWidth="0.8" strokeDasharray="1 1" />
          <line x1="14" y1="24" x2="34" y2="24" stroke={accentColor} strokeWidth="0.8" strokeDasharray="1 1" />
          {/* Corner HBM pads */}
          <circle cx="8" cy="8" r="1.5" fill={secondaryColor} />
          <circle cx="40" cy="8" r="1.5" fill={secondaryColor} />
          <circle cx="8" cy="40" r="1.5" fill={secondaryColor} />
          <circle cx="40" cy="40" r="1.5" fill={secondaryColor} />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative p-3 rounded-lg border border-white/10 bg-[#0B0E17] ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
          Die Topology // {dieType}
        </span>
        <span className="flex h-2 w-2 relative">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: accentColor }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: accentColor }}
          />
        </span>
      </div>

      <svg
        viewBox="0 0 280 140"
        className="w-full h-auto max-h-36 rounded bg-[#07090E] border border-white/5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Grid pattern */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="280" height="140" fill="url(#grid)" />

        {/* Heat Spreader / Substrate outline */}
        <rect x="20" y="15" width="240" height="110" rx="6" stroke="#1E293B" strokeWidth="2" fill="#0C101A" />
        <rect x="25" y="20" width="230" height="100" rx="4" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

        {/* Interconnect bus lines */}
        <path d="M 30 70 L 70 70" stroke={secondaryColor} strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M 210 70 L 250 70" stroke={secondaryColor} strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M 140 25 L 140 45" stroke={accentColor} strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M 140 95 L 140 115" stroke={accentColor} strokeWidth="1.5" strokeOpacity="0.4" />

        {/* Main Compute Dies */}
        {chip.includes('B200') || chip.includes('MI300X') ? (
          // Dual Die Architecture
          <>
            <rect
              x="75"
              y="40"
              width="60"
              height="60"
              rx="3"
              fill={accentColor}
              fillOpacity="0.12"
              stroke={accentColor}
              strokeWidth="1.5"
            />
            <rect
              x="145"
              y="40"
              width="60"
              height="60"
              rx="3"
              fill={accentColor}
              fillOpacity="0.12"
              stroke={accentColor}
              strokeWidth="1.5"
            />
            <line x1="135" y1="50" x2="145" y2="50" stroke={accentColor} strokeWidth="2" strokeDasharray="2 1" />
            <line x1="135" y1="70" x2="145" y2="70" stroke={accentColor} strokeWidth="2" strokeDasharray="2 1" />
            <line x1="135" y1="90" x2="145" y2="90" stroke={accentColor} strokeWidth="2" strokeDasharray="2 1" />
          </>
        ) : (
          // Single Large Die
          <rect
            x="95"
            y="35"
            width="90"
            height="70"
            rx="4"
            fill={accentColor}
            fillOpacity="0.1"
            stroke={accentColor}
            strokeWidth="1.5"
          />
        )}

        {/* HBM Stacks on sides */}
        <rect x="40" y="35" width="22" height="28" rx="2" fill="#1E293B" stroke={secondaryColor} strokeWidth="1" />
        <text x="51" y="52" fill={secondaryColor} fontSize="8" fontFamily="monospace" textAnchor="middle">HBM</text>

        <rect x="40" y="75" width="22" height="28" rx="2" fill="#1E293B" stroke={secondaryColor} strokeWidth="1" />
        <text x="51" y="92" fill={secondaryColor} fontSize="8" fontFamily="monospace" textAnchor="middle">HBM</text>

        <rect x="218" y="35" width="22" height="28" rx="2" fill="#1E293B" stroke={secondaryColor} strokeWidth="1" />
        <text x="229" y="52" fill={secondaryColor} fontSize="8" fontFamily="monospace" textAnchor="middle">HBM</text>

        <rect x="218" y="75" width="22" height="28" rx="2" fill="#1E293B" stroke={secondaryColor} strokeWidth="1" />
        <text x="229" y="92" fill={secondaryColor} fontSize="8" fontFamily="monospace" textAnchor="middle">HBM</text>

        {/* Internal core matrix visualization */}
        <circle cx="120" cy="55" r="2" fill={accentColor} />
        <circle cx="140" cy="55" r="2" fill={accentColor} />
        <circle cx="160" cy="55" r="2" fill={accentColor} />
        <circle cx="120" cy="70" r="2" fill={accentColor} />
        <circle cx="140" cy="70" r="2" fill={accentColor} />
        <circle cx="160" cy="70" r="2" fill={accentColor} />
        <circle cx="120" cy="85" r="2" fill={accentColor} />
        <circle cx="140" cy="85" r="2" fill={accentColor} />
        <circle cx="160" cy="85" r="2" fill={accentColor} />
      </svg>
    </div>
  );
}
