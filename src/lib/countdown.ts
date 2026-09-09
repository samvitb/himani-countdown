/**
 * Timezone-aware countdown helpers.
 *
 * The target is a wall-clock date/time in a given IANA timezone — so each
 * person counts down to *their own* local midnight, not a shared instant.
 * We resolve that wall-clock time to a real UTC timestamp by measuring the
 * zone's UTC offset (which handles DST automatically) and correcting for it.
 */

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

/**
 * UTC timestamp (ms) of the moment the clock in `timeZone` reads `date` at `time`.
 *
 * @param timeZone IANA zone, e.g. "America/Los_Angeles"
 * @param date     "YYYY-MM-DD"
 * @param time     "HH:MM" or "HH:MM:SS", 24-hour. Defaults to midnight.
 */
export function targetInstant(timeZone: string, date: string, time = "00:00"): number {
  const [year, month, day] = date.split("-").map(Number);
  const [hour = 0, minute = 0, second = 0] = time.split(":").map(Number);

  if (!year || !month || !day) {
    throw new Error(`targetInstant: bad date "${date}" — expected YYYY-MM-DD`);
  }

  const naive = Date.UTC(year, month - 1, day, hour, minute, second);
  // Two passes so a DST boundary near the target resolves correctly.
  let guess = naive - offsetMs(timeZone, new Date(naive));
  guess = naive - offsetMs(timeZone, new Date(guess));
  return guess;
}

/** "Pacific Daylight Time", "India Standard Time", … derived from the zone. */
export function zoneLabel(timeZone: string, now: Date = new Date()): string {
  const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "long" })
    .formatToParts(now)
    .find((p) => p.type === "timeZoneName");
  return part?.value ?? timeZone.replace(/_/g, " ");
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
