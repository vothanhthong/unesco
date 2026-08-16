export type ScenarioGroup = "message" | "call" | "investment";

export interface ScenarioDefinition {
  id: number;
  slug: string;
  group: ScenarioGroup;
  groupLabel: string;
  title: string;
  sender: string;
  content: string;
  linkHint?: string;
  community_cluster_id?: string | null;
  title_en?: string | null;
  content_en?: string | null;
}

export const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    id: 1,
    slug: "traffic-fine",
    group: "message",
    groupLabel: "Tin nhắn Zalo & SMS",
    title: "Phạt Nguội Giao Thông",
    sender: "CẢNH SÁT GIAO THÔNG",
    content: "CẢNH BÁO: Phương tiện mang biển số của bạn đã vi phạm giao thông. Truy cập phatnguoivn.com.vn để nộp phạt trong 24 giờ hoặc bị khóa giấy phép lái xe.",
    linkHint: "phatnguoivn.com.vn",
  },
  {
    id: 2,
    slug: "bank-account-lock",
    group: "message",
    groupLabel: "Tin nhắn Zalo & SMS",
    title: "Khóa Tài Khoản Ngân Hàng",
    sender: "VIETCOMBANK THÔNG BÁO",
    content: "Tài khoản của quý khách vừa bị đăng nhập bất thường từ thiết bị lạ. Xác minh ngay tại vietcombank-security.com để tránh bị khóa tài khoản vĩnh viễn.",
    linkHint: "vietcombank-security.com",
  },
  {
    id: 3,
    slug: "zalo-prize",
    group: "message",
    groupLabel: "Tin nhắn Zalo & SMS",
    title: "Trúng Thưởng Zalo / Tri Ân",
    sender: "ZALO OFFICIAL",
    content: "Chúc mừng! Tài khoản Zalo của bạn đã trúng thưởng iPhone 15 Pro và tiền mặt 50 triệu đồng từ chương trình Tri ân 10 năm. Nhận thưởng tại: zalo-trung-thuong.net",
    linkHint: "zalo-trung-thuong.net",
  },
  {
    id: 4,
    slug: "held-parcel",
    group: "message",
    groupLabel: "Tin nhắn Zalo & SMS",
    title: "Bưu Kiện Hỏa Tốc Bị Giữ",
    sender: "VIETTEL POST",
    content: "Bưu kiện mã VTP-2806-XXXX của quý khách bị giữ tại hải quan do nghi chứa vật phẩm vi phạm. Vui lòng xác minh tại viettelpost-xacminh.com trong 12 giờ.",
    linkHint: "viettelpost-xacminh.com",
  },
  {
    id: 5,
    slug: "impersonated-child",
    group: "message",
    groupLabel: "Tin nhắn Zalo & SMS",
    title: "Mượn Tiền Giả Danh Con Cháu",
    sender: "Nguyễn Minh Khoa (Con)",
    content: "Mẹ ơi, con đang cần gấp 8 triệu để đóng học phí hôm nay không thì bị đuổi học. Mẹ chuyển vào số tài khoản 1234-5678-9012 ngân hàng Techcombank giúp con với ạ. Con xin lỗi mẹ vì làm phiền.",
  },
  {
    id: 6,
    slug: "deepfake-police-call",
    group: "call",
    groupLabel: "Cuộc gọi & Deepfake",
    title: "Deepfake Video Call Công An",
    sender: "CÔNG AN THÀNH PHỐ",
    content: "Đây là Thiếu tá Nguyễn Văn Hùng - Công an TP.HCM. Tên của bà có liên quan đến đường dây rửa tiền quốc tế. Để tránh bị bắt giữ, bà cần chuyển 30 triệu đồng vào tài khoản tạm giữ trong 2 giờ.",
  },
  {
    id: 7,
    slug: "emergency-hospital-call",
    group: "call",
    groupLabel: "Cuộc gọi & Deepfake",
    title: "Cuộc Gọi Cấp Cứu Khẩn Cấp",
    sender: "BỆNH VIỆN BẠCH MAI",
    content: "Tôi là bác sĩ trực cấp cứu Bệnh viện Bạch Mai. Con trai bà vừa nhập viện do tai nạn giao thông nghiêm trọng. Chúng tôi cần bà chuyển gấp 15 triệu đồng viện phí trước khi phẫu thuật.",
  },
  {
    id: 8,
    slug: "fake-order-job",
    group: "investment",
    groupLabel: "Đầu tư & Việc làm Online",
    title: "Tuyển Cộng Tác Viên Chốt Đơn",
    sender: "Tuyển Dụng Shopee VN",
    content: "Chào chị! Em cần tìm cộng tác viên chốt đơn hàng Shopee tại nhà, làm 2-3 tiếng/ngày, lương 500k-2 triệu/ngày. Không cần kinh nghiệm, không cần đặt cọc. Chị có muốn tham gia không ạ? Đăng ký ngay tại: ctv-shopee-vn.com",
    linkHint: "ctv-shopee-vn.com",
  },
  {
    id: 9,
    slug: "high-return-investment",
    group: "investment",
    groupLabel: "Đầu tư & Việc làm Online",
    title: "Đầu Tư Tài Chính Lợi Nhuận Cao",
    sender: "Hội Đầu Tư Chứng Khoán VN",
    content: "Chào bác! Hội đầu tư chứng khoán của chúng tôi đang có chương trình đặc biệt: lãi suất 10-15%/ngày, an toàn tuyệt đối. Bác chỉ cần đầu tư 5 triệu, sau 7 ngày nhận về 8-10 triệu. Tham gia tại: dautuvn-pro.com",
    linkHint: "dautuvn-pro.com",
  },
  {
    id: 10,
    slug: "social-benefit-scam",
    group: "investment",
    groupLabel: "Đầu tư & Việc làm Online",
    title: "Trợ Cấp Xã Hội / Quỹ Từ Thiện",
    sender: "HỘI CHỮ THẬP ĐỎ VN",
    content: "Kính gửi công dân! Theo danh sách hộ gia đình khó khăn, gia đình bạn được hỗ trợ 2.000.000 đồng từ Quỹ An sinh Xã hội 2026. Vui lòng xác nhận nhận tiền tại: hotrocovid-vn.com trước 17h hôm nay.",
    linkHint: "hotrocovid-vn.com",
  },
];

const ENGLISH_SCENARIOS: Record<string, Pick<ScenarioDefinition, "title" | "sender" | "content">> = {
  "traffic-fine": {
    title: "Traffic Fine Alert",
    sender: "TRAFFIC POLICE",
    content: "ALERT: Your vehicle has a traffic violation. Visit phatnguoivn.com.vn to pay within 24 hours or your driving licence will be suspended.",
  },
  "bank-account-lock": {
    title: "Bank Account Lock",
    sender: "VIETCOMBANK NOTICE",
    content: "Your account was accessed from an unfamiliar device. Verify now at vietcombank-security.com to avoid permanent account suspension.",
  },
  "zalo-prize": {
    title: "Zalo Prize Message",
    sender: "ZALO OFFICIAL",
    content: "Congratulations. Your Zalo account won an iPhone 15 Pro and VND 50 million. Claim it at zalo-trung-thuong.net.",
  },
  "held-parcel": {
    title: "Urgent Parcel Held",
    sender: "VIETTEL POST",
    content: "Parcel VTP-2806-XXXX is being held by customs. Verify at viettelpost-xacminh.com within 12 hours.",
  },
  "impersonated-child": {
    title: "Impersonated Family Member",
    sender: "Minh Khoa (Son)",
    content: "Mum, I urgently need VND 8 million for tuition today. Please transfer it to account 1234-5678-9012 at Techcombank.",
  },
  "deepfake-police-call": {
    title: "Deepfake Police Call",
    sender: "CITY POLICE",
    content: "I am Major Nguyen Van Hung. Your name is linked to a money-laundering case. Transfer VND 30 million to a holding account within two hours to avoid arrest.",
  },
  "emergency-hospital-call": {
    title: "Emergency Hospital Call",
    sender: "BACH MAI HOSPITAL",
    content: "Your son was admitted after a serious accident. Transfer VND 15 million immediately before surgery.",
  },
  "fake-order-job": {
    title: "Fake Online Order Job",
    sender: "SHOPEE VN RECRUITMENT",
    content: "Work from home two to three hours a day and earn up to VND 2 million. Register now at ctv-shopee-vn.com.",
  },
  "high-return-investment": {
    title: "High-Return Investment",
    sender: "VIETNAM INVESTMENT GROUP",
    content: "Earn 10 to 15 percent per day with guaranteed safety. Invest VND 5 million at dautuvn-pro.com and receive up to VND 10 million in seven days.",
  },
  "social-benefit-scam": {
    title: "Social Benefit Scam",
    sender: "VIETNAM RED CROSS",
    content: "Your family qualifies for VND 2 million in social support. Confirm before 5 PM today at hotrocovid-vn.com.",
  },
};

type LocalizableScenario = Pick<ScenarioDefinition, "slug" | "title" | "sender" | "content">
  & Partial<Pick<ScenarioDefinition, "community_cluster_id" | "title_en" | "content_en">>;

export function localizeScenario<T extends LocalizableScenario>(scenario: T, locale: "vi" | "en"): T {
  if (locale === "vi") return scenario;
  if (scenario.community_cluster_id && scenario.title_en && scenario.content_en) {
    return {
      ...scenario,
      title: scenario.title_en,
      sender: "COMMUNITY REPORT",
      content: scenario.content_en,
    };
  }
  const translation = ENGLISH_SCENARIOS[scenario.slug];
  return translation ? { ...scenario, ...translation } : scenario;
}
