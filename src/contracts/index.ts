import { z } from 'zod';
export type ActivityBand = 'low' | 'medium' | 'high' | 'unknown';
export interface ParkingLocation {
  id: string;
  name: string;
  area: string;
  coordinates: [number, number];
  covered: boolean;
  guarded: boolean;
  note: string;
}
export interface DemoZone {
  id: string;
  name: string;
  count: number | null;
  coordinates: [number, number][];
}
const requiredText = (label: string, max = 120) =>
  z.string().trim().min(1, `${label} is required`).max(max);
export const reportSchema = z
  .object({
    brand: requiredText('Bike brand'),
    color: requiredText('Color'),
    type: z.enum(['City bike', 'E-bike', 'Road bike', 'Cargo bike', 'Other']),
    serial: z.string().trim().max(120),
    location: requiredText('Location', 200),
    lastSeen: requiredText('Last seen'),
    discovered: requiredText('Discovered missing'),
    details: z.string().trim().max(2000),
    shareAggregate: z.boolean(),
  })
  .superRefine((value, ctx) => {
    const start = Date.parse(value.lastSeen);
    const end = Date.parse(value.discovered);
    if (!Number.isFinite(start))
      ctx.addIssue({ code: 'custom', path: ['lastSeen'], message: 'Enter a valid date and time' });
    if (!Number.isFinite(end))
      ctx.addIssue({
        code: 'custom',
        path: ['discovered'],
        message: 'Enter a valid date and time',
      });
    if (end < start)
      ctx.addIssue({
        code: 'custom',
        path: ['discovered'],
        message: 'Must be after the bike was last seen',
      });
    if (start > Date.now())
      ctx.addIssue({ code: 'custom', path: ['lastSeen'], message: 'Cannot be in the future' });
    if (end > Date.now())
      ctx.addIssue({ code: 'custom', path: ['discovered'], message: 'Cannot be in the future' });
  });
export type TheftReport = z.infer<typeof reportSchema>;
export interface SavedReport extends TheftReport {
  id: string;
  createdAt: string;
  neighbourhood?: string;
}
export const postKinds = ['post', 'meetup', 'stolen'] as const;
export type PostKind = (typeof postKinds)[number];
export const postSchema = z
  .object({
    title: requiredText('Title', 100),
    body: requiredText('Message', 1200),
    kind: z.enum(postKinds),
    // Area and date describe a public lookout request, not the precise theft
    // location held in a private report.
    area: z.string().trim().max(120).optional(),
    lastSeenOn: z.string().trim().max(40).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.kind !== 'stolen') return;
    if (!value.area)
      ctx.addIssue({ code: 'custom', path: ['area'], message: 'Name an area people can watch' });
    if (!value.lastSeenOn) {
      ctx.addIssue({
        code: 'custom',
        path: ['lastSeenOn'],
        message: 'Enter the date it went missing',
      });
      return;
    }
    const lastSeen = Date.parse(value.lastSeenOn);
    if (!Number.isFinite(lastSeen))
      ctx.addIssue({ code: 'custom', path: ['lastSeenOn'], message: 'Enter a valid date' });
    else if (lastSeen > Date.now())
      ctx.addIssue({ code: 'custom', path: ['lastSeenOn'], message: 'Cannot be in the future' });
  });
export type PostInput = z.infer<typeof postSchema>;
export interface PostPhoto {
  src: string;
  alt: string;
}
export interface CommunityPost extends PostInput {
  id: string;
  author: string;
  initials: string;
  date: string;
  own?: boolean;
  photo?: PostPhoto;
}
