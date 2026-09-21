'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowUpRight,
  BadgeCheck,
  Camera,
  Check,
  Crosshair,
  MapPin,
  MessageCircle,
  Plus,
  Shield,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import {
  huntListingSchema,
  huntSightingSchema,
  type HuntListing,
  type HuntListingInput,
  type HuntSighting,
  type HuntSightingInput,
} from '@/contracts';
import { useDemo } from '@/lib/demo-provider';
import { Button } from '@/components/ui/button';

type HuntFilter = 'all' | 'searching' | 'mine';

async function readBikePhoto(file: File) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new Error('Use a JPG, PNG, or WebP photo');
  }
  if (file.size > 1_200_000) {
    throw new Error('Keep the photo under 1.2 MB for this demo');
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read that photo'));
    reader.readAsDataURL(file);
  });
}

function statusLabel(status: HuntListing['status']) {
  if (status === 'recovered') return 'Recovered';
  if (status === 'claimed') return 'Sighting open';
  return 'Still missing';
}

export function BikeHunt() {
  const {
    huntListings,
    huntSightings,
    huntLeaderboard,
    addHuntListing,
    addHuntSighting,
    confirmHuntSighting,
    declineHuntSighting,
  } = useDemo();

  const [filter, setFilter] = useState<HuntFilter>('all');
  const [composing, setComposing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [findingId, setFindingId] = useState<string | null>(null);
  const [connection, setConnection] = useState<{
    listing: HuntListing;
    sighting: HuntSighting;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');

  const listingForm = useForm<HuntListingInput>({
    resolver: zodResolver(huntListingSchema),
    defaultValues: {
      title: '',
      description: '',
      lastSeenArea: '',
      contactEmail: '',
      imageDataUrl: '',
    },
  });

  const sightingForm = useForm<HuntSightingInput>({
    resolver: zodResolver(huntSightingSchema),
    defaultValues: {
      listingId: '',
      finderName: 'You · demo',
      finderContact: '',
      message: '',
    },
  });

  const filtered = useMemo(() => {
    return huntListings.filter((listing) => {
      if (filter === 'mine') return Boolean(listing.own);
      if (filter === 'searching') return listing.status !== 'recovered';
      return true;
    });
  }, [filter, huntListings]);

  const active = huntListings.find((listing) => listing.id === activeId) ?? null;
  const activeSightings = active
    ? huntSightings.filter((sighting) => sighting.listingId === active.id)
    : [];
  const topFinders = huntLeaderboard.slice(0, 3);

  async function onPhotoChange(fileList: FileList | null) {
    setPhotoError('');
    const file = fileList?.[0];
    if (!file) {
      setPhotoPreview('');
      listingForm.setValue('imageDataUrl', '', { shouldValidate: true });
      return;
    }
    try {
      const dataUrl = await readBikePhoto(file);
      setPhotoPreview(dataUrl);
      listingForm.setValue('imageDataUrl', dataUrl, { shouldValidate: true });
    } catch (error) {
      setPhotoPreview('');
      listingForm.setValue('imageDataUrl', '', { shouldValidate: true });
      setPhotoError(error instanceof Error ? error.message : 'Could not upload photo');
    }
  }

  function publishListing(input: HuntListingInput) {
    addHuntListing(input);
    listingForm.reset();
    setPhotoPreview('');
    setComposing(false);
    setFilter('mine');
    setStatusMessage('Your bike is now on Bike Hunt. Session-only — nothing leaves this demo.');
  }

  function openFound(listing: HuntListing) {
    setFindingId(listing.id);
    setActiveId(listing.id);
    sightingForm.reset({
      listingId: listing.id,
      finderName: 'You · demo',
      finderContact: '',
      message: '',
    });
  }

  function submitFound(input: HuntSightingInput) {
    const listing = huntListings.find((item) => item.id === input.listingId);
    if (!listing) return;
    const sighting = addHuntSighting(input);
    setFindingId(null);
    setActiveId(null);
    setConnection({ listing, sighting });
    setStatusMessage('Contact shared instantly. The owner can now confirm your find.');
  }

  return (
    <div className="hunt">
      <section className="hunt-hero">
        <div className="hunt-hero-copy">
          <p className="hunt-kicker">
            <Crosshair size={14} /> Bike Hunt · Maastricht
          </p>
          <h1>
            Stolen bikes,
            <br />
            <em>found by neighbours.</em>
          </h1>
          <p className="hunt-lede">
            Publish a portrait of your bike. When someone spots it, one tap opens a private
            connection — then you confirm the recovery and they rise on the city leaderboard.
          </p>
          <div className="hunt-hero-actions">
            <Button onClick={() => setComposing(true)}>
              <Camera size={17} /> List a stolen bike
            </Button>
            <a className="hunt-quiet-link" href="#hunt-gallery">
              Browse the board <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
        <div className="hunt-hero-panel" aria-hidden="true">
          <div className="hunt-hero-stat">
            <span>Active hunts</span>
            <strong>{huntListings.filter((l) => l.status !== 'recovered').length}</strong>
          </div>
          <div className="hunt-hero-stat">
            <span>Confirmed finds</span>
            <strong>{huntSightings.filter((s) => s.status === 'confirmed').length}</strong>
          </div>
          <div className="hunt-podium">
            <div className="hunt-podium-label">
              <Trophy size={14} /> Top finders
            </div>
            {topFinders.map((entry, index) => (
              <div className="hunt-podium-row" key={entry.id}>
                <span className="hunt-rank">0{index + 1}</span>
                <span className="avatar hunt-avatar">{entry.initials}</span>
                <div>
                  <strong>{entry.name}</strong>
                  <small>
                    {entry.finds} recovered {entry.finds === 1 ? 'bike' : 'bikes'}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="notice hunt-notice">
        <Shield size={18} />
        <p>
          <strong>Demo Hunt.</strong> Listings and messages stay in this browser tab. Photos never
          leave your device. Confirm before treating any contact as real.
        </p>
      </div>

      {statusMessage && (
        <p className="success-notice" role="status">
          {statusMessage}
        </p>
      )}

      {composing && (
        <form
          className="panel hunt-compose"
          onSubmit={listingForm.handleSubmit(publishListing)}
          noValidate
        >
          <div className="panel-heading">
            <div>
              <p className="eyebrow">New listing</p>
              <h2>Put your bike on the hunt</h2>
            </div>
            <button
              type="button"
              className="icon-button"
              aria-label="Close listing form"
              onClick={() => setComposing(false)}
            >
              <X size={19} />
            </button>
          </div>

          <label className="hunt-upload">
            <span>Bike photo</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void onPhotoChange(event.target.files)}
            />
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="Selected bike preview" />
            ) : (
              <div className="hunt-upload-empty">
                <Plus size={22} />
                <span>Drop a clear photo of the frame</span>
              </div>
            )}
            <input type="hidden" {...listingForm.register('imageDataUrl')} />
            {(photoError || listingForm.formState.errors.imageDataUrl) && (
              <span className="field-error" role="alert">
                {photoError || listingForm.formState.errors.imageDataUrl?.message}
              </span>
            )}
          </label>

          <div className="hunt-form-grid">
            <label>
              Title
              <input
                {...listingForm.register('title')}
                placeholder="Matte black city bike with basket"
              />
              {listingForm.formState.errors.title && (
                <span className="field-error" role="alert">
                  {listingForm.formState.errors.title.message}
                </span>
              )}
            </label>
            <label>
              Last seen area
              <input {...listingForm.register('lastSeenArea')} placeholder="Markt · Centrum" />
              {listingForm.formState.errors.lastSeenArea && (
                <span className="field-error" role="alert">
                  {listingForm.formState.errors.lastSeenArea.message}
                </span>
              )}
            </label>
          </div>

          <label>
            Description
            <textarea
              {...listingForm.register('description')}
              rows={4}
              placeholder="Colour, marks, lock, anything that helps a neighbour recognise it…"
            />
            {listingForm.formState.errors.description && (
              <span className="field-error" role="alert">
                {listingForm.formState.errors.description.message}
              </span>
            )}
          </label>

          <label>
            Contact email for finders
            <input
              {...listingForm.register('contactEmail')}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
            {listingForm.formState.errors.contactEmail && (
              <span className="field-error" role="alert">
                {listingForm.formState.errors.contactEmail.message}
              </span>
            )}
          </label>

          <div className="form-bottom">
            <span>Shared only after someone taps Found</span>
            <Button type="submit">
              Publish to Bike Hunt <ArrowUpRight size={16} />
            </Button>
          </div>
        </form>
      )}

      <div className="hunt-toolbar" id="hunt-gallery">
        <div className="tabs" aria-label="Filter hunt listings">
          {(
            [
              ['all', 'All bikes'],
              ['searching', 'Still out'],
              ['mine', 'My listings'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              className={filter === value ? 'selected' : ''}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="muted">{filtered.length} listings</span>
      </div>

      <div className="hunt-gallery">
        {filtered.map((listing) => {
          const pending = huntSightings.filter(
            (sighting) => sighting.listingId === listing.id && sighting.status === 'pending',
          ).length;
          const alreadyReported = huntSightings.some(
            (sighting) =>
              sighting.listingId === listing.id &&
              sighting.ownFinder &&
              sighting.status !== 'declined',
          );
          return (
            <article className="hunt-card" key={listing.id}>
              <button
                type="button"
                className="hunt-card-media"
                onClick={() => setActiveId(listing.id)}
                aria-label={`Open ${listing.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={listing.imageDataUrl} alt="" />
                <span className={`hunt-status hunt-status-${listing.status}`}>
                  {statusLabel(listing.status)}
                </span>
              </button>
              <div className="hunt-card-body">
                <div className="hunt-card-meta">
                  <span className="avatar">{listing.ownerInitials}</span>
                  <div>
                    <strong>{listing.ownerName}</strong>
                    <small>
                      <MapPin size={11} /> {listing.lastSeenArea} · {listing.dateLabel}
                    </small>
                  </div>
                </div>
                <h2>{listing.title}</h2>
                <p>{listing.description}</p>
                <div className="hunt-card-actions">
                  <Button variant="secondary" onClick={() => setActiveId(listing.id)}>
                    View details
                  </Button>
                  {!listing.own && listing.status !== 'recovered' && !alreadyReported && (
                    <Button onClick={() => openFound(listing)}>
                      <Sparkles size={15} /> I found this
                    </Button>
                  )}
                  {listing.own && pending > 0 && (
                    <Button onClick={() => setActiveId(listing.id)}>
                      <BadgeCheck size={15} /> Review {pending} sighting
                      {pending === 1 ? '' : 's'}
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="panel empty-state">No listings in this view yet. Start a hunt.</div>
      )}

      {active && (
        <div className="hunt-modal" role="dialog" aria-modal="true" aria-labelledby="hunt-detail-title">
          <button
            type="button"
            className="hunt-modal-backdrop"
            aria-label="Close details"
            onClick={() => {
              setActiveId(null);
              setFindingId(null);
            }}
          />
          <div className="hunt-modal-panel">
            <button
              type="button"
              className="icon-button hunt-modal-close"
              aria-label="Close"
              onClick={() => {
                setActiveId(null);
                setFindingId(null);
              }}
            >
              <X size={19} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hunt-modal-image" src={active.imageDataUrl} alt="" />
            <div className="hunt-modal-content">
              <p className="eyebrow">{statusLabel(active.status)}</p>
              <h2 id="hunt-detail-title">{active.title}</h2>
              <p className="hunt-modal-area">
                <MapPin size={14} /> {active.lastSeenArea} · listed {active.dateLabel}
              </p>
              <p>{active.description}</p>

              {findingId === active.id ? (
                <form
                  className="hunt-found-form"
                  onSubmit={sightingForm.handleSubmit(submitFound)}
                  noValidate
                >
                  <h3>
                    <MessageCircle size={16} /> Get in touch instantly
                  </h3>
                  <p>
                    We share your details with {active.ownerName} and reveal their contact to you
                    right away.
                  </p>
                  <input type="hidden" {...sightingForm.register('listingId')} />
                  <label>
                    Your name
                    <input {...sightingForm.register('finderName')} />
                    {sightingForm.formState.errors.finderName && (
                      <span className="field-error" role="alert">
                        {sightingForm.formState.errors.finderName.message}
                      </span>
                    )}
                  </label>
                  <label>
                    Your email or phone
                    <input
                      {...sightingForm.register('finderContact')}
                      placeholder="so the owner can reply"
                    />
                    {sightingForm.formState.errors.finderContact && (
                      <span className="field-error" role="alert">
                        {sightingForm.formState.errors.finderContact.message}
                      </span>
                    )}
                  </label>
                  <label>
                    Where did you see it?
                    <textarea {...sightingForm.register('message')} rows={3} />
                    {sightingForm.formState.errors.message && (
                      <span className="field-error" role="alert">
                        {sightingForm.formState.errors.message.message}
                      </span>
                    )}
                  </label>
                  <div className="form-bottom">
                    <button type="button" className="delete-post" onClick={() => setFindingId(null)}>
                      Cancel
                    </button>
                    <Button type="submit">
                      Share contact <ArrowUpRight size={16} />
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="hunt-modal-actions">
                  {!active.own &&
                    active.status !== 'recovered' &&
                    !huntSightings.some(
                      (sighting) =>
                        sighting.listingId === active.id &&
                        sighting.ownFinder &&
                        sighting.status !== 'declined',
                    ) && (
                      <Button onClick={() => openFound(active)}>
                        <Sparkles size={15} /> I found this bike
                      </Button>
                    )}
                </div>
              )}

              {active.own && (
                <div className="hunt-owner-inbox">
                  <h3>Sightings for your bike</h3>
                  {activeSightings.length === 0 && (
                    <p className="muted">No sightings yet. Keep the listing live.</p>
                  )}
                  {activeSightings.map((sighting) => (
                    <div className="hunt-sighting" key={sighting.id}>
                      <div className="hunt-card-meta">
                        <span className="avatar">{sighting.finderInitials}</span>
                        <div>
                          <strong>{sighting.finderName}</strong>
                          <small>
                            {sighting.dateLabel} · {sighting.status}
                          </small>
                        </div>
                      </div>
                      <p>{sighting.message}</p>
                      <p className="hunt-contact-line">
                        <MessageCircle size={13} /> {sighting.finderContact}
                      </p>
                      {sighting.status === 'pending' && (
                        <div className="hunt-card-actions">
                          <Button
                            onClick={() => {
                              confirmHuntSighting(sighting.id);
                              setConnection({ listing: active, sighting: { ...sighting, status: 'confirmed' } });
                              setStatusMessage(
                                `Confirmed. ${sighting.finderName} earns a leaderboard find.`,
                              );
                              setActiveId(null);
                            }}
                          >
                            <Check size={15} /> Confirm they found it
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              declineHuntSighting(sighting.id);
                              setStatusMessage('Sighting declined. Your hunt stays open.');
                            }}
                          >
                            Not my bike
                          </Button>
                        </div>
                      )}
                      {sighting.status === 'confirmed' && (
                        <p className="success-notice">Recovery confirmed. Finder credited.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {connection && (
        <div className="hunt-modal" role="dialog" aria-modal="true" aria-labelledby="hunt-connect-title">
          <button
            type="button"
            className="hunt-modal-backdrop"
            aria-label="Close connection"
            onClick={() => setConnection(null)}
          />
          <div className="hunt-modal-panel hunt-connect-panel">
            <button
              type="button"
              className="icon-button hunt-modal-close"
              aria-label="Close"
              onClick={() => setConnection(null)}
            >
              <X size={19} />
            </button>
            <p className="eyebrow">Private connection</p>
            <h2 id="hunt-connect-title">You’re in touch</h2>
            <p>
              Details are exchanged for <strong>{connection.listing.title}</strong>. Coordinate a
              safe public handoff — never share payment or home addresses in this demo.
            </p>
            <div className="hunt-connect-grid">
              <div>
                <span className="muted">Owner</span>
                <strong>{connection.listing.ownerName}</strong>
                <small>{connection.listing.contactEmail}</small>
              </div>
              <div>
                <span className="muted">Finder</span>
                <strong>{connection.sighting.finderName}</strong>
                <small>{connection.sighting.finderContact}</small>
              </div>
            </div>
            <Button onClick={() => setConnection(null)}>Continue hunting</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function HuntLeaderboard() {
  const { huntLeaderboard } = useDemo();

  return (
    <section className="hunt-board">
      <div className="page-heading">
        <div>
          <div className="eyebrow">CITY LEADERBOARD</div>
          <h1>Finders who bring bikes home</h1>
          <p>Confirmed recoveries only. Reputation earned by neighbours, not claims.</p>
        </div>
      </div>
      <ol className="hunt-board-list">
        {huntLeaderboard.map((entry, index) => (
          <li className={`hunt-board-row ${entry.own ? 'own' : ''}`} key={entry.id}>
            <span className="hunt-rank">#{index + 1}</span>
            <span className="avatar hunt-avatar">{entry.initials}</span>
            <div>
              <strong>{entry.name}</strong>
              <small>Confirmed recoveries in this demo session</small>
            </div>
            <div className="hunt-board-score">
              <Trophy size={16} />
              <span>{entry.finds}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
