export interface DebriefScenario {
  category: string;
  title: string;
  sender: string;
  content: string;
  linkHint?: string | null;
}

export interface DebriefGuidance {
  warningSigns: string[];
  discussionPrompt: string;
}

export function buildDebrief(
  scenario: DebriefScenario,
  result: "passed" | "failed",
  locale: "vi" | "en" = "vi"
): DebriefGuidance {
  const content = `${scenario.sender} ${scenario.content}`.toLocaleLowerCase("vi");
  const warningSigns: string[] = [];

  if (/gấp|khẩn|24 giờ|12 giờ|2 giờ|hôm nay|trước 17h/.test(content)) {
    warningSigns.push(locale === "en" ? "Creates urgency so you do not stop to verify" : "Tạo cảm giác gấp để bạn không kịp kiểm tra");
  }
  if (scenario.linkHint || /https?:\/\/|[a-z0-9-]+\.(com|vn|net)/i.test(scenario.content)) {
    warningSigns.push(locale === "en" ? "Includes a link or domain that needs independent verification" : "Đưa đường link hoặc tên miền cần xác minh riêng");
  }
  if (/chuyển|triệu|tiền|tài khoản|viện phí|đầu tư/.test(content)) {
    warningSigns.push(locale === "en" ? "Requests money or financial information before verification" : "Yêu cầu tiền hoặc thông tin tài chính trước khi xác minh");
  }
  if (scenario.category === "call" || /công an|bệnh viện|cơ quan/.test(content)) {
    warningSigns.push(locale === "en" ? "Impersonates an authority or trusted person to create pressure" : "Mượn danh cơ quan hoặc người quen để tạo áp lực");
  }
  if (warningSigns.length === 0) {
    warningSigns.push(locale === "en" ? "Unexpected information should be checked through an independent channel" : "Thông tin bất ngờ cần được kiểm tra bằng một kênh độc lập");
  }

  return {
    warningSigns,
    discussionPrompt: locale === "en"
      ? (result === "passed"
        ? `Name what you did well in “${scenario.title}” so you can repeat it next time.`
        : `Identify the first warning sign in “${scenario.title}”, then agree on one thing to do differently next time.`)
      : (result === "passed"
        ? `Hãy nói lại điều bạn đã làm đúng trong “${scenario.title}” để giữ phản xạ đó cho lần sau.`
        : `Cùng chỉ ra dấu hiệu đầu tiên khiến bạn phân vân trong “${scenario.title}”, rồi thống nhất một việc sẽ làm khác đi lần sau.`),
  };
}
