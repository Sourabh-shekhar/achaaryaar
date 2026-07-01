"use client";

/**
 * InfoTicker — a slim, premium marquee strip for below the navbar.
 * Pure CSS animation (no <marquee>, no JS interval), so it's cheap on the main thread.
 *
 * Usage: place <InfoTicker /> directly under <Navbar /> in your layout.
 */

const TICKER_ITEMS = [
  "🥭 Authentic Homemade Pickles",
  "🌿 100% Natural Ingredients",
  "🚚 Pan-India Delivery",
  "⭐ Freshly Prepared in Small Batches",
  "❤️ Taste the Tradition",
];

// Brand tokens — kept local so this component has zero dependency on other files.
const BRAND = {
  forest: "#4F6B52",
  forestDark: "#3D5640",
  gold: "#C18A42",
  cream: "#FBF7F1",
};

function TickerTrack() {
  return (
    <div className="ticker-track">
      {TICKER_ITEMS.map((item, i) => (
        <span className="ticker-item" key={i}>
          {item}
          <span className="ticker-dot" aria-hidden="true">•</span>
        </span>
      ))}
    </div>
  );
}

export default function InfoTicker() {
  return (
    <div
      className="ticker-wrap"
      role="region"
      aria-label="Store highlights"
    >
      <div className="ticker-viewport">
        {/* Two copies back-to-back create the seamless loop: animating -50% on the
            outer flex row always lands exactly on the start of the second copy. */}
        <div className="ticker-scroller">
          <TickerTrack />
          <div aria-hidden="true">
            <TickerTrack />
          </div>
        </div>
      </div>

      <style>{`
        .ticker-wrap {
          width: 100%;
          height: 34px;
          background: linear-gradient(90deg, ${BRAND.forest} 0%, ${BRAND.forestDark} 100%);
          display: flex;
          align-items: center;
          overflow: hidden;
          box-shadow: inset 0 -1px 0 rgba(255,255,255,0.06);
        }

        .ticker-viewport {
          width: 100%;
          overflow: hidden;
        }

        .ticker-scroller {
          display: flex;
          align-items: center;
          width: max-content;
          animation: ticker-scroll 42s linear infinite;
        }

        .ticker-wrap:hover .ticker-scroller {
          animation-play-state: paused;
        }

        .ticker-track {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .ticker-item {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          color: ${BRAND.cream};
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.4px;
          padding: 0 1.5rem;
          line-height: 34px;
        }

        .ticker-dot {
          color: ${BRAND.gold};
          margin-left: 1.5rem;
          font-size: 0.6rem;
        }

        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .ticker-scroller {
            animation: none;
          }
          .ticker-viewport {
            overflow-x: auto;
          }
        }

        @media (max-width: 480px) {
          .ticker-item {
            font-size: 0.68rem;
            padding: 0 1.1rem;
          }
          .ticker-dot {
            margin-left: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}