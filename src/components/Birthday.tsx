import { useCallback, useEffect, useRef, useState } from "react";

/* ================================================================== *
 * ✏️  EDIT ME — the birthday takeover.
 * ================================================================== */

/** Plays when Himani's card reads this many days. Her birthday = day 16. */
const SHOW_ON_DAY = 16;

/**
 * TESTING SWITCH.
 *
 *   true  → plays every time the site loads, whatever the countdown says.
 *   false → only plays on SHOW_ON_DAY, and only auto-opens once per device.
 *
 * ⚠️  SET THIS TO false BEFORE HER BIRTHDAY, or it will play on every
 *     single visit forever instead of being a surprise on the day.
 */
const FORCE_SHOW = false;

/** How old she's turning. Shown as the big numeral candles on the cake. */
const AGE = "18";

const HER_NAME = "MANI";

/** Little line under the title while the cake is being lit. */
const WISH_PROMPT = "tap the candles to blow them out";

const LETTER_BUTTON = "open your letter ♥";

const LETTER_TITLE = "HAPPY MANI DAYY !!";

const LETTER_BODY =
  "its finallylylyy your birthdayy the best day of the entire year :) i love you so much i so grateful for you and am just as grateful for this day cause its the day mani came into this world and made it 10000000x better. your truly the most beautiful, kind, gentle, and amazing most perfectest person there ever will be, and i love you sooo much and i so lucky u get to be mine . remember to open u letter todayyyy :)  i hope you have the amazingeststtt birthday ever baby i love youuu";

const LETTER_SIGNOFF = "— samvit 🦒";

/** Button that stays on the page after the animation, so she can replay it. */
const REPLAY_LABEL = "play it again ♥";

/** Plays the Happy Birthday melody when she blows the candles out. */
const PLAY_MUSIC = true;

/* ================================================================== */

const SEEN_KEY = `himani-birthday-${SHOW_ON_DAY}`;

type Stage = "curtain" | "cake" | "blown" | "letter" | "reading";

/* Deterministic pseudo-random so the server and the browser agree.
   Math.random() during render would break hydration. */
function rand(seed: number, salt = 1): number {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/* ------------------------------------------------------------------ */

const BALLOON_COLORS: readonly (readonly [string, string])[] = [
  ["oklch(0.82 0.14 5)", "oklch(0.68 0.17 5)"],
  ["oklch(0.86 0.12 350)", "oklch(0.72 0.15 350)"],
  ["oklch(0.88 0.11 30)", "oklch(0.76 0.14 30)"],
  ["oklch(0.84 0.10 320)", "oklch(0.70 0.13 320)"],
  ["oklch(0.90 0.09 60)", "oklch(0.80 0.12 55)"],
  ["oklch(0.83 0.10 285)", "oklch(0.70 0.13 285)"],
];

function Balloons({ count = 16 }: { count?: number }) {
  return (
    <div className="bd-balloons" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const [light, dark] = BALLOON_COLORS[i % BALLOON_COLORS.length] ?? [
          "oklch(0.82 0.14 5)",
          "oklch(0.68 0.17 5)",
        ];
        return (
          <span
            key={i}
            className="bd-balloon"
            style={
              {
                left: `${4 + rand(i, 1) * 92}%`,
                "--bd-b-light": light,
                "--bd-b-dark": dark,
                "--bd-b-scale": 0.7 + rand(i, 2) * 0.7,
                "--bd-b-sway": `${(rand(i, 3) - 0.5) * 70}px`,
                animationDelay: `${rand(i, 4) * 7}s`,
                animationDuration: `${9 + rand(i, 5) * 7}s`,
              } as React.CSSProperties
            }
          >
            <span className="bd-balloon-body" />
            <span className="bd-balloon-knot" />
            <span className="bd-balloon-string" />
          </span>
        );
      })}
    </div>
  );
}

const CONFETTI_COLORS = [
  "oklch(0.72 0.17 5)",
  "oklch(0.86 0.13 350)",
  "oklch(0.88 0.13 60)",
  "oklch(0.80 0.14 320)",
  "oklch(0.82 0.13 30)",
  "oklch(0.92 0.08 95)",
];

function BigConfetti({ count = 110 }: { count?: number }) {
  return (
    <div className="bd-confetti" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const shape = i % 3;
        return (
          <span
            key={i}
            className={`bd-confetto bd-confetto-${shape}`}
            style={
              {
                left: `${rand(i, 11) * 100}%`,
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                "--bd-c-drift": `${(rand(i, 12) - 0.5) * 320}px`,
                "--bd-c-spin": `${720 + rand(i, 13) * 1440}deg`,
                width: `${6 + rand(i, 14) * 8}px`,
                height: `${8 + rand(i, 15) * 12}px`,
                animationDelay: `${rand(i, 16) * 2.6}s`,
                animationDuration: `${3.2 + rand(i, 17) * 3.4}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

function Sparkles({ count = 26 }: { count?: number }) {
  return (
    <div className="bd-sparkles" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="bd-sparkle"
          style={{
            left: `${rand(i, 21) * 100}%`,
            top: `${rand(i, 22) * 100}%`,
            fontSize: `${0.6 + rand(i, 23) * 1.1}rem`,
            animationDelay: `${rand(i, 24) * 3}s`,
            animationDuration: `${1.8 + rand(i, 25) * 2.2}s`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

/* Happy Birthday in C, properly in 3/4 with its pickup beat.
   [frequency, beats] — a beat is a quarter note. */
const MELODY: readonly (readonly [number, number])[] = [
  [392.0, 0.5], [392.0, 0.5],
  [440.0, 1], [392.0, 1], [523.25, 1],
  [493.88, 2], [392.0, 0.5], [392.0, 0.5],
  [440.0, 1], [392.0, 1], [587.33, 1],
  [523.25, 2], [392.0, 0.5], [392.0, 0.5],
  [783.99, 1], [659.25, 1], [523.25, 1],
  [493.88, 1], [440.0, 1], [698.46, 0.5], [698.46, 0.5],
  [659.25, 1], [523.25, 1], [587.33, 1],
  [523.25, 3],
];

/* One warm chord under each bar: [beat it starts on, its notes]. */
const CHORDS: readonly (readonly [number, readonly number[]])[] = [
  [1, [130.81, 164.81, 196.0]],
  [4, [98.0, 123.47, 174.61]],
  [7, [98.0, 123.47, 174.61]],
  [10, [130.81, 164.81, 196.0]],
  [13, [130.81, 164.81, 196.0]],
  [16, [87.31, 110.0, 130.81]],
  [19, [98.0, 123.47, 174.61]],
  [22, [130.81, 164.81, 196.0]],
];

/** A short noise-burst impulse response, so the notes ring in a room. */
function makeReverb(ctx: AudioContext): ConvolverNode {
  const seconds = 2.6;
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
  }
  const conv = ctx.createConvolver();
  conv.buffer = buf;
  return conv;
}

/** A music-box note: a stack of sine partials with a long bell decay. */
function bell(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  at: number,
  dur: number,
) {
  const partials: readonly (readonly [number, number])[] = [
    [1, 1],
    [2, 0.3],
    [3, 0.11],
    [4.17, 0.055],
    [5.4, 0.025],
  ];

  for (const [mult, amp] of partials) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    // a touch of detune keeps it from sounding machine-made
    osc.frequency.value = freq * mult;
    osc.detune.value = (Math.random() - 0.5) * 6;

    const g = ctx.createGain();
    const ring = dur + 1.5;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(amp * 0.55, at + 0.012);
    g.gain.exponentialRampToValueAtTime(amp * 0.16, at + dur * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, at + ring);

    osc.connect(g);
    g.connect(dest);
    osc.start(at);
    osc.stop(at + ring + 0.05);
  }
}

/** A soft held chord that swells underneath the melody. */
function pad(
  ctx: AudioContext,
  dest: AudioNode,
  freqs: readonly number[],
  at: number,
  dur: number,
) {
  for (const f of freqs) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.075, at + 0.4);
    g.gain.setValueAtTime(0.075, at + dur * 0.55);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);

    osc.connect(g);
    g.connect(dest);
    osc.start(at);
    osc.stop(at + dur + 0.1);
  }
}

function playMelody() {
  if (!PLAY_MUSIC) return;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;

    const ctx = new Ctor();

    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);

    // round off the top end so the sines read as wood, not glass
    const warmth = ctx.createBiquadFilter();
    warmth.type = "lowpass";
    warmth.frequency.value = 4200;
    warmth.Q.value = 0.6;
    warmth.connect(master);

    const dry = ctx.createGain();
    dry.gain.value = 0.82;
    dry.connect(warmth);

    const wet = ctx.createGain();
    wet.gain.value = 0.34;
    const reverb = makeReverb(ctx);
    reverb.connect(warmth);
    wet.connect(reverb);

    const melodyBus = ctx.createGain();
    melodyBus.gain.value = 0.34;
    melodyBus.connect(dry);
    melodyBus.connect(wet);

    const padBus = ctx.createGain();
    padBus.gain.value = 0.5;
    padBus.connect(dry);
    padBus.connect(wet);

    const beat = 0.56;
    const t0 = ctx.currentTime + 0.15;

    let cursor = 0;
    for (const [freq, beats] of MELODY) {
      // a hair of human looseness in the timing
      const swing = (Math.random() - 0.5) * 0.012;
      bell(ctx, melodyBus, freq, t0 + cursor * beat + swing, beats * beat);
      cursor += beats;
    }

    for (const [atBeat, notes] of CHORDS) {
      pad(ctx, padBus, notes, t0 + atBeat * beat, 3 * beat);
    }

    const total = cursor * beat + 3;
    window.setTimeout(
      () => {
        try {
          void ctx.close();
        } catch {
          /* ignore */
        }
      },
      (total + 0.5) * 1000,
    );
  } catch {
    /* audio blocked — the animation still works fine without it */
  }
}

/* ------------------------------------------------------------------ */

function Cake({ blown, onBlow }: { blown: boolean; onBlow: () => void }) {
  return (
    <button
      type="button"
      className={`bd-cake${blown ? " is-blown" : ""}`}
      onClick={onBlow}
      disabled={blown}
      aria-label={blown ? "Candles blown out" : "Blow out the candles"}
    >
      <span className="bd-candle-row" aria-hidden="true">
        {AGE.split("").map((digit, i) => (
          <span key={i} className="bd-numeral">
            <span className="bd-flame-wrap">
              <span className="bd-flame" />
              <span className="bd-smoke" />
            </span>
            <span className="bd-numeral-body">{digit}</span>
          </span>
        ))}
      </span>

      <span className="bd-cake-body" aria-hidden="true">
        <span className="bd-cake-light" />

        <span className="bd-tier bd-tier-top">
          <span className="bd-frosting">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="bd-drip" style={{ left: `${i * 12 + 3}%` }} />
            ))}
          </span>
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className="bd-sprinkle"
              style={{
                left: `${10 + rand(i, 31) * 78}%`,
                top: `${46 + rand(i, 32) * 36}%`,
                transform: `rotate(${rand(i, 33) * 180}deg)`,
              }}
            />
          ))}
        </span>

        <span className="bd-tier bd-tier-bottom">
          <span className="bd-frosting bd-frosting-2">
            {Array.from({ length: 11 }).map((_, i) => (
              <span key={i} className="bd-drip" style={{ left: `${i * 9.5 + 2}%` }} />
            ))}
          </span>
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="bd-sprinkle"
              style={{
                left: `${6 + rand(i, 41) * 86}%`,
                top: `${44 + rand(i, 42) * 40}%`,
                transform: `rotate(${rand(i, 43) * 180}deg)`,
              }}
            />
          ))}
        </span>

        <span className="bd-plate" />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */

function Envelope({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="bd-letter-stage">
      <button
        type="button"
        className="bd-envelope"
        onClick={onOpen}
        aria-label="Open your letter"
      >
        <span className="bd-env-back" aria-hidden="true" />
        <span className="bd-env-paper" aria-hidden="true" />
        <span className="bd-env-front" aria-hidden="true" />
        <span className="bd-env-flap" aria-hidden="true" />
        <span className="bd-env-seal" aria-hidden="true">
          ♥
        </span>
      </button>
      <span className="bd-env-hint">{LETTER_BUTTON}</span>
    </div>
  );
}

function LetterCard({ onClose }: { onClose: () => void }) {
  return (
    <div className="bd-letter" role="dialog" aria-label="A birthday letter">
      <button
        type="button"
        className="post-it-close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <p className="bd-letter-kicker">for you ♥</p>
      <h3 className="bd-letter-title">{LETTER_TITLE}</h3>
      <p className="bd-letter-body">{LETTER_BODY}</p>
      <p className="bd-letter-signoff">{LETTER_SIGNOFF}</p>
      <button type="button" className="bd-letter-done" onClick={onClose}>
        close ♥
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function Birthday({ day }: { day: number }) {
  const active = FORCE_SHOW || day === SHOW_ON_DAY;

  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("curtain");
  const timers = useRef<number[]>([]);
  const autoRan = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setStage("curtain");
    setOpen(true);
    timers.current.push(window.setTimeout(() => setStage("cake"), 2600));
  }, [clearTimers]);

  /* Auto-play: every load while testing, once per device on the real day.
     Opens synchronously and marks "seen" only after it has actually opened —
     an earlier version scheduled the open on a timer and wrote the flag first,
     so if the effect re-ran inside that window the cleanup killed the timer
     and the one showing was silently spent without ever playing. */
  useEffect(() => {
    if (!active || autoRan.current) return;
    autoRan.current = true;

    if (!FORCE_SHOW) {
      try {
        if (window.localStorage.getItem(SEEN_KEY)) return;
      } catch {
        /* private browsing — just play it */
      }
    }

    start();

    if (!FORCE_SHOW) {
      try {
        window.localStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
    }
  }, [active, start]);

  useEffect(() => clearTimers, [clearTimers]);

  /* Lock the page behind the overlay, and let Escape out. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function blow() {
    if (stage !== "cake") return;
    setStage("blown");
    playMelody();
    timers.current.push(window.setTimeout(() => setStage("letter"), 3400));
  }

  function close() {
    clearTimers();
    setOpen(false);
  }

  if (!active) return null;

  const blown = stage === "blown" || stage === "letter" || stage === "reading";
  /* Dark room while the candles are still lit; the lights come up when she blows. */
  const night = !blown;

  return (
    <>
      {!open && (
        <div className="bd-replay-wrap">
          <button type="button" className="bd-replay" onClick={start}>
            {REPLAY_LABEL}
          </button>
        </div>
      )}

      {open && (
        <div
          className={`bd-overlay${night ? " is-night" : " is-day"}`}
          role="dialog"
          aria-label="Birthday surprise"
        >
          <div className="bd-sky bd-sky-night" aria-hidden="true" />
          <div className="bd-sky bd-sky-day" aria-hidden="true" />
          <div className="bd-glow" aria-hidden="true" />
          <Balloons />
          <Sparkles />
          {blown && <BigConfetti />}

          <button
            type="button"
            className="bd-skip"
            onClick={close}
            aria-label="Close birthday animation"
          >
            skip ×
          </button>

          <div className="bd-stage">
            {stage === "curtain" && (
              <div className="bd-curtain">
                <h2 className="bd-curtain-title">
                  guess whose
                  <br />
                  birthday it is
                </h2>
                <span className="bd-curtain-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            )}

            {stage === "reading" && <LetterCard onClose={close} />}

            {stage !== "curtain" && stage !== "reading" && (
              <div className={`bd-main${stage === "letter" ? " has-letter" : ""}`}>
                <h2 className="bd-headline">
                  {blown ? (
                    <>
                      <span className="bd-headline-small">happy birthday</span>
                      <span className="bd-headline-name">{HER_NAME}</span>
                    </>
                  ) : (
                    <span className="bd-headline-small">make a wish baby</span>
                  )}
                </h2>

                <Cake blown={blown} onBlow={blow} />

                {!blown && <p className="bd-prompt">{WISH_PROMPT}</p>}

                {stage === "letter" && (
                  <Envelope onOpen={() => setStage("reading")} />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
