import { useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { Clock, LayoutGrid, Table2 } from 'lucide-react';
import { evaluateFlightStatus } from '../utils/aerodynamics';
import HourlyCard from './HourlyCard';
import HourlyTable from './HourlyTable';

const HourlyForecast = forwardRef(function HourlyForecast(
  { hourly = [], locationName = '', thresholds, windUnit = 'mph' },
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
    <section className="avionics-panel space-y-4 rounded-card border border-line bg-panel p-4 sm:p-6 shadow-panel">
      <div className="flex flex-col gap-3 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <Clock strokeWidth={2} className="h-5 w-5 text-avionics shrink-0" aria-hidden="true" />
          <h2 className="font-display text-base sm:text-lg font-bold text-ink">
            Hour-by-Hour Telemetry (Next 24h)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Filter hours by status" className="inline-flex flex-wrap rounded-control border border-line bg-panel-inset p-0.5">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              aria-pressed={filterMode === 'all'}
              className={`touch-target rounded-lg px-2.5 font-instrument text-2xs font-bold ${
                filterMode === 'all' ? 'bg-panel-raised text-avionics border border-line-strong' : 'text-ink-dim hover:text-ink'
              }`}
            >
              ALL ({hourly.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('good')}
              aria-pressed={filterMode === 'good'}
              className={`touch-target rounded-lg px-2.5 font-instrument text-2xs font-bold ${
                filterMode === 'good' ? 'bg-good-surface text-good-ink border border-good-line' : 'text-ink-dim hover:text-ink'
              }`}
            >
              GO ({goodCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('flyable')}
              aria-pressed={filterMode === 'flyable'}
              className={`touch-target rounded-lg px-2.5 font-instrument text-2xs font-bold ${
                filterMode === 'flyable' ? 'bg-caution-surface text-caution-ink border border-caution-line' : 'text-ink-dim hover:text-ink'
              }`}
            >
              GO+MOD ({goodCount + marginalCount})
            </button>
          </div>

          <div role="group" aria-label="Forecast view layout" className="inline-flex rounded-control border border-line bg-panel-inset p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              aria-pressed={viewMode === 'cards'}
              className={`touch-target inline-flex items-center gap-1.5 rounded-lg px-2.5 font-instrument text-2xs font-bold ${
                viewMode === 'cards' ? 'bg-panel-raised text-ink border border-line-strong' : 'text-ink-dim hover:text-ink'
              }`}
            >
              <LayoutGrid strokeWidth={2} className="h-4 w-4" aria-hidden="true" />
              CARDS
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
              className={`touch-target inline-flex items-center gap-1.5 rounded-lg px-2.5 font-instrument text-2xs font-bold ${
                viewMode === 'table' ? 'bg-panel-raised text-ink border border-line-strong' : 'text-ink-dim hover:text-ink'
              }`}
            >
              <Table2 strokeWidth={2} className="h-4 w-4" aria-hidden="true" />
              TABLE
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-control border border-line bg-panel-inset p-6 text-center space-y-3">
          <p className="font-instrument text-xs text-ink-soft">No hours match the selected flyability filter.</p>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className="touch-target rounded-control border border-line-strong bg-panel-raised px-4 font-instrument text-xs font-bold text-avionics"
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
    </section>
  );
});

export default HourlyForecast;
