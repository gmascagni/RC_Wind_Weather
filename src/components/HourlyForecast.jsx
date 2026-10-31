import { useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { Clock, LayoutGrid, Table2 } from 'lucide-react';
import { evaluateFlightStatus } from '../utils/aerodynamics';
import HourlyCard from './HourlyCard';
import HourlyTable from './HourlyTable';

const HourlyForecast = forwardRef(function HourlyForecast(
  {
    hourly = [],
    locationName = '',
    thresholds,
    windUnit = 'mph',
    forecastDay = 'today',
    onChangeForecastDay,
    tomorrowDateLabel = '',
    tomorrowWeekday = '',
  },
  ref
) {
  const [filterMode, setFilterMode] = useState('all');
  const [viewMode, setViewMode] = useState('cards');
  const stripRef = useRef(null);

  useImperativeHandle(ref, () => ({
    scrollToIso(isoTime) {
      setViewMode('cards');
      setFilterMode('all');
      requestAnimationFrame(() => {
        const el = stripRef.current?.querySelector(`[data-iso="${isoTime}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    },
  }));

  const goodCount = hourly.filter((h) => evaluateFlightStatus(h, thresholds).level === 'good').length;
  const marginalCount = hourly.filter((h) => evaluateFlightStatus(h, thresholds).level === 'marginal').length;

  const filtered = hourly.filter((h) => {
    const level = evaluateFlightStatus(h, thresholds).level;
    if (filterMode === 'good') return level === 'good';
    if (filterMode === 'flyable') return level === 'good' || level === 'marginal';
    return true;
  });

  return (
    <section className="metal-panel avionics-panel relative overflow-hidden">
      <span className="rivet top-left" aria-hidden="true" />
      <span className="rivet top-right" aria-hidden="true" />
      <span className="rivet bottom-left" aria-hidden="true" />
      <span className="rivet bottom-right" aria-hidden="true" />

      {/* WWII Cockpit Header */}
      <div className="panel-header flex-wrap justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="panel-badge" aria-hidden="true">02</span>
          <Clock strokeWidth={2} className="h-4 w-4 text-avionics shrink-0" aria-hidden="true" />
          <h2 className="font-display text-sm sm:text-base font-bold uppercase tracking-wider text-ink truncate">
            Chrono Telemetry • {forecastDay === 'tomorrow' ? `Tomorrow (${tomorrowDateLabel || 'Next Day'})` : 'Next 24h'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Day Selector Buttons: Today vs Tomorrow */}
          <div role="group" aria-label="Forecast day view" className="inline-flex rounded border border-line-strong bg-panel-inset p-0.5">
            <button
              type="button"
              onClick={() => onChangeForecastDay?.('today')}
              aria-pressed={forecastDay === 'today'}
              className={`btn-retro text-2xs py-1 px-2.5 font-bold ${
                forecastDay === 'today' ? 'border-avionics text-avionics bg-panel-raised ring-1 ring-avionics/40' : 'text-ink-dim border-transparent'
              }`}
            >
              TODAY
            </button>
            <button
              type="button"
              onClick={() => onChangeForecastDay?.('tomorrow')}
              aria-pressed={forecastDay === 'tomorrow'}
              className={`btn-retro text-2xs py-1 px-2.5 font-bold ${
                forecastDay === 'tomorrow' ? 'border-avionics text-avionics bg-panel-raised ring-1 ring-avionics/40' : 'text-ink-dim border-transparent'
              }`}
            >
              TOMORROW {tomorrowWeekday ? `(${tomorrowWeekday.toUpperCase()})` : ''}
            </button>
          </div>

          <div role="group" aria-label="Filter hours by status" className="inline-flex flex-wrap rounded border border-line-strong bg-panel-inset p-0.5">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              aria-pressed={filterMode === 'all'}
              className={`btn-retro text-2xs py-1 px-2.5 ${
                filterMode === 'all' ? 'border-avionics text-avionics bg-panel-raised' : 'text-ink-dim border-transparent'
              }`}
            >
              ALL ({hourly.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('good')}
              aria-pressed={filterMode === 'good'}
              className={`btn-retro text-2xs py-1 px-2.5 ${
                filterMode === 'good' ? 'border-good-line text-good-ink bg-good-surface' : 'text-ink-dim border-transparent'
              }`}
            >
              GO ({goodCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('flyable')}
              aria-pressed={filterMode === 'flyable'}
              className={`btn-retro text-2xs py-1 px-2.5 ${
                filterMode === 'flyable' ? 'border-caution-line text-caution-ink bg-caution-surface' : 'text-ink-dim border-transparent'
              }`}
            >
              GO+CAUTION ({goodCount + marginalCount})
            </button>
          </div>

          <div role="group" aria-label="Forecast view layout" className="inline-flex rounded border border-line-strong bg-panel-inset p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              aria-pressed={viewMode === 'cards'}
              className={`btn-retro text-2xs py-1 px-2.5 inline-flex items-center gap-1 ${
                viewMode === 'cards' ? 'border-avionics text-ink bg-panel-raised' : 'text-ink-dim border-transparent'
              }`}
            >
              <LayoutGrid strokeWidth={2} className="h-3.5 w-3.5" aria-hidden="true" />
              CARDS
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
              className={`btn-retro text-2xs py-1 px-2.5 inline-flex items-center gap-1 ${
                viewMode === 'table' ? 'border-avionics text-ink bg-panel-raised' : 'text-ink-dim border-transparent'
              }`}
            >
              <Table2 strokeWidth={2} className="h-3.5 w-3.5" aria-hidden="true" />
              TABLE
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {filtered.length === 0 ? (
          <div className="rounded-control border border-line bg-panel-inset p-6 text-center space-y-3">
            <p className="font-instrument text-xs text-ink-soft">No hours match the selected flyability filter.</p>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className="btn-retro text-avionics"
            >
              Show All 24 Hours
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <HourlyTable hourly={filtered} locationName={locationName} thresholds={thresholds} windUnit={windUnit} />
        ) : (
          <div
            ref={stripRef}
            tabIndex={0}
            role="region"
            aria-label={`24-hour forecast cards for ${locationName}`}
            className="forecast-strip-scroller flex gap-2.5 pb-2 pt-0.5 rounded-control"
          >
            {filtered.map((item) => (
              <HourlyCard key={item.epochSec} item={item} thresholds={thresholds} windUnit={windUnit} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

export default HourlyForecast;
