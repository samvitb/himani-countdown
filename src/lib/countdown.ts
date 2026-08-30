/**
 * Timezone-aware countdown helpers.
 *
 * The target is the *start* of September 13, 2026 in a given IANA timezone.
 * We resolve that wall-clock time to a real UTC instant by measuring the
 * zone's UTC offset (which handles DST automatically) and correcting for it.
 */

const TARGET = { year: 2026, month: 9, day: 13, hour: 0, minute: 0, second: 0 };

function offsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return asUTC - date.getTime();
}

/** UTC timestamp (ms) of midnight Sept 13, 2026 in the given timezone. */
export function targetInstant(timeZone: string): number {
  const naive = Date.UTC(
    TARGET.year,
    TARGET.month - 1,
    TARGET.day,
    TARGET.hour,
    TARGET.minute,
    TARGET.second,
  );
  // Two passes so a DST boundary near the target resolves correctly.
  let guess = naive - offsetMs(timeZone, new Date(naive));
  guess = naive - offsetMs(timeZone, new Date(guess));
  return guess;
}

export type Remaining = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

export function remainingUntil(target: number, now: number): Remaining {
  const total = Math.max(0, target - now);
  const totalSeconds = Math.floor(total / 1000);
  return {
    total,
    // Counts the day in progress, so "23d 23h left" reads as 24 days to go.
    days: Math.ceil(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: total <= 0,
  };
}


export function moodFor(r: Remaining): string {
  if (r.done) return "❤️";
  if (r.days >= 20) return "😠";
  if (r.days >= 10) return "🙂";
  return "😁";
}

export function localTimeIn(timeZone: string, now: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(now);
}
