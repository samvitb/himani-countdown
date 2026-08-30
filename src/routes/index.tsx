import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  localTimeIn,
  moodFor,
  remainingUntil,
  targetInstant,
  type Remaining,
} from "@/lib/countdown";
import { Confetti } from "@/components/Confetti";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "silly countdown — Samvit & Himani" },
      {
        name: "description",
        content:
          "A tiny countdown to September 13, 2026, shown in both Pacific Time and India Standard Time.",
      },
      { property: "og:title", content: "silly countdown — Samvit & Himani" },
      {
        property: "og:description",
        content: "Counting down to September 13, 2026 in California and in India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PT = "America/Los_Angeles";
const IST = "Asia/Kolkata";

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
  zoneLabel,
  timeZone,
  remaining,
  now,
  ready,
  animal,
  featured,
}: {
  name: string;
  place: string;
  zoneLabel: string;
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
        <span>{zoneLabel}</span>
        <span className="tabular-nums">{ready ? localTimeIn(timeZone, now) : ""}</span>
      </footer>

    </article>
  );
}

function PostIt() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open a little note"
        className="post-it-mini"
      >
        <span aria-hidden="true">❤️</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/15 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="post-it-large"
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
            <p>happy 3 months i love you so much ❤️</p>
          </div>
        </div>
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
    () => ({ samvit: targetInstant(PT), himani: targetInstant(IST) }),
    [],
  );

  const tick = now ?? targets.samvit;
  const samvit = remainingUntil(targets.samvit, tick);
  const himani = remainingUntil(targets.himani, tick);
  const nowDate = new Date(tick);
  const celebrate = now !== null && (samvit.done || himani.done);


  return (
    <main className="page-bg min-h-screen px-5 py-14 sm:py-20">
      {celebrate && <Confetti />}
      <div className="mx-auto w-full max-w-3xl">
        <header className="text-center">
          <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            silly countdown
          </h1>
          <div className="mt-6 flex justify-center">
            <span className="heart-beat text-2xl" aria-hidden="true">
              ♥
            </span>
          </div>
        </header>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 sm:items-start">
          <CountdownCard
            name="Samvit"
            place="California"
            zoneLabel="Pacific Time"
            timeZone={PT}
            remaining={samvit}
            now={nowDate}
            ready={now !== null}
            animal="🦒"
          />
          <div className="relative">
            <CountdownCard
              name="Himani"
              place="India"
              zoneLabel="India Standard Time"
              timeZone={IST}
              remaining={himani}
              now={nowDate}
              ready={now !== null}
              animal="🦛"
              featured
            />
            {now !== null && himani.days === 13 && !himani.done && <PostIt />}
          </div>
        </div>

        <p className="mt-12 text-center text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground/70">
          I miss you.
        </p>
      </div>
    </main>
  );
}
