import { describe, expect, it } from "vitest";
import { localizeScenario } from "@/lib/scenarios";

describe("localizeScenario", () => {
  it("localizes a saved community lesson from its persisted English fields", () => {
    const scenario = localizeScenario({
      slug: "community-family-transfer",
      title: "Giả danh người thân để mượn tiền",
      sender: "BÁO CÁO CỘNG ĐỒNG",
      content: "Kẻ gian yêu cầu chuyển tiền gấp.",
      community_cluster_id: "cluster-1",
      title_en: "Family impersonation and urgent transfers",
      content_en: "Scammers impersonate relatives and pressure an immediate transfer.",
    }, "en");

    expect(scenario).toMatchObject({
      title: "Family impersonation and urgent transfers",
      sender: "COMMUNITY REPORT",
      content: "Scammers impersonate relatives and pressure an immediate transfer.",
    });
  });

  it("keeps the original community lesson content in Vietnamese", () => {
    const scenario = {
      slug: "community-family-transfer",
      title: "Giả danh người thân để mượn tiền",
      sender: "BÁO CÁO CỘNG ĐỒNG",
      content: "Kẻ gian yêu cầu chuyển tiền gấp.",
      community_cluster_id: "cluster-1",
      title_en: "Family impersonation and urgent transfers",
      content_en: "Scammers impersonate relatives and pressure an immediate transfer.",
    };

    expect(localizeScenario(scenario, "vi")).toEqual(scenario);
  });
});
