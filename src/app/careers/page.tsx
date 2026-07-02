"use client";

import { useId, useRef, useState } from "react";
import { FiUploadCloud, FiFile, FiX, FiBriefcase } from "react-icons/fi";

const COLORS = {
  forest: "#4F6B52",
  gold: "#C18A42",
  cream: "#FBF7F1",
  creamDark: "#F3EDE3",
  sand: "#E8DDD1",
  ink: "#2D2A26",
  muted: "#5C5249",
  white: "#FFFFFF",
};
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

const OPEN_ROLES = [
  { title: "Production Associate", location: "Siwan, Bihar", type: "Full-time" },
  { title: "Packaging & Quality Check", location: "Siwan, Bihar", type: "Full-time" },
  { title: "Delivery & Logistics Coordinator", location: "Patna, Bihar", type: "Full-time" },
  { title: "Social Media & Content Intern", location: "Remote", type: "Internship" },
];

const ACCEPTED_TYPES = [".pdf", ".doc", ".docx"];
const MAX_FILE_MB = 5;

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function CareersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const roleId = useId();
  const noteId = useId();

  function validateAndSetFile(f: File | null) {
    setFileError("");
    if (!f) return;
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setFileError("Please upload a PDF or Word document.");
      return;
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`File must be under ${MAX_FILE_MB}MB.`);
      return;
    }
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    validateAndSetFile(e.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setFileError("Please attach your resume before submitting.");
      return;
    }
    setStatus("loading");
    try {
      // TODO: wire this up to your real applications endpoint, e.g.:
      // const formData = new FormData(e.currentTarget as HTMLFormElement);
      // formData.append("resume", file);
      // const res = await fetch("/api/careers/apply", { method: "POST", body: formData });
      // if (!res.ok) throw new Error();
      await new Promise((resolve) => setTimeout(resolve, 900));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: COLORS.cream, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: COLORS.forest, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.6rem" }} aria-hidden="true">✓</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.6rem", color: COLORS.ink, marginBottom: "0.75rem" }}>Application received</h1>
          <p style={{ color: COLORS.muted, fontSize: "0.92rem", lineHeight: 1.7 }}>
            Thank you for your interest in joining Achaaryaar. Our team will review your resume and reach out if there&apos;s a match.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: COLORS.cream, minHeight: "100vh" }}>
      <section style={{
        background: `linear-gradient(135deg, ${COLORS.forest} 0%, #3D5640 100%)`,
        padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 2rem)",
        textAlign: "center",
      }}>
        <div style={{ color: COLORS.gold, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Join Our Team
        </div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(2rem, 5vw, 3rem)", color: COLORS.white, fontWeight: 900, maxWidth: 640, margin: "0 auto 0.75rem" }}>
          Careers at Achaaryaar
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", maxWidth: 480, margin: "0 auto" }}>
          Help us bring three generations of Bihar&apos;s pickle-making tradition to families across India.
        </p>
      </section>

      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "clamp(3rem, 6vw, 4.5rem) clamp(1.25rem, 5vw, 2rem)" }}>
        {/* Open roles */}
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.3rem", color: COLORS.ink, marginBottom: "1.25rem" }}>Open positions</h2>
        <div style={{ display: "grid", gap: "0.85rem", marginBottom: "3rem" }}>
          {OPEN_ROLES.map(role => (
            <div key={role.title} style={{
              background: COLORS.white,
              border: `1px solid ${COLORS.sand}`,
              borderRadius: 14,
              padding: "1.1rem 1.4rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.creamDark, color: COLORS.forest, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden="true">
                  <FiBriefcase size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: COLORS.ink, fontSize: "0.95rem" }}>{role.title}</div>
                  <div style={{ color: COLORS.muted, fontSize: "0.8rem" }}>{role.location} · {role.type}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ color: COLORS.muted, fontSize: "0.85rem", marginBottom: "3rem" }}>
          Don&apos;t see a role that fits? Drop your resume below anyway — we keep every application on file for future openings.
        </p>

        {/* Application form */}
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.sand}`, borderRadius: 18, padding: "clamp(1.5rem, 4vw, 2.25rem)" }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.3rem", color: COLORS.ink, marginBottom: "1.5rem" }}>Apply now</h2>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
            <div className="careers-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label htmlFor={nameId} style={labelStyle}>Full name</label>
                <input id={nameId} name="name" required style={inputStyle} />
              </div>
              <div>
                <label htmlFor={emailId} style={labelStyle}>Email</label>
                <input id={emailId} name="email" type="email" required style={inputStyle} />
              </div>
              <div>
                <label htmlFor={phoneId} style={labelStyle}>Phone</label>
                <input id={phoneId} name="phone" type="tel" required style={inputStyle} />
              </div>
              <div>
                <label htmlFor={roleId} style={labelStyle}>Position you&apos;re applying for</label>
                <select id={roleId} name="role" required style={inputStyle} defaultValue="">
                  <option value="" disabled>Select a role</option>
                  {OPEN_ROLES.map(r => <option key={r.title} value={r.title}>{r.title}</option>)}
                  <option value="General application">General application</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor={noteId} style={labelStyle}>A note about yourself (optional)</label>
              <textarea id={noteId} name="note" rows={4} style={{ ...inputStyle, resize: "vertical" as const }} />
            </div>

            <div>
              <span style={labelStyle}>Resume</span>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
                style={{
                  border: `1.5px dashed ${dragOver ? COLORS.forest : COLORS.sand}`,
                  borderRadius: 12,
                  padding: "1.75rem 1rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: dragOver ? COLORS.creamDark : COLORS.cream,
                  transition: "background 0.15s ease, border-color 0.15s ease",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={(e) => validateAndSetFile(e.target.files?.[0] ?? null)}
                  style={{ display: "none" }}
                />
                {!file ? (
                  <>
                    <FiUploadCloud size={26} color={COLORS.forest} style={{ marginBottom: "0.5rem" }} />
                    <div style={{ color: COLORS.ink, fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.25rem" }}>
                      Drop your resume here, or click to browse
                    </div>
                    <div style={{ color: COLORS.muted, fontSize: "0.76rem" }}>PDF or Word, up to {MAX_FILE_MB}MB</div>
                  </>
                ) : (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", background: COLORS.creamDark, padding: "0.6rem 1rem", borderRadius: 10 }}>
                    <FiFile color={COLORS.forest} />
                    <span style={{ fontSize: "0.85rem", color: COLORS.ink, fontWeight: 600 }}>{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      aria-label="Remove resume"
                      style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.muted, display: "flex" }}
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
              </div>
              {fileError && <div role="alert" style={{ color: "#B23A3A", fontSize: "0.8rem", marginTop: "0.5rem" }}>{fileError}</div>}
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                background: COLORS.gold,
                color: COLORS.forest,
                border: "none",
                padding: "0.9rem 1.5rem",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: "0.92rem",
                cursor: status === "loading" ? "wait" : "pointer",
                opacity: status === "loading" ? 0.7 : 1,
                marginTop: "0.25rem",
              }}
            >
              {status === "loading" ? "Submitting…" : "Submit Application"}
            </button>
            {status === "error" && (
              <div role="alert" style={{ color: "#B23A3A", fontSize: "0.85rem" }}>Something went wrong. Please try again.</div>
            )}
          </form>
        </div>
      </section>

      <style>{`
        @media (max-width: 560px) {
          .careers-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.82rem",
  fontWeight: 600,
  color: COLORS.ink,
  display: "block",
  marginBottom: "0.4rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  borderRadius: 10,
  border: `1px solid ${COLORS.sand}`,
  fontSize: "0.9rem",
  outline: "none",
  fontFamily: "inherit",
  background: COLORS.white,
};