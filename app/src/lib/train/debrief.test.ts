import { describe, expect, it } from "vitest";
import { buildDebrief } from "@/lib/train/debrief";

describe("buildDebrief", () => {
  it("names pressure tactics and gives a failed-practice discussion prompt", () => {
    const debrief = buildDebrief(
      {
        category: "message",
        title: "Phạt nguội",
        sender: "CẢNH SÁT GIAO THÔNG",
        content: "Truy cập phatnguoivn.com.vn trong 24 giờ để nộp phạt.",
        linkHint: "phatnguoivn.com.vn",
      },
      "failed"
    );

    expect(debrief.warningSigns).toEqual(expect.arrayContaining([
      "Tạo cảm giác gấp để bạn không kịp kiểm tra",
      "Đưa đường link hoặc tên miền cần xác minh riêng",
    ]));
    expect(debrief.discussionPrompt).toContain("lần sau");
  });

  it("reinforces the safe action after a passed practice", () => {
    const debrief = buildDebrief(
      {
        category: "call",
        title: "Cuộc gọi giả danh",
        sender: "Người gọi lạ",
        content: "Chuyển tiền ngay để tránh bị bắt.",
        linkHint: null,
      },
      "passed"
    );

    expect(debrief.discussionPrompt).toContain("đã làm đúng");
  });
});
