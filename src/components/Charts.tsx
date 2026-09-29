interface LineChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
  fill?: boolean;
  unit?: string;
  maxValue?: number;
}

export function LineChart({
  data,
  labels,
  color = '#3b82f6',
  height = 160,
  fill = true,
  unit = '',
  maxValue,
}: LineChartProps) {
  const width = 600;
  const padding = { top: 16, right: 16, bottom: 24, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (data.length === 0) return <div style={{ height }} />;

  const max = maxValue ?? Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padding.left + (i / Math.max(1, data.length - 1)) * chartW;
    const y = padding.top + chartH - ((v - min) / range) * chartH;
    return { x, y, value: v };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${padding.left + chartW} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => padding.top + t * chartH);
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((t) => max - t * range);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {gridLines.map((y, i) => (
        <g key={i}>
          <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y}
            stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
          <text x={padding.left - 6} y={y + 4} textAnchor="end"
            className="fill-current text-[10px] opacity-40" fontFamily="monospace">
            {gridValues[i].toFixed(0)}
          </text>
        </g>
      ))}

      {/* Area */}
      {fill && <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />}

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color}
          className={i === points.length - 1 ? 'animate-pulse' : ''}
        />
      ))}

      {/* Labels */}
      {labels && labels.length > 0 && (
        <>
          {labels.map((label, i) => {
            const idx = Math.floor((i / (labels.length - 1)) * (data.length - 1));
            const x = padding.left + (idx / Math.max(1, data.length - 1)) * chartW;
            return (
              <text key={i} x={x} y={height - 6} textAnchor="middle"
                className="fill-current text-[9px] opacity-40" fontFamily="monospace">
                {label}
              </text>
            );
          })}
        </>
      )}

      {/* Last value badge */}
      {points.length > 0 && (
        <text x={points[points.length - 1].x} y={points[points.length - 1].y - 8}
          textAnchor="middle" className="fill-current text-[10px] font-bold" fontFamily="monospace">
          {data[data.length - 1].toFixed(1)}{unit}
        </text>
      )}
    </svg>
  );
}

interface MultiLineChartProps {
  series: { name: string; data: number[]; color: string }[];
  labels?: string[];
  height?: number;
  unit?: string;
}

export function MultiLineChart({ series, labels, height = 200, unit = '' }: MultiLineChartProps) {
  const width = 600;
  const padding = { top: 20, right: 16, bottom: 28, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const allValues = series.flatMap((s) => s.data);
  if (allValues.length === 0) return <div style={{ height }} />;
  const max = Math.max(...allValues) * 1.1;
  const min = Math.min(...allValues) * 0.85;
  const range = max - min || 1;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => padding.top + t * chartH);
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((t) => max - t * range);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      {/* Grid */}
      {gridLines.map((y, i) => (
        <g key={i}>
          <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y}
            stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
          <text x={padding.left - 6} y={y + 4} textAnchor="end"
            className="fill-current text-[10px] opacity-40" fontFamily="monospace">
            {gridValues[i].toFixed(0)}
          </text>
        </g>
      ))}

      {/* Series */}
      {series.map((s) => {
        const points = s.data.map((v, i) => {
          const x = padding.left + (i / Math.max(1, s.data.length - 1)) * chartW;
          const y = padding.top + chartH - ((v - min) / range) * chartH;
          return { x, y };
        });
        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
        return (
          <g key={s.name}>
            <path d={pathD} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="2" fill={s.color} />
            ))}
          </g>
        );
      })}

      {/* Labels */}
      {labels && labels.length > 0 && (
        <>
          {labels.map((label, i) => {
            const idx = Math.floor((i / (labels.length - 1)) * Math.max(1, (series[0]?.data.length ?? 1) - 1));
            const x = padding.left + (idx / Math.max(1, (series[0]?.data.length ?? 1) - 1)) * chartW;
            return (
              <text key={i} x={x} y={height - 8} textAnchor="middle"
                className="fill-current text-[9px] opacity-40" fontFamily="monospace">
                {label}
              </text>
            );
          })}
        </>
      )}

      {/* Legend */}
      {series.map((s, i) => (
        <g key={s.name} transform={`translate(${padding.left + i * 120}, 8)`}>
          <rect x="0" y="0" width="10" height="10" rx="2" fill={s.color} />
          <text x="14" y="9" className="fill-current text-[10px] opacity-60" fontFamily="sans-serif">
            {s.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

interface GaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  color?: string;
  size?: number;
}

export function Gauge({ value, min, max, label, unit, color = '#3b82f6', size = 140 }: GaugeProps) {
  const radius = size / 2 - 16;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 135;
  const endAngle = 405;
  const angle = startAngle + ((value - min) / (max - min)) * (endAngle - startAngle);

  const polarToCartesian = (r: number, a: number) => {
    const rad = (a * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (r: number, a1: number, a2: number) => {
    const start = polarToCartesian(r, a1);
    const end = polarToCartesian(r, a2);
    const large = a2 - a1 > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
  };

  const needleEnd = polarToCartesian(radius - 8, angle);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
        {/* Track */}
        <path d={arcPath(radius, startAngle, endAngle)} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="10" strokeLinecap="round" />
        {/* Value arc */}
        <path d={arcPath(radius, startAngle, angle)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill={color} />
        {/* Value text */}
        <text x={cx} y={cy + 28} textAnchor="middle" className="fill-current text-xl font-bold" fontFamily="sans-serif">
          {value.toFixed(1)}
        </text>
        <text x={cx} y={cy + 42} textAnchor="middle" className="fill-current text-[10px] opacity-50" fontFamily="monospace">
          {unit}
        </text>
      </svg>
      <p className="-mt-1 text-xs font-medium opacity-60">{label}</p>
    </div>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  unit?: string;
}

export function BarChart({ data, height = 180, unit = '' }: BarChartProps) {
  const width = 500;
  const padding = { top: 16, right: 16, bottom: 36, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const max = Math.max(...data.map((d) => d.value)) * 1.15 || 1;
  const barW = chartW / data.length * 0.6;
  const gap = chartW / data.length * 0.4;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => padding.top + t * chartH);
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((t) => max - t * max);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      {gridLines.map((y, i) => (
        <g key={i}>
          <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y}
            stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
          <text x={padding.left - 6} y={y + 4} textAnchor="end"
            className="fill-current text-[10px] opacity-40" fontFamily="monospace">
            {gridValues[i].toFixed(0)}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const barH = (d.value / max) * chartH;
        const x = padding.left + i * (barW + gap) + gap / 2;
        const y = padding.top + chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="4"
              fill={d.color ?? '#3b82f6'} opacity="0.85" />
            <text x={x + barW / 2} y={y - 6} textAnchor="middle"
              className="fill-current text-[10px] font-bold" fontFamily="monospace">
              {d.value.toFixed(1)}{unit}
            </text>
            <text x={x + barW / 2} y={height - 12} textAnchor="middle"
              className="fill-current text-[9px] opacity-50" fontFamily="sans-serif">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function Sparkline({ data, color = '#3b82f6', height = 32, width = 80 }: SparklineProps) {
  if (data.length < 2) return <div style={{ height, width }} />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width, height }} className="inline-block">
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
