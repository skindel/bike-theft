'use client';
import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowUpRight,
  Plus,
  CalendarDays,
  MessageSquare,
  Megaphone,
  Trash2,
  X,
  Bike,
  Heart,
} from 'lucide-react';
import { postSchema, type PostInput, type PostKind, type PostPhoto } from '@/contracts';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { checkPhoto, readPhoto } from './photo';
const tabLabels = {
  all: 'All posts',
  post: 'Local tips',
  meetup: 'Meetups',
  stolen: 'Stolen bikes',
} as const;
const tagLabels: Record<PostKind, string> = {
  post: 'Local tip',
  meetup: 'Meetup',
  stolen: 'Stolen bike',
};
const tagIcons: Record<PostKind, typeof MessageSquare> = {
  post: MessageSquare,
  meetup: CalendarDays,
  stolen: Megaphone,
};
// Date-only values from the form carry no time zone, so format them in UTC to
// keep the server and browser renders identical.
function formatDay(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
export function CommunityFeed() {
  const { posts, addPost, deletePost } = useStore();
  const [tab, setTab] = useState<keyof typeof tabLabels>('all');
  const [composing, setComposing] = useState(false);
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState<PostPhoto | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  // Mirrored so the conditional fields re-render without subscribing to
  // react-hook-form's watch(), which opts the component out of compilation.
  const [kind, setKind] = useState<PostKind>('post');
  // Remounting the file input is how we clear the browser's own selection.
  const [photoFieldKey, setPhotoFieldKey] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: { kind: 'post', title: '', body: '', area: '', lastSeenOn: '' },
  });
  const filtered = posts.filter((post) => tab === 'all' || post.kind === tab);
  function clearPhoto() {
    setPhoto(null);
    setPhotoError(null);
    setPhotoFieldKey((key) => key + 1);
  }
  async function pickPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const problem = checkPhoto(file);
    if (problem) {
      setPhoto(null);
      setPhotoError(problem);
      event.target.value = '';
      return;
    }
    try {
      setPhoto({ src: await readPhoto(file), alt: 'Photo of the missing bike' });
      setPhotoError(null);
    } catch {
      setPhoto(null);
      setPhotoError('We could not read that photo. Try a different file.');
    }
  }
  function submit(input: PostInput) {
    addPost(input, input.kind === 'stolen' ? (photo ?? undefined) : undefined);
    reset();
    setKind('post');
    clearPhoto();
    setComposing(false);
    setTab('all');
    setMessage(
      input.kind === 'stolen'
        ? 'Your alert is in the community feed. Filing with the police is a separate step.'
        : 'Your post is in the community feed.',
    );
  }
  return (
    <>
      <section className="page-heading">
        <div>
          <h1>Better on two wheels. Together.</h1>
          <p>Swap local knowledge, find your next ride, and look out for each other.</p>
        </div>
        <Button onClick={() => setComposing(true)}>
          <Plus size={17} /> Create a post
        </Button>
      </section>
      <section className="community-banner">
        <div>
          <span className="eyebrow">YOUR LOCAL CYCLING CIRCLE</span>
          <h2>
            Different bikes.
            <br />
            Same love for our city.
          </h2>
          <p>
            A space for the everyday commute, the long way home,
            <br />
            and everything in between.
          </p>
          <div className="avatar-stack">
            <span>LV</span>
            <span>SD</span>
            <span>NK</span>
            <small>Riders looking out for each other</small>
          </div>
        </div>
        <div className="community-art" aria-hidden="true">
          <div className="art-ring" />
          <Bike size={150} strokeWidth={1} />
          <span className="art-heart">
            <Heart size={25} />
          </span>
          <span className="art-star">✳</span>
        </div>
      </section>
      {message && (
        <p className="success-notice" role="status">
          {message}
        </p>
      )}
      <section>
        <div className="feed-toolbar">
          <div className="tabs" aria-label="Filter posts">
            {(['all', 'post', 'meetup', 'stolen'] as const).map((value) => (
              <button
                key={value}
                aria-pressed={tab === value}
                className={tab === value ? 'selected' : ''}
                onClick={() => setTab(value)}
              >
                {tabLabels[value]}
              </button>
            ))}
          </div>
          <span className="muted">{filtered.length} posts</span>
        </div>
        {composing && (
          <form className="panel compose-panel" onSubmit={handleSubmit(submit)} noValidate>
            <div className="panel-heading">
              <h2>
                {kind === 'stolen' ? 'Ask your neighbours to look out' : 'Share something good'}
              </h2>
              <button
                type="button"
                className="icon-button"
                aria-label="Close post form"
                onClick={() => setComposing(false)}
              >
                <X size={19} />
              </button>
            </div>
            <label>
              Post type
              <select
                {...register('kind', {
                  onChange: (event) => setKind(event.target.value as PostKind),
                })}
              >
                <option value="post">Local tip / discussion</option>
                <option value="meetup">Bike meetup</option>
                <option value="stolen">Stolen bike alert</option>
              </select>
            </label>
            <label>
              Title
              <input
                {...register('title')}
                placeholder={
                  kind === 'stolen'
                    ? 'e.g. Dark green Gazelle taken near Wyck'
                    : 'What’s on your mind?'
                }
              />
              {errors.title && (
                <span className="field-error" role="alert">
                  {errors.title.message}
                </span>
              )}
            </label>
            {kind === 'stolen' && (
              <>
                <label>
                  Area to watch
                  <input {...register('area')} placeholder="e.g. Wyck, near the station" />
                  {errors.area && (
                    <span className="field-error" role="alert">
                      {errors.area.message}
                    </span>
                  )}
                </label>
                <label>
                  Last seen on
                  <input type="date" {...register('lastSeenOn')} />
                  {errors.lastSeenOn && (
                    <span className="field-error" role="alert">
                      {errors.lastSeenOn.message}
                    </span>
                  )}
                </label>
                <div className="photo-field">
                  <label htmlFor="stolen-photo">
                    Photo of the bike <span className="optional">optional</span>
                  </label>
                  <input
                    key={photoFieldKey}
                    id="stolen-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={pickPhoto}
                  />
                  {photoError && (
                    <span className="field-error" role="alert">
                      {photoError}
                    </span>
                  )}
                  {photo && (
                    <div className="photo-preview">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.src} alt={photo.alt} />
                      <button type="button" onClick={clearPhoto}>
                        <Trash2 size={14} /> Remove photo
                      </button>
                    </div>
                  )}
                  <p className="form-hint">
                    JPEG, PNG or WebP up to 4 MB. Your photo stays on your device.
                  </p>
                </div>
              </>
            )}
            <label>
              Message
              <textarea
                {...register('body')}
                rows={4}
                placeholder={
                  kind === 'stolen'
                    ? 'Describe the bike: colour, frame, stickers, basket, anything recognisable…'
                    : 'Share a tip, or include the date and meeting place for your ride…'
                }
              />
              {errors.body && (
                <span className="field-error" role="alert">
                  {errors.body.message}
                </span>
              )}
            </label>
            {kind === 'stolen' && (
              <div className="notice compose-note">
                <Megaphone size={18} />
                <p>
                  This is a public lookout post. Leave out frame numbers, home addresses and any
                  accusation about a person. For a private record use{' '}
                  <strong>Report a theft</strong>, and file with the police — that’s what opens a
                  case.
                </p>
              </div>
            )}
            <div className="form-bottom">
              <span>Keep personal details private</span>
              <Button type="submit">
                {kind === 'stolen' ? 'Publish alert' : 'Publish post'} <ArrowUpRight size={16} />
              </Button>
            </div>
          </form>
        )}
        <div className="feed">
          {filtered.map((post) => {
            const TagIcon = tagIcons[post.kind];
            return (
              <article className="panel post-card" key={post.id}>
                <div className="post-meta">
                  <span
                    className={`avatar ${post.kind === 'meetup' ? 'avatar-peach' : ''}${
                      post.kind === 'stolen' ? 'avatar-alert' : ''
                    }`}
                  >
                    {post.initials}
                  </span>
                  <div>
                    <strong>{post.author}</strong>
                    <small>{post.date}</small>
                  </div>
                  <span className={`post-tag ${post.kind}`}>
                    <TagIcon size={13} />
                    {tagLabels[post.kind]}
                  </span>
                </div>
                <h2>{post.title}</h2>
                {post.kind === 'stolen' && (
                  <p className="post-facts">
                    {post.area ? <span>Watch around {post.area}</span> : null}
                    {post.lastSeenOn ? <span>Last seen {formatDay(post.lastSeenOn)}</span> : null}
                  </p>
                )}
                <p>{post.body}</p>
                {post.photo && (
                  <figure className="post-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.photo.src} alt={post.photo.alt} />
                  </figure>
                )}
                <div className="post-bottom">
                  <span>{post.own ? 'Your session-only post' : 'Fictional community example'}</span>
                  {post.own && (
                    <button
                      className="delete-post"
                      onClick={() => {
                        deletePost(post.id);
                        setMessage('Post deleted.');
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="panel empty-state">
            {tab === 'stolen'
              ? 'No stolen bike alerts right now. That is good news.'
              : 'No posts here yet. Start the conversation.'}
          </div>
        )}
      </section>
    </>
  );
}
