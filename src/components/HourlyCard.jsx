import { ArrowUp } from 'lucide-react';
import { STATUS_THEME, convertWind, getUnitLabel } from '../config/flightConfig';
import { evaluateFlightStatus } from '../utils/aerodynamics';
import { StatusIcon } from './StatusVisuals';

export default function HourlyCard({ item, thresholds, windUnit }) {
  const unit = getUnitLabel(windUnit);
  const st = evaluateFlightStatus(item, thresholds);
  const theme = STATUS_THEME[st.level];
  const flowToDeg = (item.windDirection + 180) % 360;
  const scaleVal = Math.min(1, item.windSpeed / Math.max(20, thresholds.maxSustainedWindMph * 1.3));

  return (
    <article
      data-iso={item.isoTime}
      className={`forecast-strip-card flex min-w-[9.5rem] shrink-0 flex-col justify-between rounded-control border p-3 shadow-inset ${
        item.isCurrentHour ? `${theme.border} bg-panel-raised ring-1 ${theme.border}` : 'border-line-strong bg-panel-inset'
      }`}
    >
      <div className={`-mx-3 -mt-3 mb-2.5 h-1.5 rounded-t-control ${theme.bar}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-1">
        <div>
          <div className="font-instrument text-sm font-bold text-ink">{item.timeLabel}</div>
          <div className="font-instrument text-2xs text-ink-dim">{item.dayLabel}</div>
        </div>
        <span className={`status-badge inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-instrument text-2xs font-bold ${theme.border} ${theme.bg} ${theme.ink}`}>
          <StatusIcon level={st.level} className="h-3 w-3" />
          {st.shortTag}
        </span>
      </div>

      <div className="my-2.5 space-y-1 font-instrument">
        <div className="flex items-baseline justify-between">
          <span className="text-2xs text-ink-dim font-bold">WIND</span>
          <span className={`text-lg font-bold ${theme.text}`}>
            {convertWind(item.windSpeed, windUnit)} <span className="text-2xs text-ink-soft">{unit}</span>
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xs text-ink-dim font-bold">GUST</span>
          <span className="text-sm font-bold text-ink">
            {convertWind(item.windGusts, windUnit)} <span className="text-2xs text-ink-soft">{unit}</span>
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-pill bg-panel border border-line">
          <div className={`meter-scale-bar h-full w-full rounded-pill ${theme.bar}`} style={{ '--meter-scale': scaleVal }} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-2 font-instrument text-2xs text-ink-soft">
        <span className="inline-flex items-center gap-1">
          <ArrowUp
            strokeWidth={2}
            className="wind-vector-rotate h-3.5 w-3.5 text-avionics shrink-0"
            style={{ '--wind-deg': `${flowToDeg}deg` }}
            aria-hidden="true"
          />
          <strong className="text-ink font-bold">{item.cardinal}</strong>
          <span className="text-ink-dim">{item.windDirection}°</span>
        </span>
        <span className="font-bold">{item.temperature}°F</span>
      </div>
    </article>
  );
}
