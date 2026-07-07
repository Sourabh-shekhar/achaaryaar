"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/app/icon.png";

const COLORS = {
  cream: "#FBF7F1",
  gold: "#C18A42",
  forest: "#4F6B52",
};

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("achaaryaar_splash_seen");
    if (seen) return;

    setVisible(true);
    sessionStorage.setItem("achaaryaar_splash_seen", "true");

    const fadeTimer = setTimeout(() => setFadingOut(true), 2600);
    const removeTimer = setTimeout(() => setVisible(false), 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: COLORS.cream,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.4s ease",
        pointerEvents: fadingOut ? "none" : "auto",
      }}
    >
      <Image
        src={logo}
        alt="AchaarYaar"
        width={260}
        height={260}
        style={{ width: "clamp(160px, 30vw, 260px)", height: "auto", marginBottom: "1.5rem" }}
        priority
      />

      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: `3px solid rgba(45,42,38,0.15)`,
          borderTopColor: COLORS.gold,
          animation: "splash-spin 0.8s linear infinite",
        }}
      />

      <style>{`
        @keyframes splash-spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="splash-spin"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}