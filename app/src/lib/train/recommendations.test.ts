import { describe, expect, it } from "vitest";
import { recommendScenarios } from "@/lib/train/recommendations";

describe("recommendScenarios", () => {
  it("prioritizes unpracticed categories and explains the recommendation", () => {
    const recommendations = recommendScenarios(
      [
        { slug: "traffic-fine", category: "message", title: "Phạt nguội" },
        { slug: "deepfake-police-call", category: "call", title: "Deepfake" },
      ],
      [
        { scenarioSlug: "traffic-fine", result: "passed", completedAt: "2026-08-01T00:00:00.000Z" },
      ],
      new Date("2026-08-15T00:00:00.000Z")
    );

    expect(recommendations[0]).toMatchObject({ slug: "deepfake-police-call" });
    expect(recommendations[0]?.reason).toContain("chưa luyện");
  });

  it("reintroduces failed scenarios after a successful practice cooldown", () => {
    const recommendations = recommendScenarios(
      [{ slug: "traffic-fine", category: "message", title: "Phạt nguội" }],
      [{ scenarioSlug: "traffic-fine", result: "failed", completedAt: "2026-08-01T00:00:00.000Z" }],
      new Date("2026-08-15T00:00:00.000Z")
    );

    expect(recommendations[0]).toMatchObject({ slug: "traffic-fine" });
    expect(recommendations[0]?.reason).toContain("chưa an toàn");
  });

  it("boosts scenarios relevant to the family member locale", () => {
    const recommendations = recommendScenarios(
      [
        { slug: "global-investment", category: "investment", title: "Global investment", locale: "en-US", verified: false },
        { slug: "local-bank", category: "message", title: "Local bank", locale: "vi-VN", verified: true },
      ],
      [],
      { locale: "vi-VN", now: new Date("2026-08-15T00:00:00.000Z") }
    );

    expect(recommendations[0]?.slug).toBe("local-bank");
    expect(recommendations[0]?.reason).toContain("ngôn ngữ");
  });
});
