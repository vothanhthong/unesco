"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Car,
  CreditCard,
  Gift,
  Package,
  Users,
  Video,
  Ambulance,
  Briefcase,
  TrendingUp,
  Heart,
  Link2,
  Send,
  Radio,
  Pencil,
  X,
  CheckCircle2,
  AlertTriangle,
  Shield,
  ChevronRight,
  Wifi,
} from "lucide-react";

type SessionStatus = "waiting" | "paired" | "triggered" | "passed" | "failed";

interface Scenario {
  id: number;
  icon: React.ReactNode;
  group: "message" | "call" | "investment";
  groupLabel: string;
  title: string;
  sender: string;
  content: string;
  linkHint?: string;
}

const SCENARIOS: Scenario[] = [
  // Nhóm A: Tin nhắn Zalo & SMS
  {
    id: 1, group: "message", groupLabel: "Tin nhắn Zalo & SMS",
    icon: <Car size={22} />,
    title: "Phạt Nguội Giao Thông",
    sender: "CẢNH SÁT GIAO THÔNG",
    content: "CẢNH BÁO: Phương tiện mang biển số của bạn đã vi phạm giao thông. Truy cập phatnguoivn.com.vn để nộp phạt trong 24 giờ hoặc bị khóa giấy phép lái xe.",
    linkHint: "phatnguoivn.com.vn",
  },
  {
    id: 2, group: "message", groupLabel: "Tin nhắn Zalo & SMS",
    icon: <CreditCard size={22} />,
    title: "Khóa Tài Khoản Ngân Hàng",
    sender: "VIETCOMBANK THÔNG BÁO",
    content: "Tài khoản của quý khách vừa bị đăng nhập bất thường từ thiết bị lạ. Xác minh ngay tại vietcombank-security.com để tránh bị khóa tài khoản vĩnh viễn.",
    linkHint: "vietcombank-security.com",
  },
  {
    id: 3, group: "message", groupLabel: "Tin nhắn Zalo & SMS",
    icon: <Gift size={22} />,
    title: "Trúng Thưởng Zalo / Tri Ân",
    sender: "ZALO OFFICIAL",
    content: "Chúc mừng! Tài khoản Zalo của bạn đã trúng thưởng iPhone 15 Pro và tiền mặt 50 triệu đồng từ chương trình Tri ân 10 năm. Nhận thưởng tại: zalo-trung-thuong.net",
    linkHint: "zalo-trung-thuong.net",
  },
  {
    id: 4, group: "message", groupLabel: "Tin nhắn Zalo & SMS",
    icon: <Package size={22} />,
    title: "Bưu Kiện Hỏa Tốc Bị Giữ",
    sender: "VIETTEL POST",
    content: "Bưu kiện mã VTP-2806-XXXX của quý khách bị giữ tại hải quan do nghi chứa vật phẩm vi phạm. Vui lòng xác minh tại viettelpost-xacminh.com trong 12 giờ.",
    linkHint: "viettelpost-xacminh.com",
  },
  {
    id: 5, group: "message", groupLabel: "Tin nhắn Zalo & SMS",
    icon: <Users size={22} />,
    title: "Mượn Tiền Giả Danh Con Cháu",
    sender: "Nguyễn Minh Khoa (Con)",
    content: "Mẹ ơi, con đang cần gấp 8 triệu để đóng học phí hôm nay không thì bị đuổi học. Mẹ chuyển vào số tài khoản 1234-5678-9012 ngân hàng Techcombank giúp con với ạ. Con xin lỗi mẹ vì làm phiền.",
  },
  // Nhóm B: Video Call / Deepfake
  {
    id: 6, group: "call", groupLabel: "Cuộc gọi & Deepfake",
    icon: <Video size={22} />,
    title: "Deepfake Video Call Công An",
    sender: "CÔNG AN THÀNH PHỐ",
    content: "Đây là Thiếu tá Nguyễn Văn Hùng – Công an TP.HCM. Tên của bà có liên quan đến đường dây rửa tiền quốc tế. Để tránh bị bắt giữ, bà cần chuyển 30 triệu đồng vào tài khoản tạm giữ trong 2 giờ.",
  },
  {
    id: 7, group: "call", groupLabel: "Cuộc gọi & Deepfake",
    icon: <Ambulance size={22} />,
    title: "Cuộc Gọi Cấp Cứu Khẩn Cấp",
    sender: "BỆNH VIỆN BẠCH MAI",
    content: "Tôi là bác sĩ trực cấp cứu Bệnh viện Bạch Mai. Con trai bà vừa nhập viện do tai nạn giao thông nghiêm trọng. Chúng tôi cần bà chuyển gấp 15 triệu đồng viện phí trước khi phẫu thuật.",
  },
  // Nhóm C: Đầu tư & Việc làm Online
  {
    id: 8, group: "investment", groupLabel: "Đầu tư & Việc làm Online",
    icon: <Briefcase size={22} />,
    title: "Tuyển Cộng Tác Viên Chốt Đơn",
    sender: "Tuyển Dụng Shopee VN",
    content: "Chào chị! Em cần tìm cộng tác viên chốt đơn hàng Shopee tại nhà, làm 2-3 tiếng/ngày, lương 500k-2 triệu/ngày. Không cần kinh nghiệm, không cần đặt cọc. Chị có muốn tham gia không ạ? Đăng ký ngay tại: ctv-shopee-vn.com",
    linkHint: "ctv-shopee-vn.com",
  },
  {
    id: 9, group: "investment", groupLabel: "Đầu tư & Việc làm Online",
    icon: <TrendingUp size={22} />,
    title: "Đầu Tư Tài Chính Lợi Nhuận Cao",
    sender: "Hội Đầu Tư Chứng Khoán VN",
    content: "Chào bác! Hội đầu tư chứng khoán của chúng tôi đang có chương trình đặc biệt: lãi suất 10-15%/ngày, an toàn tuyệt đối. Bác chỉ cần đầu tư 5 triệu, sau 7 ngày nhận về 8-10 triệu. Tham gia tại: dautuvn-pro.com",
    linkHint: "dautuvn-pro.com",
  },
  {
    id: 10, group: "investment", groupLabel: "Đầu tư & Việc làm Online",
    icon: <Heart size={22} />,
    title: "Trợ Cấp Xã Hội / Quỹ Từ Thiện",
    sender: "HỘI CHỮ THẬP ĐỎ VN",
    content: "Kính gửi công dân! Theo danh sách hộ gia đình khó khăn, gia đình bạn được hỗ trợ 2.000.000 đồng từ Quỹ An sinh Xã hội 2026. Vui lòng xác nhận nhận tiền tại: hotrocovid-vn.com trước 17h hôm nay.",
    linkHint: "hotrocovid-vn.com",
  },
];

const GROUP_ORDER = ["message", "call", "investment"];
const GROUP_LABELS: Record<string, string> = {
  message: "📱 Nhóm A — Tin nhắn Zalo & SMS",
  call: "📹 Nhóm B — Cuộc gọi & Deepfake Video Call",
  investment: "💼 Nhóm C — Đầu tư & Việc làm Online",
};
const GROUP_COLORS: Record<string, string> = {
  message: "#0068ff",
  call: "#dc2626",
  investment: "#7c3aed",
};

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  waiting: { label: "Đang chờ", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  paired: { label: "Đã kết nối", color: "#0068ff", bg: "rgba(0,104,255,0.12)" },
  triggered: { label: "Đã gửi — Đang chờ phản hồi", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  passed: { label: "An toàn — Đã xóa tin nhắn", color: "#16a34a", bg: "rgba(22,163,74,0.12)" },
  failed: { label: "Cảnh báo — Đã bấm vào link lừa đảo", color: "#dc2626", bg: "rgba(220,38,38,0.12)" },
};

export default function TriggerPage() {
  const [step, setStep] = useState<"pairing" | "dashboard" | "sent">("pairing");
  const [code, setCode] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [editedSender, setEditedSender] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleConnect = async () => {
    if (code.length !== 4) { setError("Vui lòng nhập đúng mã 4 chữ số"); return; }
    setError(""); setConnecting(true);
    try {
      const res = await fetch("/api/session/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: code }),
      });
      if (!res.ok) { setError("Không tìm thấy phiên. Kiểm tra lại mã và thử lại."); setConnecting(false); return; }
      setSessionId(code);
      setSessionStatus("paired");
      setStep("dashboard");
    } catch { setError("Kết nối thất bại. Vui lòng thử lại."); }
    setConnecting(false);
  };

  const handleSelectScenario = (s: Scenario) => {
    setSelectedScenario(s);
    setEditedSender(s.sender);
    setEditedContent(s.content);
  };

  const handleSend = async () => {
    if (!sessionId || !selectedScenario) return;
    setSending(true);
    try {
      await fetch("/api/scam/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          type: "sms",
          sender: editedSender,
          content: editedContent,
        }),
      });
      setSessionStatus("triggered");
      setStep("sent");
    } catch { setError("Gửi thất bại. Vui lòng thử lại."); }
    setSending(false);
  };

  const pollStatus = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/session/status?session_id=${sessionId}`);
      if (!res.ok) return;
      const data = await res.json();
      setSessionStatus(data.status);
    } catch { /* ignore */ }
  }, [sessionId]);

  useEffect(() => {
    if (step === "sent" && sessionId) {
      pollingRef.current = setInterval(pollStatus, 2000);
      return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }
  }, [step, sessionId, pollStatus]);

  useEffect(() => {
    if ((sessionStatus === "passed" || sessionStatus === "failed") && pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  }, [sessionStatus]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #1a1145 100%)",
      color: "#e2e8f0",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background Orbs */}
      <div style={{ position: "absolute", top: "10%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,104,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "-5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Top Bar */}
      <div style={{
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden" }}>
            <Image src="/zalo-logo.svg" alt="Zalo" width={36} height={36} />
          </div>
          <div>
            <h1 style={{
              fontSize: "1.05rem", fontWeight: 800, margin: 0,
              background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Bảng Điều Khiển Kịch Bản
            </h1>
            <p style={{ fontSize: "0.7rem", color: "rgba(148,163,184,0.6)", margin: 0 }}>Huấn luyện phòng tránh lừa đảo</p>
          </div>
        </div>

        {sessionId && sessionStatus && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              padding: "5px 12px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 700,
              color: STATUS_LABELS[sessionStatus]?.color,
              background: STATUS_LABELS[sessionStatus]?.bg,
              border: `1px solid ${STATUS_LABELS[sessionStatus]?.color}30`,
            }}>
              {STATUS_LABELS[sessionStatus]?.label}
            </span>
            <span style={{ fontSize: "0.75rem", color: "rgba(148,163,184,0.5)" }}>
              Mã: <strong style={{ color: "#60a5fa" }}>{sessionId}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1.25rem", position: "relative", zIndex: 1 }}>

        {/* ── PAIRING STEP ── */}
        {step === "pairing" && (
          <div className="animate-fade-in" style={{ paddingTop: 48 }}>
            <div className="glass-card" style={{ padding: "2.5rem 2rem", textAlign: "center", maxWidth: 420, margin: "0 auto" }}>
              <div className="animate-float" style={{ marginBottom: "1.25rem" }}>
                <Wifi size={48} color="#60a5fa" style={{ margin: "0 auto" }} />
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                Kết Nối Thiết Bị Học Viên
              </h2>
              <p style={{ color: "rgba(148,163,184,0.7)", fontSize: "0.9rem", marginBottom: "2rem", lineHeight: 1.6 }}>
                Nhập mã 4 chữ số hiển thị trên thiết bị của người học.
              </p>

              <div style={{ display: "flex", gap: 10, maxWidth: 340, margin: "0 auto" }}>
                <input
                  type="text" inputMode="numeric" pattern="[0-9]*"
                  className="input-field"
                  placeholder="Ví dụ: 1234"
                  maxLength={4}
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                  style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "12px", fontVariantNumeric: "tabular-nums" }}
                />
                <button
                  className="btn-primary"
                  onClick={handleConnect}
                  disabled={connecting || code.length !== 4}
                  style={{ whiteSpace: "nowrap", padding: "12px 20px" }}
                >
                  {connecting ? "Đang kết nối..." : "Kết Nối"}
                </button>
              </div>

              {error && (
                <p className="animate-shake" style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "1rem" }}>
                  {error}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── DASHBOARD STEP ── */}
        {step === "dashboard" && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: 4 }}>Chọn Kịch Bản Lừa Đảo</h2>
              <p style={{ fontSize: "0.85rem", color: "rgba(148,163,184,0.65)", margin: 0 }}>
                10 tình huống lừa đảo phổ biến tại Việt Nam
              </p>
            </div>

            {GROUP_ORDER.map((group) => (
              <div key={group} style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
                  <div style={{ height: 1, width: 20, background: `${GROUP_COLORS[group]}50` }} />
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: GROUP_COLORS[group], textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {GROUP_LABELS[group]}
                  </span>
                  <div style={{ height: 1, flex: 1, background: `${GROUP_COLORS[group]}30` }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SCENARIOS.filter((s) => s.group === group).map((s) => (
                    <div key={s.id}>
                      <div
                        className="glass-card"
                        onClick={() => handleSelectScenario(selectedScenario?.id === s.id ? null as unknown as Scenario : s)}
                        style={{
                          padding: "14px 18px", cursor: "pointer",
                          borderColor: selectedScenario?.id === s.id ? `${GROUP_COLORS[group]}60` : "rgba(255,255,255,0.08)",
                          boxShadow: selectedScenario?.id === s.id ? `0 4px 24px ${GROUP_COLORS[group]}20` : "none",
                          transition: "all 0.25s",
                          display: "flex", alignItems: "center", gap: 14,
                        }}
                      >
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                          background: `${GROUP_COLORS[group]}20`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: GROUP_COLORS[group],
                        }}>
                          {s.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 2 }}>{s.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "rgba(148,163,184,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            Người gửi: {s.sender}
                          </div>
                        </div>
                        <ChevronRight size={18} color="rgba(148,163,184,0.4)" style={{
                          transform: selectedScenario?.id === s.id ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }} />
                      </div>

                      {/* Expanded Edit Form */}
                      {selectedScenario?.id === s.id && (
                        <div className="animate-slide-down" style={{
                          marginTop: 4,
                          background: "rgba(0,0,0,0.25)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "0 0 16px 16px",
                          padding: "20px",
                        }}>
                          <div style={{ marginBottom: "1rem" }}>
                            <label style={{
                              display: "flex", alignItems: "center", gap: 6,
                              fontSize: "0.75rem", fontWeight: 700, color: "rgba(148,163,184,0.8)",
                              textTransform: "uppercase", letterSpacing: 0.5,
                              marginBottom: 6,
                            }}>
                              <Pencil size={12} /> Tên người gửi
                            </label>
                            <input
                              type="text" className="input-field"
                              value={editedSender}
                              onChange={(e) => setEditedSender(e.target.value)}
                            />
                          </div>
                          <div style={{ marginBottom: "1.25rem" }}>
                            <label style={{
                              display: "flex", alignItems: "center", gap: 6,
                              fontSize: "0.75rem", fontWeight: 700, color: "rgba(148,163,184,0.8)",
                              textTransform: "uppercase", letterSpacing: 0.5,
                              marginBottom: 6,
                            }}>
                              <Pencil size={12} /> Nội dung tin nhắn
                            </label>
                            <textarea
                              className="input-field"
                              rows={4} value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              style={{ resize: "vertical", lineHeight: 1.6 }}
                            />
                          </div>
                          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button
                              className="btn-outline"
                              onClick={() => setSelectedScenario(null)}
                              style={{ padding: "10px 18px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}
                            >
                              <X size={14} /> Hủy
                            </button>
                            <button
                              className="btn-primary"
                              onClick={handleSend}
                              disabled={sending || !editedSender || !editedContent}
                              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px" }}
                            >
                              {sending ? (
                                <>
                                  <div className="dot-pulse" style={{ transform: "scale(0.7)" }}><span /><span /><span /></div>
                                  Đang gửi...
                                </>
                              ) : (
                                <>
                                  <Send size={16} /> Gửi Kịch Bản Giả Lập
                                </>
                              )}
                            </button>
                          </div>
                          {error && <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: 8, textAlign: "center" }}>{error}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SENT / RESULTS STEP ── */}
        {step === "sent" && (
          <div className="animate-fade-in" style={{ paddingTop: 48 }}>
            <div className="glass-card" style={{ padding: "2.5rem 2rem", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>

              {/* Waiting for result */}
              {sessionStatus === "triggered" && (
                <>
                  <div className="animate-float" style={{ marginBottom: "1.25rem" }}>
                    <Radio size={52} color="#60a5fa" style={{ margin: "0 auto" }} />
                  </div>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                    Đã Gửi Kịch Bản!
                  </h2>
                  <p style={{ color: "rgba(148,163,184,0.7)", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                    Tin nhắn lừa đảo đã được gửi đến phiên{" "}
                    <strong style={{ color: "#60a5fa" }}>{sessionId}</strong>.
                    <br />Đang chờ phản hồi của học viên...
                  </p>
                  <div className="dot-pulse"><span /><span /><span /></div>
                </>
              )}

              {/* PASSED result */}
              {sessionStatus === "passed" && (
                <div className="animate-fade-in-scale">
                  <div style={{
                    width: 88, height: 88, borderRadius: "50%",
                    background: "rgba(22,163,74,0.15)", border: "2px solid rgba(22,163,74,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1.25rem",
                  }}>
                    <CheckCircle2 size={44} color="#22c55e" />
                  </div>
                  <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#22c55e", marginBottom: "0.5rem" }}>
                    An Toàn — Vượt Qua!
                  </h2>
                  <p style={{ color: "rgba(148,163,184,0.75)", fontSize: "0.92rem", lineHeight: 1.7, maxWidth: 400, margin: "0 auto 1.5rem" }}>
                    Học viên đã nhận diện thành công tin nhắn lừa đảo và xóa đi. Tuyệt vời!
                  </p>
                  <div style={{
                    background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.25)",
                    borderRadius: 12, padding: "14px 18px",
                    display: "inline-flex", alignItems: "center", gap: 8,
                  }}>
                    <Shield size={16} color="#22c55e" />
                    <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.88rem" }}>
                      Phiên {sessionId} hoàn thành thành công
                    </span>
                  </div>
                  <div style={{ marginTop: "1.5rem" }}>
                    <button
                      className="btn-outline"
                      onClick={() => { setStep("dashboard"); setSessionStatus("paired"); setSelectedScenario(null); }}
                    >
                      Thử Kịch Bản Khác
                    </button>
                  </div>
                </div>
              )}

              {/* FAILED result */}
              {sessionStatus === "failed" && (
                <div className="animate-fade-in-scale">
                  <div className="animate-shake" style={{
                    width: 88, height: 88, borderRadius: "50%",
                    background: "rgba(220,38,38,0.15)", border: "2px solid rgba(220,38,38,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1.25rem",
                  }}>
                    <AlertTriangle size={44} color="#ef4444" />
                  </div>
                  <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#ef4444", marginBottom: "0.5rem" }}>
                    Cảnh Báo — Đã Bị Mắc Bẫy!
                  </h2>
                  <p style={{ color: "rgba(148,163,184,0.75)", fontSize: "0.92rem", lineHeight: 1.7, maxWidth: 400, margin: "0 auto 1.5rem" }}>
                    Học viên đã bấm vào đường link lừa đảo. Đây là cơ hội tốt để hướng dẫn thêm về các dấu hiệu nhận biết lừa đảo.
                  </p>
                  <div style={{
                    background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)",
                    borderRadius: 12, padding: "14px 18px",
                    display: "inline-flex", alignItems: "center", gap: 8,
                  }}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <span style={{ color: "#ef4444", fontWeight: 700, fontSize: "0.88rem" }}>
                      Phiên {sessionId} — Học viên đã bị mắc bẫy
                    </span>
                  </div>
                  <div style={{ marginTop: "1.5rem" }}>
                    <button
                      className="btn-outline"
                      onClick={() => { setStep("dashboard"); setSessionStatus("paired"); setSelectedScenario(null); }}
                    >
                      Thử Lại Kịch Bản Khác
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
