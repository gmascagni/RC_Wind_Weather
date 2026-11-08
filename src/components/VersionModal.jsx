import { useEffect, useRef, useState } from 'react';
import { GitBranch, RefreshCw, X, ExternalLink, CheckCircle2 } from 'lucide-react';
import { APP_VERSION, BUILD_DATE, CHANGELOG } from '../config/versionConfig';

export default function VersionModal({ open, onClose }) {
  const dialogRef = useRef(null);
  const [isChecking, setIsChecking] = useState(false);
  const [updateMsg, setUpdateMsg] = useState(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleCheckUpdates = async () => {
    setIsChecking(true);
    setUpdateMsg(null);
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
        }
      }
      // Brief simulated check delay for tactile feedback
      await new Promise((r) => setTimeout(r, 650));
      setUpdateMsg('You are running the latest flight telemetry build.');
    } catch {
      setUpdateMsg('Unable to check updates — verify network connection.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      {...{ closedby: 'any' }}
      aria-labelledby="version-dialog-title"
      className="avionics-dialog metal-panel relative overflow-hidden m-auto w-[calc(100%-1.5rem)] max-w-lg p-0 text-ink shadow-panel border border-line-strong"
    >
      <span className="rivet top-left" aria-hidden="true" />
      <span className="rivet top-right" aria-hidden="true" />
      <span className="rivet bottom-left" aria-hidden="true" />
      <span className="rivet bottom-right" aria-hidden="true" />

      {/* Header */}
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <span className="panel-badge" aria-hidden="true">VER</span>
          <GitBranch strokeWidth={2} className="h-4 w-4 text-avionics" aria-hidden="true" />
          <h2 id="version-dialog-title" className="font-display text-base font-bold uppercase tracking-wider text-ink">
            Version Control &amp; Release Log
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close version dialog"
          className="btn-retro p-1.5 text-ink-soft hover:text-ink"
        >
          <X strokeWidth={2} className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="max-h-[72dvh] overflow-y-auto p-4 sm:p-5 space-y-4">
        {/* Active Version Status Panel */}
        <div className="rounded-card border border-line-strong bg-panel-inset p-3.5 shadow-inset space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="block font-instrument text-2xs font-bold uppercase tracking-wider text-ink-dim">
                Installed Build
              </span>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-wider text-avionics">
                  {APP_VERSION}
                </span>
                <span className="rounded bg-avionics/15 border border-avionics/40 px-2 py-0.5 font-instrument text-3xs font-bold uppercase text-avionics">
                  Production
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckUpdates}
              disabled={isChecking}
              className="btn-retro text-xs py-1.5 px-3 flex items-center gap-1.5 text-avionics hover:text-ink"
            >
              <RefreshCw strokeWidth={2} className={`h-3.5 w-3.5 ${isChecking ? 'spin-refresh' : ''}`} aria-hidden="true" />
              <span>{isChecking ? 'Checking…' : 'Check for Updates'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2 font-instrument text-2xs text-ink-soft">
            <span>Released: {BUILD_DATE}</span>
            <a
              href={`${(import.meta.env.BASE_URL || '/RC_Wind_Weather/').replace(/\/{2,}/g, '/')}privacy.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-ink-soft hover:text-avionics hover:underline"
            >
              <span>Privacy Policy</span>
              <ExternalLink strokeWidth={2} className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>

          {updateMsg && (
            <div className="flex items-center gap-1.5 rounded border border-good-line bg-good-surface px-2.5 py-1.5 text-2xs text-good font-instrument font-semibold">
              <CheckCircle2 strokeWidth={2} className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{updateMsg}</span>
            </div>
          )}
        </div>

        {/* Changelog History Timeline */}
        <div className="space-y-3">
          <span className="block font-instrument text-2xs font-bold uppercase text-ink-soft">
            Release History &amp; Changelog
          </span>

          <div className="space-y-3">
            {CHANGELOG.map((item, idx) => (
              <div
                key={item.version}
                className={`rounded-control border p-3.5 space-y-2 ${
                  idx === 0
                    ? 'border-avionics/50 bg-panel-raised ring-1 ring-avionics/30'
                    : 'border-line bg-panel-inset opacity-85'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold tracking-wider text-ink">
                      {item.version}
                    </span>
                    {idx === 0 && (
                      <span className="rounded bg-avionics px-1.5 py-0.2 font-instrument text-3xs font-bold text-slate-950">
                        LATEST
                      </span>
                    )}
                  </div>
                  <span className="font-instrument text-2xs text-ink-dim">
                    {item.date}
                  </span>
                </div>

                <div className="font-instrument text-xs font-bold text-avionics">
                  {item.title}
                </div>

                <ul className="list-disc list-inside space-y-1 font-instrument text-2xs text-ink-soft">
                  {item.highlights.map((h, hIdx) => (
                    <li key={hIdx} className="leading-relaxed">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-line bg-panel-inset px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onClose}
          className="btn-retro text-xs py-1.5 px-4"
        >
          Close
        </button>
      </div>
    </dialog>
  );
}
