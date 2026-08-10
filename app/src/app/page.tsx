"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  Phone,
  Video,
  MoreHorizontal,
  Mic,
  ImageIcon,
  Smile,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Bell,
  BellOff,
  Shield,
  Wifi,
  Battery,
  Signal,
} from "lucide-react";

type SessionStatus = "waiting" | "paired" | "triggered" | "passed" | "failed";
type PushState = "idle" | "requesting" | "subscribed" | "denied" | "unsupported";

interface ScamPayload {
  type: string;
  sender: string;
  content: string;
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

function getTimeString() {
  const now = new Date();
  return now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export default function LearnerPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus>("waiting");
  const [scam, setScam] = useState<ScamPayload | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pushState, setPushState] = useState<PushState>("idle");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [msgTime] = useState(getTimeString());

  // Create or restore session on mount
  useEffect(() => {
    async function init() {
      try {
        // Check if there's an existing session in localStorage
        const savedId = localStorage.getItem("zalo_session_id");
        if (savedId) {
          // Verify the session still exists on the server
          const checkRes = await fetch(`/api/session/status?session_id=${savedId}`);
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            // Reuse session if not in a terminal state
            if (checkData.status && checkData.status !== "expired") {
              setSessionId(savedId);
              setStatus(checkData.status);
              if (checkData.scam) setScam(checkData.scam);
              console.log("[Session] Restored session:", savedId);
              return;
            }
          }
        }
        // Create a new session
        const res = await fetch("/api/session/create", { method: "POST" });
        if (!res.ok) throw new Error("Failed to create session");
        const data = await res.json();
        localStorage.setItem("zalo_session_id", data.session_id);
        setSessionId(data.session_id);
        console.log("[Session] Created new session:", data.session_id);
      } catch (err) {
        console.error("Session init error:", err);
      }
    }
    init();
  }, []);

  // Register service worker + listen for messages from SW
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      setPushState("unsupported");
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(console.error);

    // Listen for messages from the service worker (e.g. notification click)
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === "NOTIFICATION_CLICKED") {
        console.log("[SW Message] Notification clicked, session:", event.data.sessionId);
        // The session is already restored from localStorage in the init effect.
        // Just trigger a fresh poll to show the triggered scam message immediately.
        if (event.data.sessionId) {
          const savedId = localStorage.getItem("zalo_session_id");
          if (savedId === event.data.sessionId) {
            // Force an immediate status poll
            fetch(`/api/session/status?session_id=${savedId}`)
              .then((r) => r.json())
              .then((data) => {
                setStatus(data.status);
                if (data.scam) setScam(data.scam);
              })
              .catch(console.error);
          }
        }
      }
    };

    navigator.serviceWorker.addEventListener("message", handleSWMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleSWMessage);
    };
  }, []);

  const enableNotifications = useCallback(async () => {
    if (!sessionId) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushState("unsupported");
      return;
    }
    setPushState("requesting");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setPushState("denied"); return; }
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) throw new Error("VAPID key missing");
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      await fetch("/api/session/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, subscription: subscription.toJSON() }),
      });
      setPushState("subscribed");
    } catch (err) {
      console.error("[Push] error:", err);
      setPushState("idle");
    }
  }, [sessionId]);

  const pollStatus = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/session/status?session_id=${sessionId}`);
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data.status);
      if (data.scam) setScam(data.scam);
    } catch { /* ignore */ }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    pollingRef.current = setInterval(pollStatus, 2000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [sessionId, pollStatus]);

  useEffect(() => {
    if ((status === "passed" || status === "failed") && pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  }, [status]);

  const handleDelete = async () => {
    if (!sessionId) return;
    await fetch("/api/session/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, result: "passed" }),
    });
    setShowSuccess(true);
    setStatus("passed");
  };

  const handleTapLink = async () => {
    if (!sessionId) return;
    await fetch("/api/session/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, result: "failed" }),
    });
    setShowWarning(true);
    setStatus("failed");
  };

  const extractLink = (text: string) => {
    const match = text.match(/(?:https?:\/\/)?[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/\S*)?/);
    return match ? match[0] : null;
  };

  const renderMessageContent = (text: string) => {
    const link = extractLink(text);
    if (!link) return <span style={{ lineHeight: 1.6 }}>{text}</span>;
    const parts = text.split(link);
    return (
      <span style={{ lineHeight: 1.6 }}>
        {parts[0]}
        <span
          onClick={handleTapLink}
          style={{ color: "#0068ff", textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}
        >
          {link}
        </span>
        {parts[1]}
      </span>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f0f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* ── WARNING MODAL (Đỏ) ── */}
      {showWarning && (
        <div
          className="animate-danger-flash"
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "2rem",
            background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
          }}
        >
          <div className="animate-fade-in-scale" style={{ textAlign: "center", maxWidth: "380px", color: "white" }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
              animation: "shake 0.6s ease-in-out 2",
            }}>
              <AlertTriangle size={52} color="white" />
            </div>
            <h1 style={{
              fontSize: "clamp(1.6rem, 6vw, 2.2rem)", fontWeight: 900,
              marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "1px",
            }}>
              Bạn Đã Bị Lừa Đảo!
            </h1>
            <div style={{
              background: "rgba(0,0,0,0.25)", borderRadius: "16px",
              padding: "1.25rem", marginBottom: "1.5rem",
            }}>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.75, opacity: 0.95 }}>
                <strong>Đây là bài tập giả lập.</strong>
                <br /><br />
                KHÔNG BAO GIỜ bấm vào các đường link trong tin nhắn yêu cầu nộp tiền phạt, xác nhận tài khoản hoặc nhận quà thưởng.
                <br /><br />
                Cơ quan nhà nước không bao giờ gửi link thu tiền qua Zalo hay SMS.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: 0.75, fontSize: "0.85rem" }}>
              <Shield size={14} />
              Bài tập huấn luyện phòng tránh lừa đảo
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS MODAL (Xanh) ── */}
      {showSuccess && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "2rem",
            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
          }}
        >
          <div className="animate-fade-in-scale" style={{ textAlign: "center", maxWidth: "380px", color: "white" }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}>
              <CheckCircle2 size={52} color="white" />
            </div>
            <h1 style={{
              fontSize: "clamp(1.6rem, 6vw, 2.2rem)", fontWeight: 900,
              marginBottom: "0.75rem",
            }}>
              Xuất Sắc! Bạn đã cảnh giác!
            </h1>
            <div style={{
              background: "rgba(0,0,0,0.2)", borderRadius: "16px",
              padding: "1.25rem", marginBottom: "1.5rem",
            }}>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.75, opacity: 0.95 }}>
                Bạn đã nhận diện và xóa tin nhắn lừa đảo thành công!
                <br /><br />
                Hãy luôn nghi ngờ các tin nhắn yêu cầu khẩn cấp, chứa đường link lạ hoặc đề nghị chuyển tiền.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: 0.75, fontSize: "0.85rem" }}>
              <Shield size={14} />
              Bài tập huấn luyện phòng tránh lừa đảo
            </div>
          </div>
        </div>
      )}

      {/* ── PHONE FRAME ── */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        minHeight: "100dvh",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 0 60px rgba(0,0,0,0.15)",
      }}>
        {/* Status Bar */}
        <div style={{
          height: 44,
          background: "#0068ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          flexShrink: 0,
        }}>
          <span style={{ color: "white", fontSize: "0.8rem", fontWeight: 700 }}>
            {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Signal size={14} color="white" />
            <Wifi size={14} color="white" />
            <Battery size={14} color="white" />
          </div>
        </div>

        {/* Zalo Header */}
        <div style={{
          height: 56,
          background: "#0068ff",
          display: "flex",
          alignItems: "center",
          padding: "0 8px 0 4px",
          gap: 6,
          flexShrink: 0,
        }}>
          <button style={{ padding: 8, background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <ChevronLeft size={24} color="white" />
          </button>

          {/* Avatar */}
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {scam ? (
              <span style={{ fontSize: "1.2rem" }}>
                {scam.sender.includes("AN") || scam.sender.includes("CÔNG") ? "👮" :
                 scam.sender.includes("NGÂN HÀNG") || scam.sender.includes("BANK") ? "🏦" : "👤"}
              </span>
            ) : (
              <span style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>Z</span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "white", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.2 }}>
              {scam ? scam.sender : status === "waiting" ? "Đang chờ kết nối..." : "Đã kết nối"}
            </div>
            {scam && (
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.72rem" }}>
                Vừa hoạt động
              </div>
            )}
          </div>

          <button style={{ padding: 8, background: "none", border: "none", cursor: "pointer" }}>
            <Phone size={20} color="white" />
          </button>
          <button style={{ padding: 8, background: "none", border: "none", cursor: "pointer" }}>
            <Video size={20} color="white" />
          </button>
          <button style={{ padding: 8, background: "none", border: "none", cursor: "pointer" }}>
            <MoreHorizontal size={20} color="white" />
          </button>
        </div>

        {/* Chat Body */}
        <div style={{
          flex: 1,
          background: "#e5effa",
          overflowY: "auto",
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>

          {/* ── WAITING STATE ── */}
          {status === "waiting" && sessionId && (
            <div className="animate-fade-in" style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              flex: 1, gap: 20, paddingTop: 40, paddingBottom: 40,
            }}>
              {/* Logo Zalo */}
              <div style={{
                width: 80, height: 80, borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,104,255,0.25)",
              }}>
                <Image src="/zalo-logo.svg" alt="Zalo" width={80} height={80} />
              </div>

              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 6 }}>
                  Mã kết nối thiết bị của bạn
                </p>
                <div style={{
                  fontSize: "3.5rem", fontWeight: 900,
                  letterSpacing: "16px", color: "#0068ff",
                  fontVariantNumeric: "tabular-nums",
                  textShadow: "0 2px 8px rgba(0,104,255,0.2)",
                }}>
                  {sessionId}
                </div>
              </div>

              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "white", borderRadius: 24, padding: "10px 20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}>
                <div className="dot-pulse">
                  <span /><span /><span />
                </div>
                <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 500 }}>
                  Đang chờ người hướng dẫn kết nối...
                </span>
              </div>

              {/* Push Notification Banner */}
              {pushState === "idle" && (
                <div className="animate-fade-in" style={{
                  background: "white", borderRadius: 16, padding: "16px",
                  width: "100%", maxWidth: 340,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  border: "1.5px solid #dbeafe",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Bell size={18} color="#0068ff" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: "#1e40af", fontSize: "0.85rem", margin: 0 }}>
                        Bật thông báo đẩy
                      </p>
                      <p style={{ color: "#64748b", fontSize: "0.75rem", margin: 0 }}>
                        Nhận cảnh báo ngay cả khi tắt màn hình
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={enableNotifications}
                    style={{
                      width: "100%", padding: "10px",
                      borderRadius: 10, border: "none",
                      background: "linear-gradient(135deg, #0068ff 0%, #0052cc 100%)",
                      color: "white", fontWeight: 700, fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    Cho phép thông báo
                  </button>
                </div>
              )}
              {pushState === "subscribed" && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#f0fdf4", border: "1.5px solid #bbf7d0",
                  borderRadius: 12, padding: "10px 16px",
                  color: "#16a34a", fontSize: "0.82rem", fontWeight: 600,
                }}>
                  <Bell size={14} color="#16a34a" />
                  Thông báo đẩy đã được bật thành công
                </div>
              )}
              {pushState === "denied" && (
                <div style={{
                  background: "#fef2f2", border: "1.5px solid #fecaca",
                  borderRadius: 12, padding: "10px 16px",
                  color: "#dc2626", fontSize: "0.78rem",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <BellOff size={14} />
                  Thông báo bị chặn. Vào Cài đặt → Trình duyệt → Thông báo để bật lại.
                </div>
              )}
            </div>
          )}

          {/* ── PAIRED STATE ── */}
          {status === "paired" && (
            <div className="animate-fade-in" style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              flex: 1, gap: 16, paddingTop: 60,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "#f0fdf4", border: "2px solid #bbf7d0",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CheckCircle2 size={32} color="#16a34a" />
              </div>
              <p style={{ color: "#1e293b", fontWeight: 700, fontSize: "1.05rem", margin: 0 }}>Đã kết nối thành công</p>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", textAlign: "center", lineHeight: 1.6 }}>
                Mã phiên: <strong style={{ color: "#0068ff" }}>{sessionId}</strong>
                <br />Đang chờ người hướng dẫn gửi kịch bản...
              </p>
              <div className="dot-pulse"><span /><span /><span /></div>
            </div>
          )}

          {/* ── TRIGGERED STATE — Zalo Message ── */}
          {status === "triggered" && scam && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Date divider */}
              <div style={{ textAlign: "center" }}>
                <span style={{
                  background: "rgba(0,0,0,0.15)", color: "white",
                  fontSize: "0.7rem", borderRadius: 999, padding: "3px 10px",
                  fontWeight: 500,
                }}>
                  Hôm nay
                </span>
              </div>

              {/* Incoming message bubble */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, maxWidth: "85%" }}>
                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: "0.8rem",
                }}>
                  {scam.sender.includes("AN") || scam.sender.includes("CÔNG") ? "👮" :
                   scam.sender.includes("NGÂN HÀNG") || scam.sender.includes("BANK") ? "🏦" : "👤"}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 600, paddingLeft: 4 }}>
                    {scam.sender}
                  </div>

                  {/* Bubble */}
                  <div
                    className="animate-notification"
                    style={{
                      background: "white", borderRadius: "0 14px 14px 14px",
                      padding: "10px 14px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                      fontSize: "0.95rem", lineHeight: 1.6, color: "#1e293b",
                    }}
                  >
                    {renderMessageContent(scam.content)}

                    {/* Link Preview Card */}
                    {extractLink(scam.content) && (
                      <div
                        onClick={handleTapLink}
                        style={{
                          marginTop: 10, borderRadius: 10, overflow: "hidden",
                          border: "1px solid #e2e8f0", cursor: "pointer",
                          background: "#f8fafc",
                        }}
                      >
                        <div style={{
                          height: 6, background: "linear-gradient(90deg, #0068ff 0%, #60a5fa 100%)",
                        }} />
                        <div style={{ padding: "10px 12px" }}>
                          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0068ff", margin: "0 0 4px" }}>
                            {extractLink(scam.content)}
                          </p>
                          <p style={{ fontSize: "0.72rem", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                            Nhấn để truy cập trang web
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: "0.65rem", color: "#94a3b8", paddingLeft: 4 }}>
                    {msgTime}
                  </div>
                </div>
              </div>

              {/* Action Hint */}
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <p style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5 }}>
                  Bạn sẽ làm gì với tin nhắn này?
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={handleDelete}
                  style={{
                    flex: 1, padding: "12px 8px",
                    borderRadius: 12, border: "2px solid #e2e8f0",
                    background: "white", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 8, fontWeight: 700, color: "#dc2626", fontSize: "0.9rem",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fca5a5"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                >
                  <Trash2 size={18} />
                  Xóa tin nhắn
                </button>
              </div>

              <p style={{ fontSize: "0.7rem", color: "#94a3b8", textAlign: "center", lineHeight: 1.5 }}>
                Hoặc bấm vào đường link bên trên để xem điều gì xảy ra
              </p>
            </div>
          )}
        </div>

        {/* Zalo Footer Input Bar */}
        <div style={{
          background: "white",
          borderTop: "1px solid #f1f5f9",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}>
          {/* Zalo Mascot / Sticker icon */}
          <button style={{ padding: 6, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
            <Smile size={24} color="#0068ff" />
          </button>

          {/* Input */}
          <div style={{
            flex: 1, background: "#f1f5f9", borderRadius: 24,
            padding: "9px 16px",
            fontSize: "0.9rem", color: "#94a3b8",
            userSelect: "none",
          }}>
            Tin nhắn
          </div>

          <button style={{ padding: 6, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
            <Mic size={22} color="#0068ff" />
          </button>
          <button style={{ padding: 6, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
            <ImageIcon size={22} color="#0068ff" />
          </button>
          <button style={{ padding: 6, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
            <MoreHorizontal size={22} color="#0068ff" />
          </button>
        </div>
      </div>
    </div>
  );
}
