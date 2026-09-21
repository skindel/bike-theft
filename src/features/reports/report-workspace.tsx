'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Check,
  FileDown,
  ShieldCheck,
  Trash2,
  ArrowUpRight,
  Bike,
  MapPin,
  FileText,
} from 'lucide-react';
import { reportSchema, type TheftReport, type SavedReport } from '@/contracts';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
function summary(report: SavedReport) {
  return `CYCLEGUARD — PERSONAL THEFT SUMMARY\nPrepared for your official police report. This document is not the report itself.\n\nBike: ${report.brand} / ${report.type} / ${report.color}\nFrame number: ${report.serial || 'Unknown'}\nLocation: ${report.location}\nLast seen (entered local time): ${report.lastSeen}\nDiscovered missing (entered local time): ${report.discovered}\n\nDetails:\n${report.details || 'None provided'}\n\nPrepared: ${report.createdAt}\nReference: ${report.id}`;
}
function download(report: SavedReport) {
  const url = URL.createObjectURL(
    new Blob([summary(report)], { type: 'text/plain;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `bikewatch-report-${report.id.slice(0, 8)}.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ReportWorkspace() {
  const { reports, saveReport, deleteReport } = useStore();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TheftReport>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      brand: '',
      color: '',
      type: 'City bike',
      serial: '',
      location: '',
      lastSeen: '',
      discovered: '',
      details: '',
      shareAggregate: false,
    },
  });
  async function onSubmit(values: TheftReport) {
    setSubmitError(null);
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        lastSeen: new Date(values.lastSeen).toISOString(),
        discovered: new Date(values.discovered).toISOString(),
      }),
    });
    const result = (await response.json()) as {
      report?: Pick<SavedReport, 'id' | 'createdAt' | 'location' | 'neighbourhood'>;
      error?: { message?: string; fieldErrors?: { location?: string[] } };
    };
    if (!response.ok || !result.report) {
      const locationError = result.error?.fieldErrors?.location?.[0];
      if (locationError) setError('location', { message: locationError });
      setSubmitError(result.error?.message ?? 'We could not save the report. Please try again.');
      return;
    }
    const report = saveReport(values, result.report);
    setSavedId(report.id);
    reset();
  }
  const error = (name: keyof TheftReport) =>
    errors[name] && (
      <span className="field-error" role="alert">
        {errors[name]?.message}
      </span>
    );
  return (
    <>
      <section className="page-heading">
        <div>
          <div className="eyebrow">LET’S TAKE THE NEXT STEP</div>
          <h1>Missing bike? Start here.</h1>
          <p>Get the details together. We’ll help you prepare a clear report.</p>
        </div>
        <span className="page-icon">
          <FileText size={26} />
        </span>
      </section>
      <div className="notice">
        <ShieldCheck size={19} />
        <p>
          <strong>Private to you.</strong> We verify the address against Dutch address records and
          keep your report to yourself. Filing with the police is a separate step, and we link you
          straight to it.
        </p>
      </div>
      {savedId && (
        <div className="success-notice" role="status">
          <Check size={20} />
          <div>
            <strong>Report saved.</strong>
            <p>
              Download your summary, then file with the police — that’s the step that opens a case.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() =>
              document.getElementById('your-reports')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            View summary
          </Button>
        </div>
      )}
      <div className="content-columns">
        <form className="panel form-panel" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-section-heading">
            <span>
              <Bike size={19} />
            </span>
            <div>
              <h2>About your bike</h2>
              <p>The small details can make a big difference.</p>
            </div>
            <span className="step-label">01</span>
          </div>
          <div className="form-grid">
            <label>
              Brand <span className="required">*</span>
              <input
                {...register('brand')}
                placeholder="e.g. Gazelle"
                aria-invalid={!!errors.brand}
              />
              {error('brand')}
            </label>
            <label>
              Bike type
              <select {...register('type')}>
                <option>City bike</option>
                <option>E-bike</option>
                <option>Road bike</option>
                <option>Cargo bike</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Color <span className="required">*</span>
              <input
                {...register('color')}
                placeholder="e.g. Dark green"
                aria-invalid={!!errors.color}
              />
              {error('color')}
            </label>
            <label>
              Frame / serial number <span className="optional">optional</span>
              <input {...register('serial')} placeholder="Leave blank if unknown" />
              {error('serial')}
            </label>
          </div>
          <div className="form-section-heading section-divider">
            <span>
              <MapPin size={19} />
            </span>
            <div>
              <h2>Where and when</h2>
              <p>Give as much detail as you remember.</p>
            </div>
            <span className="step-label">02</span>
          </div>
          <div className="form-grid">
            <label className="full-width">
              Location in Maastricht <span className="required">*</span>
              <input
                {...register('location')}
                placeholder="Street and house number, e.g. Vrijthof 1"
                aria-invalid={!!errors.location}
              />
              {error('location')}
            </label>
            <label>
              Last seen <span className="required">*</span>
              <input
                type="datetime-local"
                {...register('lastSeen')}
                aria-invalid={!!errors.lastSeen}
              />
              {error('lastSeen')}
            </label>
            <label>
              Discovered missing <span className="required">*</span>
              <input
                type="datetime-local"
                {...register('discovered')}
                aria-invalid={!!errors.discovered}
              />
              {error('discovered')}
            </label>
            <label className="full-width">
              Anything else? <span className="optional">optional</span>
              <textarea
                {...register('details')}
                placeholder="Lock used, distinctive marks, or what happened…"
                rows={4}
              />
              {error('details')}
            </label>
          </div>
          <p className="form-hint">
            Enter a complete Maastricht address. We verify it against Dutch address records and add
            its neighbourhood automatically. Times are interpreted in your device’s timezone.
          </p>
          <label className="checkbox-label">
            <input type="checkbox" {...register('shareAggregate')} />
            <span>
              I would like to contribute anonymous area-level information to the map.
              <small>
                Your preference is stored with the report; it does not immediately change the map.
              </small>
            </span>
          </label>
          {submitError && (
            <div className="field-error" role="alert">
              {submitError}
            </div>
          )}
          <div className="form-bottom">
            <span>* Required fields</span>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Validating and saving…' : 'Save report'} <ArrowUpRight size={17} />
            </Button>
          </div>
        </form>
        <aside className="help-column">
          <section className="help-card">
            <div className="eyebrow">ONE STEP AT A TIME</div>
            <h2>
              A little preparation
              <br />
              goes a long way.
            </h2>
            <ol>
              <li>
                <span>1</span>
                <div>
                  <strong>Collect the details</strong>
                  <p>Brand, color, frame number and the last place you saw your bike.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Keep your summary</strong>
                  <p>Download a copy to help you describe what happened.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>File it with the police</strong>
                  <p>This is the step that opens a case. Their site has the current process.</p>
                </div>
              </li>
            </ol>
            <a
              className="text-link"
              href="https://www.politie.nl/informatie/fiets-gestolen-doe-aangifte.html"
              target="_blank"
              rel="noreferrer"
            >
              Official police guidance <ArrowUpRight size={16} />
            </a>
          </section>
          <div className="small-note">
            <ShieldCheck size={20} />
            <p>A CycleGuard summary gets you ready. The police report opens the case.</p>
          </div>
        </aside>
      </div>
      <section id="your-reports" className="panel saved-reports">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">SAVED REPORTS</div>
            <h2>Your report summaries</h2>
          </div>
          <span className="count-pill">{reports.length}</span>
        </div>
        {reports.length === 0 ? (
          <div className="empty-state">
            No reports yet. Your prepared summaries will appear here.
          </div>
        ) : (
          reports.map((report) => (
            <div className="saved-report" key={report.id}>
              <span className="overview-icon mint">
                <Bike size={22} />
              </span>
              <div>
                <strong>
                  {report.color} {report.brand}
                </strong>
                <small>
                  {report.location}
                  {report.neighbourhood ? ` · ${report.neighbourhood}` : ''} · {report.type}
                </small>
              </div>
              <Button variant="secondary" onClick={() => download(report)}>
                <FileDown size={16} /> Download summary
              </Button>
              <button
                className="icon-button"
                aria-label={`Remove report summary for ${report.brand}`}
                onClick={() => {
                  deleteReport(report.id);
                  if (savedId === report.id) setSavedId(null);
                }}
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))
        )}
      </section>
    </>
  );
}
