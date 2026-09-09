import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  localTimeIn,
  moodFor,
  remainingUntil,
  targetInstant,
  zoneLabel,
  type Remaining,
} from "@/lib/countdown";
import { Confetti } from "@/components/Confetti";

/* ================================================================== *
 * ✏️  EDIT ME — everything you'd want to change lives in this block.
 * ================================================================== */

/** The day you're counting down to. Format: YYYY-MM-DD */
const COUNTDOWN_DATE = "2026-09-13";

/** Time of day, 24h. Each person hits it at this time in their OWN zone. */
const COUNTDOWN_TIME = "00:00";

const TITLE = "silly countdown";
const FOOTER = "I miss you.";

type Note = { day: number; note: string };

type Person = {
  name: string;
  place: string;
  /** IANA timezone, e.g. "America/Los_Angeles", "Asia/Kolkata", "Europe/London" */
  timeZone: string;
  animal: string;
  featured?: boolean;
  /** Pink heart note that appears when this person's card shows `day` days. */
  notes?: Note[];
};

const PEOPLE: Person[] = [
  {
    name: "Samvit",
    place: "California",
    timeZone: "America/Los_Angeles",
    animal: "🦒",
  },
  {
    name: "Himani",
    place: "India",
    timeZone: "Asia/Kolkata",
    animal: "🦛",
    featured: true,
    notes: [
      { day: 13, note: "happy 3 months i love you so much ❤️" },
      { day: 11, note: "i love you your the most perfect gf ever" },
      { day: 10, note: "https://bit.ly/4h8ef3y" },
      { day: 9, note: "i love you baby i thinking of you 24/7" },
      { day: 8, note: "i love you infinity my sweet girl" },
      { day: 7, note: "i love you more than any words can describe i so excited to see you" },
      { day: 6, note: "i feel sooo grateful and lucky to have you I love you infinity" },
      { day: 5, note: "i love and miss you ✋...............♾️.....................✋ thiss much" },
      { day: 4, note: "i love you endlessly no matter what 🦛💋 i hope you feel infinityy times better baby" },
      { day: 3, note: "we sososo closee I love you more than anything im so excited to see you" },
    ],
  },
];

/* ================================================================== */

export const Route = createFileRoute("/")({
  head: () => {
    const names = PEOPLE.map((p) => p.name).join(" & ");
    const pretty = new Date(`${COUNTDOWN_DATE}T00:00:00Z`).toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const title = `${TITLE} — ${names}`;
    const description = `A tiny countdown to ${pretty}, shown in each of our timezones.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Index,
});

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Unit({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-2xl tabular-nums text-foreground sm:text-3xl">
        {value === null ? "––" : pad(value)}
      </span>
      <span className="mt-1 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function CountdownCard({
  name,
  place,
  timeZone,
  remaining,
  now,
  ready,
  animal,
  featured,
}: {
  name: string;
  place: string;
  timeZone: string;
  remaining: Remaining;
  now: Date;
  ready: boolean;
  animal: string;
  featured?: boolean;
}) {
  return (
    <article className={featured ? "card-featured" : "card-soft"}>
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-foreground sm:text-2xl">
            {name} <span aria-hidden="true">{animal}</span>
          </h2>
          <p className="text-sm text-muted-foreground">{place}</p>
        </div>
        <span className="text-2xl" aria-hidden="true">
          {ready ? moodFor(remaining) : ""}
        </span>
      </header>

      {ready && remaining.done ? (
        <p className="my-8 text-center font-display text-3xl text-primary sm:text-4xl">
          YOU'RE BACK ❤️
        </p>
      ) : (
        <>
          <div className="mt-6 text-center">
            <div className="font-display text-6xl leading-none tabular-nums text-primary sm:text-7xl">
              {ready ? remaining.days : "–"}
            </div>
            <div className="mt-2 text-xs uppercase tracking-[0.32em] text-primary/70">days</div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-secondary/60 px-3 py-4">
            <Unit value={ready ? remaining.hours : null} label="hours" />
            <Unit value={ready ? remaining.minutes : null} label="minutes" />
            <Unit value={ready ? remaining.seconds : null} label="seconds" />
          </div>
        </>
      )}

      <footer className="mt-5 flex items-center justify-between text-[0.7rem] text-muted-foreground">
        <span>{ready ? zoneLabel(timeZone, now) : ""}</span>
        <span className="tabular-nums">{ready ? localTimeIn(timeZone, now) : ""}</span>
      </footer>
    </article>
  );
}

function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: 0.8 + Math.random() * 1.4,
        delay: Math.random() * 2.5,
        duration: 2 + Math.random() * 2,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="floating-heart"
          style={{
            left: h.left,
            fontSize: `${h.size}rem`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

function PostIt({ note }: { note: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open a little note"
        title="Tap me!"
        className="post-it-mini"
      >
        <span aria-hidden="true" className="text-base leading-none">
          ♥
        </span>
        <span className="post-it-tap">tap</span>
      </button>

      {open && (
        <>
          <FloatingHearts />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/15 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              className="post-it-large z-[70]"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="A little note"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close note"
                className="post-it-close"
              >
                ×
              </button>
              <p>{note}</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Index() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const targets = useMemo(
    () => PEOPLE.map((p) => targetInstant(p.timeZone, COUNTDOWN_DATE, COUNTDOWN_TIME)),
    [],
  );

  const tick = now ?? targets[0];
  const nowDate = new Date(tick);
  const ready = now !== null;

  const cards = PEOPLE.map((person, i) => {
    const remaining = remainingUntil(targets[i], tick);
    const note =
      ready && !remaining.done
        ? person.notes?.find((n) => n.day === remaining.days)?.note
        : undefined;
    return { person, remaining, note };
  });

  const celebrate = ready && cards.some((c) => c.remaining.done);

  return (
    <main className="page-bg min-h-screen px-5 py-14 sm:py-20">
      {celebrate && <Confetti />}
      <div className="mx-auto w-full max-w-3xl">
        <header className="text-center">
          <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            {TITLE}
          </h1>
          <div className="mt-6 flex justify-center">
            <span className="heart-beat text-2xl" aria-hidden="true">
              ♥
            </span>
          </div>
        </header>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 sm:items-start">
          {cards.map(({ person, remaining, note }) => (
            <div key={person.name} className="relative">
              <CountdownCard
                name={person.name}
                place={person.place}
                timeZone={person.timeZone}
                remaining={remaining}
                now={nowDate}
                ready={ready}
                animal={person.animal}
                featured={person.featured}
              />
              {note && <PostIt note={note} />}
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground/70">
          {FOOTER}
        </p>
      </div>
    </main>
  );
}
