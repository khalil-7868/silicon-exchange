'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { UtilizationSample } from '@/types/listing';
import { PulseIcon } from '@/components/ui/Icons';

import { useMounted } from '@/lib/useMounted';

interface UtilizationChartProps {
  samples: UtilizationSample[];
  tdpWatts: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: readonly { payload: UtilizationSample }[];
  label?: string | number;
}

function CustomChartTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const date = new Date(data.timestamp);
  const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateFormatted = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div className="rounded-lg border border-cyan-500/30 bg-[#070A11]/95 p-3 shadow-xl backdrop-blur text-xs font-mono">
      <div className="text-[10px] text-slate-400 mb-1.5 border-b border-white/10 pb-1">
        {dateFormatted} {'//'} {timeFormatted} UTC
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4 text-cyan-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Utilization:
          </span>
          <span className="font-bold">{data.utilizationPercent}%</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-amber-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Power Draw:
          </span>
          <span className="font-bold">{data.powerWatts} W</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-slate-400 text-[10px]">
          <span>Core Thermal:</span>
          <span>{data.temperatureCelsius}°C</span>
        </div>
      </div>
    </div>
  );
}

export function UtilizationChart({ samples, tdpWatts }: UtilizationChartProps) {
  const mounted = useMounted();
  const [showTableAlternative, setShowTableAlternative] = useState(false);

  // Filter down to the last 24 samples (24 hours)
  const last24Hours = samples.slice(-24);

  // Accessible stats
  const avgUtil = Math.round(
    last24Hours.reduce((acc, curr) => acc + curr.utilizationPercent, 0) / (last24Hours.length || 1)
  );
  const peakUtil = Math.max(...last24Hours.map((s) => s.utilizationPercent));
  const avgPower = Math.round(
    last24Hours.reduce((acc, curr) => acc + curr.powerWatts, 0) / (last24Hours.length || 1)
  );

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E17] p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <PulseIcon size={16} className="text-cyan-400" />
            <h3 className="font-heading font-bold text-sm tracking-wide text-slate-900 dark:text-white uppercase">
              24-Hour Telemetry Trace
            </h3>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
            Hourly compute load & dynamic thermal power draw
          </p>
        </div>

        {/* Legend & A11y toggle */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
            <span className="w-2.5 h-1 rounded bg-cyan-400" />
            <span>Compute %</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-500">
            <span className="w-2.5 h-1 rounded bg-amber-400" />
            <span>Power (W)</span>
          </div>
          <button
            type="button"
            onClick={() => setShowTableAlternative(!showTableAlternative)}
            className="text-[10px] text-slate-400 hover:text-slate-200 underline focus:outline-none"
            aria-expanded={showTableAlternative}
          >
            {showTableAlternative ? 'Show Chart' : 'Accessible Table'}
          </button>
        </div>
      </div>

      {/* Quick Summary Metrics */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-400 block">Avg 24h Load</span>
          <span className="font-bold text-cyan-600 dark:text-cyan-400">{avgUtil}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Peak Load</span>
          <span className="font-bold text-slate-900 dark:text-white">{peakUtil}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Avg Power</span>
          <span className="font-bold text-amber-500">{avgPower} W <span className="text-[9px] text-slate-500">/ {tdpWatts}W</span></span>
        </div>
      </div>

      {/* Chart View */}
      {!showTableAlternative ? (
        <div className="h-64 w-full" aria-label="24-hour compute utilization chart">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last24Hours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getHours()}:00`;
                  }}
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="util"
                  domain={[0, 100]}
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  yAxisId="power"
                  orientation="right"
                  domain={[0, Math.ceil(tdpWatts * 1.1)]}
                  hide={true}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Line
                  yAxisId="util"
                  type="monotone"
                  dataKey="utilizationPercent"
                  stroke="#00F0FF"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#00F0FF', stroke: '#07090E', strokeWidth: 2 }}
                />
                <Line
                  yAxisId="power"
                  type="monotone"
                  dataKey="powerWatts"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  activeDot={{ r: 4, fill: '#F59E0B', stroke: '#07090E', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
              Initializing trace telemetry...
            </div>
          )}
        </div>
      ) : (
        /* Accessible Table Alternative */
        <div className="max-h-64 overflow-y-auto rounded border border-slate-200 dark:border-white/10 text-xs font-mono">
          <table className="w-full text-left">
            <caption className="sr-only">24-hour Utilization & Power Data Table</caption>
            <thead className="bg-slate-100 dark:bg-white/5 text-[10px] text-slate-400 uppercase">
              <tr>
                <th scope="col" className="p-2">Time (UTC)</th>
                <th scope="col" className="p-2">Utilization</th>
                <th scope="col" className="p-2">Power</th>
                <th scope="col" className="p-2">Temp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {last24Hours.map((sample) => (
                <tr key={sample.timestamp} className="hover:bg-white/5">
                  <td className="p-2 text-slate-400">
                    {new Date(sample.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </td>
                  <td className="p-2 font-bold text-cyan-400">{sample.utilizationPercent}%</td>
                  <td className="p-2 text-amber-400">{sample.powerWatts} W</td>
                  <td className="p-2 text-slate-400">{sample.temperatureCelsius}°C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
