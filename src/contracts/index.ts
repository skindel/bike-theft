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
}
export const postSchema = z.object({
  title: requiredText('Title', 100),
  body: requiredText('Message', 1200),
  kind: z.enum(['post', 'meetup']),
});
export type PostInput = z.infer<typeof postSchema>;
export interface CommunityPost extends PostInput {
  id: string;
  author: string;
  initials: string;
  date: string;
  own?: boolean;
}

export type HuntStatus = 'searching' | 'claimed' | 'recovered';
export type SightingStatus = 'pending' | 'confirmed' | 'declined';

export const huntListingSchema = z.object({
  title: requiredText('Title', 100),
  description: requiredText('Description', 1200),
  lastSeenArea: requiredText('Last seen area', 120),
  contactEmail: z
    .string()
    .trim()
    .min(1, 'Contact email is required')
    .email('Enter a valid email')
    .max(160),
  imageDataUrl: z
    .string()
    .trim()
    .min(1, 'A bike photo is required')
    .refine(
      (value) => value.startsWith('data:image/') || value.startsWith('/hunt/'),
      'Upload a JPG, PNG, or WebP photo',
    )
    .refine(
      (value) => value.startsWith('/hunt/') || value.length <= 1_800_000,
      'Keep the photo under about 1.2 MB',
    ),
});
export type HuntListingInput = z.infer<typeof huntListingSchema>;

export interface HuntListing extends HuntListingInput {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerInitials: string;
  status: HuntStatus;
  createdAt: string;
  dateLabel: string;
  own?: boolean;
}

export const huntSightingSchema = z.object({
  listingId: z.string().min(1),
  finderName: requiredText('Your name', 80),
  finderContact: requiredText('Your contact', 160),
  message: requiredText('Where you found it', 800),
});
export type HuntSightingInput = z.infer<typeof huntSightingSchema>;

export interface HuntSighting {
  id: string;
  listingId: string;
  finderId: string;
  finderName: string;
  finderInitials: string;
  finderContact: string;
  message: string;
  status: SightingStatus;
  createdAt: string;
  dateLabel: string;
  ownFinder?: boolean;
}

export interface HuntLeaderEntry {
  id: string;
  name: string;
  initials: string;
  finds: number;
  own?: boolean;
}
