'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowUpRight,
  Plus,
  Users,
  CalendarDays,
  MessageSquare,
  Trash2,
  X,
  Bike,
  Heart,
} from 'lucide-react';
import { postSchema, type PostInput } from '@/contracts';
import { useDemo } from '@/lib/demo-provider';
import { Button } from '@/components/ui/button';
export function CommunityFeed() {
  const { posts, addPost, deletePost } = useDemo();
  const [tab, setTab] = useState<'all' | 'post' | 'meetup'>('all');
  const [composing, setComposing] = useState(false);
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: { kind: 'post', title: '', body: '' },
  });
  const filtered = posts.filter((post) => tab === 'all' || post.kind === tab);
  function submit(input: PostInput) {
    addPost(input);
    reset();
    setComposing(false);
    setTab('all');
    setMessage('Your demo post is now in this tab’s feed. It is not published online.');
  }
  return (
    <>
      <section className="page-heading">
        <div>
          <div className="eyebrow">THE PEOPLE BEHIND THE PEDALS</div>
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
            <small>A sample of your future community</small>
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
      <div className="notice">
        <Users size={18} />
        <p>
          <strong>A little demo neighbourhood.</strong> People and posts below are fictional. New
          posts stay in this tab and disappear on refresh.
        </p>
      </div>
      {message && (
        <p className="success-notice" role="status">
          {message}
        </p>
      )}
      <div className="content-columns">
        <section>
          <div className="feed-toolbar">
            <div className="tabs" aria-label="Filter posts">
              {(['all', 'post', 'meetup'] as const).map((value) => (
                <button
                  key={value}
                  aria-pressed={tab === value}
                  className={tab === value ? 'selected' : ''}
                  onClick={() => setTab(value)}
                >
                  {value === 'all' ? 'All posts' : value === 'post' ? 'Local tips' : 'Meetups'}
                </button>
              ))}
            </div>
            <span className="muted">{filtered.length} posts</span>
          </div>
          {composing && (
            <form className="panel compose-panel" onSubmit={handleSubmit(submit)} noValidate>
              <div className="panel-heading">
                <h2>Share something good</h2>
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
                <select {...register('kind')}>
                  <option value="post">Local tip / discussion</option>
                  <option value="meetup">Bike meetup</option>
                </select>
              </label>
              <label>
                Title
                <input {...register('title')} placeholder="What’s on your mind?" />
                {errors.title && (
                  <span className="field-error" role="alert">
                    {errors.title.message}
                  </span>
                )}
              </label>
              <label>
                Message
                <textarea
                  {...register('body')}
                  rows={4}
                  placeholder="Share a tip, or include the date and meeting place for your ride…"
                />
                {errors.body && (
                  <span className="field-error" role="alert">
                    {errors.body.message}
                  </span>
                )}
              </label>
              <div className="form-bottom">
                <span>Visible only in your demo session</span>
                <Button type="submit">
                  Add demo post <ArrowUpRight size={16} />
                </Button>
              </div>
            </form>
          )}
          <div className="feed">
            {filtered.map((post) => (
              <article className="panel post-card" key={post.id}>
                <div className="post-meta">
                  <span className={`avatar ${post.kind === 'meetup' ? 'avatar-peach' : ''}`}>
                    {post.initials}
                  </span>
                  <div>
                    <strong>{post.author}</strong>
                    <small>{post.date}</small>
                  </div>
                  <span className={`post-tag ${post.kind === 'meetup' ? 'meetup' : ''}`}>
                    {post.kind === 'meetup' ? (
                      <CalendarDays size={13} />
                    ) : (
                      <MessageSquare size={13} />
                    )}
                    {post.kind === 'meetup' ? 'Meetup' : 'Local tip'}
                  </span>
                </div>
                <h2>{post.title}</h2>
                <p>{post.body}</p>
                <div className="post-bottom">
                  <span>{post.own ? 'Your session-only post' : 'Fictional community example'}</span>
                  {post.own && (
                    <button
                      className="delete-post"
                      onClick={() => {
                        deletePost(post.id);
                        setMessage('Demo post deleted.');
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="panel empty-state">No posts here yet. Start the conversation.</div>
          )}
        </section>
        <aside className="help-column">
          <section className="help-card">
            <span className="overview-icon mint">
              <Heart size={21} />
            </span>
            <h2>
              A good neighbour
              <br />
              on two wheels.
            </h2>
            <p>Keep it kind, keep it local, and make space for everyone.</p>
            <ul className="community-rules">
              <li>Share helpful, practical tips.</li>
              <li>Welcome riders of every pace.</li>
              <li>Keep personal information private.</li>
              <li>Report theft through the report page, not public accusations.</li>
            </ul>
          </section>
          <div className="small-note">
            <Bike size={24} />
            <p>
              Have an idea for a ride? Create a meetup post with a time and public meeting place.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
