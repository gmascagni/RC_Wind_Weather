import { ArrowUp, Thermometer } from 'lucide-react';
import { STATUS_THEME, convertWind, getUnitLabel } from '../config/flightConfig';
import { evaluateFlightStatus } from '../utils/aerodynamics';
import { StatusIcon } from './StatusVisuals';

export default function HourlyTable({ hourly, locationName, thresholds, windUnit }) {
  const unit = getUnitLabel(windUnit);

  return (
    <div
      tabIndex={0}
      role="region"
      aria-labelledby="hourly-table-caption"
      className="table-wrapper rounded-control border border-line bg-panel-inset"
    >
      <table className="tactical-table text-left text-sm">
        <caption id="hourly-table-caption" className="visually-hidden">
          24-hour forecast telemetry table for {locationName}
        </caption>
        <thead className="border-b border-line bg-panel font-instrument text-2xs uppercase tracking-wider text-ink-soft">
          <tr>
            <th scope="col" className="bg-panel px-3.5 py-3 border-b border-line">Time</th>
            <th scope="col" className="bg-panel px-3.5 py-3 border-b border-line">Temp</th>
            <th scope="col" className="bg-panel px-3.5 py-3 border-b border-line">Wind ({unit})</th>
            <th scope="col" className="bg-panel px-3.5 py-3 border-b border-line">Gusts ({unit})</th>
            <th scope="col" className="bg-panel px-3.5 py-3 border-b border-line">Wind From</th>
            <th scope="col" className="bg-panel px-3.5 py-3 border-b border-line">Verdict</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line font-instrument">
          {hourly.map((item) => {
            const st = evaluateFlightStatus(item, thresholds);
            const theme = STATUS_THEME[st.level];
            const flowToDeg = (item.windDirection + 180) % 360;

            return (
              <tr
                key={item.epochSec}
                className={`transition hover:bg-panel-raised ${item.isCurrentHour ? 'bg-avionics-soft' : ''}`}
              >
                <th scope="row" className="px-3.5 py-2.5 font-bold text-ink whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <StatusIcon level={st.level} className="h-3.5 w-3.5" />
                    <span>{item.timeLabel}</span>
                    <span className="rounded bg-panel-raised px-1.5 py-0.5 text-2xs font-normal text-ink-dim">
                      {item.dayLabel}
                    </span>
                  </div>
                </th>

                <td className="px-3.5 py-2.5 text-ink-soft whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    <Thermometer strokeWidth={2} className="h-3.5 w-3.5 text-caution" aria-hidden="true" />
                    {item.temperature}°F
                  </span>
                </td>

                <td className={`px-3.5 py-2.5 font-bold whitespace-nowrap ${theme.text}`}>
                  {convertWind(item.windSpeed, windUnit)} {unit}
                </td>

                <td className="px-3.5 py-2.5 text-ink whitespace-nowrap">
                  <span>{convertWind(item.windGusts, windUnit)} {unit}</span>
                  <span className="ml-1.5 text-2xs text-ink-dim">
                    (Δ +{convertWind(st.gustSpread, windUnit)})
                  </span>
                </td>

                <td className="px-3.5 py-2.5 text-ink-soft whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowUp
                      strokeWidth={2}
                      className="wind-vector-rotate h-3.5 w-3.5 text-avionics shrink-0"
                      style={{ '--wind-deg': `${flowToDeg}deg` }}
                      aria-hidden="true"
                    />
                    <strong className="text-ink">{item.cardinal}</strong>
                    <span className="text-2xs text-avionics">({String(item.windDirection).padStart(3, '0')}°)</span>
                  </span>
                </td>

                <td className="px-3.5 py-2.5 whitespace-nowrap">
                  <span className={`status-badge inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5 text-2xs font-bold ${theme.border} ${theme.bg} ${theme.ink}`}>
                    <StatusIcon level={st.level} className="h-3.5 w-3.5" />
                    {st.verdict}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
