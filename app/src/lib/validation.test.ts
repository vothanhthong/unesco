import { describe, expect, it } from "vitest";
import { pairSessionSchema, scamReportSchema, trainSessionCreateSchema } from "@/lib/validation";

describe("pairSessionSchema", () => {
  it("preserves optional TRAIN context when pairing a learner session", () => {
    const parsed = pairSessionSchema.parse({
      session_id: "1234",
      family_member_id: "123e4567-e89b-12d3-a456-426614174000",
      scenario_slug: "traffic-fine",
    });

    expect(parsed).toMatchObject({
      session_id: "1234",
      family_member_id: "123e4567-e89b-12d3-a456-426614174000",
      scenario_slug: "traffic-fine",
    });
  });

  it("allows a trainer to pair a learner code with a scenario only", () => {
    expect(pairSessionSchema.parse({ session_id: "1234", scenario_slug: "traffic-fine" })).toEqual({
      session_id: "1234",
      scenario_slug: "traffic-fine",
    });
  });
});

describe("scamReportSchema", () => {
  it("accepts a private report with consent and redaction confirmation", () => {
    const parsed = scamReportSchema.parse({
      source_type: "message",
      description: "A fake delivery message asked for an urgent payment.",
      locale: "vi-VN",
      context: "Received through a family chat.",
      privacy_consent: true,
      redaction_confirmed: true,
    });

    expect(parsed.source_type).toBe("message");
  });

  it("rejects reports that are too short or missing privacy confirmation", () => {
    const parsed = scamReportSchema.safeParse({
      source_type: "story",
      description: "Too short",
      privacy_consent: true,
      redaction_confirmed: false,
    });

    expect(parsed.success).toBe(false);
  });
});

describe("trainSessionCreateSchema", () => {
  it("allows starting a scenario without a family member", () => {
    expect(trainSessionCreateSchema.parse({ scenario_slug: "traffic-fine" })).toEqual({
      scenario_slug: "traffic-fine",
    });
  });
});
