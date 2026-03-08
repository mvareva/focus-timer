import { useState, useEffect, useRef, useCallback } from "react";

const PRESETS = [
  { label: "Focus", minutes: 25, color: "hsl(24, 85%, 58%)" },
  { label: "Short Break", minutes: 5, color: "hsl(160, 60%, 45%)" },
  { label: "Long Break", minutes: 15, color: "hsl(220, 70%, 55%)" },
];

/* ── CSS Variables & Styles ──────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap');

  :root {
    --ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
    --ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
    --ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);

    --z-base: 0;
    --z-elevated: 10;
    --z-overlay: 100;

    --gray-1: #0a0a0b;
    --gray-2: #111113;
    --gray-3: #19191d;
    --gray-4: #222228;
    --gray-5: #2c2c35;
    --gray-6: #383845;
    --gray-7: #50506b;
    --gray-8: #6e6e8a;
    --gray-9: #8f8fa8;
    --gray-10: #a8a8be;
    --gray-11: #c4c4d4;
    --gray-12: #ededf0;

    --border-hairline: 1px;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
  }

  @media only screen and (min-device-pixel-ratio: 2),
    only screen and (min-resolution: 192dpi) {
    :root {
      --border-hairline: 0.5px;
    }
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-family: 'DM Mono', monospace;
    background: var(--gray-1);
    color: var(--gray-12);
  }

  /* ── Animations ──────────────────────────────────── */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes pulseRing {
    0% {
      transform: scale(1);
      opacity: 0.4;
    }
    100% {
      transform: scale(1.6);
      opacity: 0;
    }
  }

  @keyframes subtleFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  @keyframes progressPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  /* ── Reduced Motion ──────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
    }
  }

  /* ── Focus States ──────────────────────────────── */
  *:focus-visible {
    outline: 2px solid var(--gray-8);
    outline-offset: 2px;
  }
`;

/* ── Utility: format seconds to mm:ss ──────────────────────────── */
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ── Ring Progress SVG ─────────────────────────────────────────── */
function RingProgress({ progress, color, isRunning, size = 280 }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Pulse ring when running */}
      {isRunning && (
        <div
          style={{
            position: "absolute",
            inset: -20,
            borderRadius: "50%",
            border: `1px solid ${color}`,
            animation: "pulseRing 2.5s var(--ease-out-quint) infinite",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />
      )}
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--gray-4)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s var(--ease-out-cubic), stroke 400ms var(--ease-out-cubic)",
          }}
        />
      </svg>
    </div>
  );
}

/* ── Preset Tab Button ─────────────────────────────────────────── */
function PresetTab({ preset, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={`${preset.label} timer: ${preset.minutes} minutes`}
      aria-pressed={isActive}
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 12,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        fontWeight: "var(--font-weight-normal)",
        color: isActive ? "var(--gray-12)" : "var(--gray-8)",
        background: isActive ? "var(--gray-3)" : "transparent",
        border: "none",
        borderRadius: 8,
        padding: "8px 16px",
        cursor: "pointer",
        /* min 44px tap target */
        minHeight: 44,
        minWidth: 44,
        position: "relative",
        transition: "color 200ms ease, background 200ms ease",
        /* shadow border instead of hard border */
        boxShadow: isActive ? "0 0 0 1px rgba(255,255,255,0.06)" : "none",
      }}
    >
      {preset.label}
    </button>
  );
}

/* ── Main Control Button ───────────────────────────────────────── */
function ControlButton({ children, onClick, variant = "primary", color, ariaLabel }) {
  const [isPressed, setIsPressed] = useState(false);
  const isPrimary = variant === "primary";

  return (
    <button
      onClick={onClick}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      aria-label={ariaLabel}
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 13,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontWeight: "var(--font-weight-medium)",
        color: isPrimary ? "var(--gray-1)" : "var(--gray-11)",
        background: isPrimary ? color : "var(--gray-3)",
        border: "none",
        borderRadius: 12,
        padding: "14px 32px",
        cursor: "pointer",
        minHeight: 44,
        minWidth: 44,
        transform: isPressed ? "scale(0.97)" : "scale(1)",
        transition: "transform 150ms var(--ease-out-cubic), background 300ms ease, color 200ms ease",
        boxShadow: isPrimary
          ? `0 0 0 1px ${color}, 0 4px 16px -4px ${color}44`
          : "0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </button>
  );
}

/* ── Completion Overlay ────────────────────────────────────────── */
function CompletionOverlay({ preset, onDismiss }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        zIndex: "var(--z-overlay)",
        background: "var(--gray-1)",
        animation: "fadeIn 400ms var(--ease-out-quint)",
      }}
      role="alert"
    >
      <div
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 48,
          fontStyle: "italic",
          color: preset.color,
          animation: "fadeInUp 600ms var(--ease-out-quint)",
          textWrap: "balance",
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        Well done.
      </div>
      <p
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          color: "var(--gray-8)",
          letterSpacing: "0.03em",
          animation: "fadeInUp 600ms var(--ease-out-quint) 100ms both",
        }}
      >
        {preset.label} complete \u2014 {preset.minutes} min
      </p>
      <div style={{ animation: "fadeInUp 600ms var(--ease-out-quint) 200ms both" }}>
        <ControlButton onClick={onDismiss} variant="secondary" ariaLabel="Dismiss and continue">
          Continue
        </ControlButton>
      </div>
    </div>
  );
}

/* ── Main App ──────────────────────────────────────────────────── */
export default function FocusTimer() {
  const [activePreset, setActivePreset] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PRESETS[0].minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const intervalRef = useRef(null);
  const hasStartedRef = useRef(false);

  const preset = PRESETS[activePreset];
  const totalSeconds = preset.minutes * 60;
  const progress = 1 - secondsLeft / totalSeconds;

  /* ── Timer logic ─────────────────────────────── */
  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && hasStartedRef.current) {
      setIsRunning(false);
      setShowComplete(true);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, secondsLeft]);

  const handlePresetChange = useCallback((index) => {
    setActivePreset(index);
    setSecondsLeft(PRESETS[index].minutes * 60);
    setIsRunning(false);
    setShowComplete(false);
    hasStartedRef.current = false;
  }, []);

  const handleToggle = useCallback(() => {
    if (!isRunning) hasStartedRef.current = true;
    setIsRunning((r) => !r);
  }, [isRunning]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
    setShowComplete(false);
    hasStartedRef.current = false;
  }, [totalSeconds]);

  const handleDismissComplete = useCallback(() => {
    setShowComplete(false);
    // Auto-advance to next preset
    const nextIndex = (activePreset + 1) % PRESETS.length;
    handlePresetChange(nextIndex);
  }, [activePreset, handlePresetChange]);

  /* ── Keyboard: Space to toggle ───────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        if (showComplete) {
          handleDismissComplete();
        } else {
          handleToggle();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleToggle, handleDismissComplete, showComplete]);

  return (
    <>
      <style>{styles}</style>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--gray-1)",
          padding: "24px 16px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'DM Mono', monospace",
          isolation: "isolate",
        }}
      >
        {/* Ambient glow — decorative */}
        <div
          aria-hidden="true"
          style={{
            pointerEvents: "none",
            userSelect: "none",
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${preset.color}08 0%, transparent 70%)`,
            transition: "background 800ms ease",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: "var(--z-base)",
          }}
        />

        {/* Completion overlay */}
        {showComplete && (
          <CompletionOverlay preset={preset} onDismiss={handleDismissComplete} />
        )}

        {/* Top label */}
        <div
          style={{
            animation: "fadeInUp 500ms var(--ease-out-quint) 0ms both",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontSize: 18,
              color: "var(--gray-8)",
              letterSpacing: "-0.01em",
            }}
          >
            Focus Timer
          </span>
        </div>

        {/* Preset tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 48,
            padding: 4,
            borderRadius: 12,
            background: "var(--gray-2)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.03)",
            animation: "fadeInUp 500ms var(--ease-out-quint) 60ms both",
          }}
          role="tablist"
          aria-label="Timer presets"
        >
          {PRESETS.map((p, i) => (
            <PresetTab
              key={p.label}
              preset={p}
              isActive={activePreset === i}
              onClick={() => handlePresetChange(i)}
            />
          ))}
        </div>

        {/* Ring + Time */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 48,
            animation: "fadeInUp 500ms var(--ease-out-quint) 120ms both",
          }}
        >
          <RingProgress
            progress={progress}
            color={preset.color}
            isRunning={isRunning}
          />
          {/* Time display — centered over ring */}
          <div
            style={{
              position: "absolute",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <time
              aria-live="polite"
              aria-label={`${Math.floor(secondsLeft / 60)} minutes ${secondsLeft % 60} seconds remaining`}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 64,
                fontWeight: 300,
                letterSpacing: "-0.03em",
                /* tabular-nums to prevent layout shift */
                fontVariantNumeric: "tabular-nums",
                color: "var(--gray-12)",
                lineHeight: 1,
                animation: isRunning ? "none" : "subtleFloat 4s ease-in-out infinite",
              }}
            >
              {formatTime(secondsLeft)}
            </time>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: preset.color,
                transition: "color 400ms ease",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {isRunning ? "running\u2026" : hasStartedRef.current ? "paused" : "ready"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            animation: "fadeInUp 500ms var(--ease-out-quint) 180ms both",
          }}
        >
          <ControlButton
            onClick={handleToggle}
            variant="primary"
            color={preset.color}
            ariaLabel={isRunning ? "Pause timer" : "Start timer"}
          >
            {isRunning ? "Pause" : "Start"}
          </ControlButton>
          <ControlButton
            onClick={handleReset}
            variant="secondary"
            ariaLabel="Reset timer"
          >
            Reset
          </ControlButton>
        </div>

        {/* Keyboard hint */}
        <div
          style={{
            marginTop: 32,
            fontSize: 11,
            color: "var(--gray-6)",
            letterSpacing: "0.04em",
            animation: "fadeIn 800ms var(--ease-out-quint) 400ms both",
          }}
          aria-hidden="true"
        >
          press space to toggle
        </div>
      </div>
    </>
  );
}
