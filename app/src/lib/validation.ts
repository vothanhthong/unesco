import { z } from "zod";

export const sessionIdSchema = z.string().regex(/^\d{4}$/, "session_id must be four digits");

export const pairSessionSchema = z.object({
  session_id: sessionIdSchema,
  family_member_id: z.string().uuid().optional(),
  scenario_slug: z.string().trim().min(1).max(100).optional(),
}).refine(
  (value) => !value.family_member_id || Boolean(value.scenario_slug),
  "A family member requires a scenario_slug"
);

export const reportResultSchema = z.object({
  session_id: sessionIdSchema,
  result: z.enum(["passed", "failed"]),
});

export const closeSessionSchema = z.object({
  session_id: sessionIdSchema,
});

export const scamPayloadSchema = z.object({
  type: z.string().trim().min(1).max(40),
  sender: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(5_000),
});

export const scamTriggerSchema = scamPayloadSchema.extend({
  session_id: sessionIdSchema,
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z
    .object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    })
    .optional(),
}).passthrough();

export const subscribeSchema = z.object({
  session_id: sessionIdSchema,
  subscription: pushSubscriptionSchema,
});

export const familyMemberCreateSchema = z.object({
  display_name: z.string().trim().min(2).max(80),
  relationship: z.string().trim().max(40).optional(),
  locale: z.string().trim().min(2).max(20).default("vi-VN"),
  notes: z.string().trim().max(500).optional(),
});

export const familyMemberUpdateSchema = familyMemberCreateSchema.partial().extend({
  relationship: z.string().trim().max(40).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

export const familyMemberIdSchema = z.string().uuid();

export const trainSessionCreateSchema = z.object({
  family_member_id: familyMemberIdSchema.optional(),
  scenario_slug: z.string().trim().min(1).max(100),
});

export const communityLessonCreateSchema = z.object({
  cluster_id: z.string().uuid(),
  locale: z.enum(["vi", "en"]).default("vi"),
});

export const scamReportSourceTypes = ["message", "email", "screenshot", "audio", "story"] as const;

export const scamReportSchema = z.object({
  source_type: z.enum(scamReportSourceTypes),
  description: z.string().trim().min(20).max(5_000),
  locale: z.string().trim().min(2).max(20).default("vi-VN"),
  context: z.string().trim().max(2_000).optional(),
  privacy_consent: z.literal(true),
  redaction_confirmed: z.literal(true),
});

export type ScamPayloadInput = z.infer<typeof scamPayloadSchema>;
