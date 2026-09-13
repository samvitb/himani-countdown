import { useEffect, useState, type CSSProperties } from "react";
import { Confetti } from "@/components/Confetti";

/* ------------------------------------------------------------------ *
 * ✏️  EDIT ME — the pairs, and what she sees when she wins.
 * ------------------------------------------------------------------ */
const EMOJIS = ["🦒", "❤️", "🦛", "🍀", "😡", "💋", "😈", "☹️"];

const HEADING = "a silly little game";
const WIN_TITLE = "you found them all ♥";
const WIN_NOTE = "i knew you could do it";
/* ------------------------------------------------------------------ */

const BEST_KEY = "himani-memory-best";

type Card = { key: string; emoji: string };

function buildDeck(): Card[] {
  const cards: Card[] = EMOJIS.flatMap((emoji, i) => [
    { key: `${i}a`, emoji },
    { key: `${i}b`, emoji },
  ]);
  // Fisher-Yates, so every play deals a genuinely different board.
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export function MemoryMatch() {
  // Built in an effect, never during render: Math.random() on the server
  // would disagree with the client and break hydration.
  const [deck, setDeck] = useState<Card[] | null>(null);
  const [round, setRound] = useState(0);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    setDeck(buildDeck());
    try {
      const stored = window.localStorage.getItem(BEST_KEY);
      if (stored) setBest(Number(stored));
    } catch {
      /* private browsing — just skip the best score */
    }
  }, []);

  const won = deck !== null && matched.length === deck.length;

  useEffect(() => {
    if (!won) return;
    setBest((prev) => {
      const next = prev === null ? moves : Math.min(prev, moves);
      try {
        window.localStorage.setItem(BEST_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [won, moves]);

  function reset() {
    setDeck(buildDeck());
    setRound((r) => r + 1);
    setFlipped([]);
    setMatched([]);
    setWrong(false);
    setLock(false);
    setMoves(0);
  }

  function handleFlip(card: Card) {
    if (!deck || lock) return;
    if (flipped.includes(card.key) || matched.includes(card.key)) return;

    const next = [...flipped, card.key];
    setFlipped(next);
    if (next.length < 2) return;

    setMoves((m) => m + 1);
    setLock(true);

    const [aKey, bKey] = next;
    const a = deck.find((c) => c.key === aKey);
    const b = deck.find((c) => c.key === bKey);

    if (a && b && a.emoji === b.emoji) {
      window.setTimeout(() => {
        setMatched((m) => [...m, aKey, bKey]);
        setFlipped([]);
        setLock(false);
      }, 420);
    } else {
      setWrong(true);
      window.setTimeout(() => {
        setWrong(false);
        setFlipped([]);
        setLock(false);
      }, 850);
    }
  }

  return (
    <section className="mm-wrap">
      {won && <Confetti />}

      <h2 className="mm-title">{HEADING}</h2>

      <div className="mm-meta">
        <span>{moves} moves</span>
        {best !== null && <span>best {best}</span>}
      </div>

      <div className="mm-grid" role="group" aria-label="Emoji memory game">
        {deck?.map((card, i) => {
          const isMatched = matched.includes(card.key);
          const isUp = isMatched || flipped.includes(card.key);
          const shake = wrong && flipped.includes(card.key);

          return (
            <button
              key={`${round}-${card.key}`}
              type="button"
              className={`mm-cell${shake ? " is-wrong" : ""}`}
              style={{ "--mm-delay": `${i * 35}ms` } as CSSProperties}
              onClick={() => handleFlip(card)}
              aria-label={isUp ? card.emoji : "face down card"}
            >
              <div
                className={`mm-inner${isUp ? " is-up" : ""}${
                  isMatched ? " is-matched" : ""
                }`}
              >
                <span className="mm-face mm-back" aria-hidden="true">
                  ♥
                </span>
                <span className="mm-face mm-front" aria-hidden="true">
                  {card.emoji}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {won ? (
        <div className="mm-win">
          <p className="mm-win-title">{WIN_TITLE}</p>
          <p className="mm-win-note">
            {WIN_NOTE} — {moves} moves
          </p>
          <button type="button" className="mm-button" onClick={reset}>
            play again ♥
          </button>
        </div>
      ) : (
        <button type="button" className="mm-button mm-button-quiet" onClick={reset}>
          shuffle
        </button>
      )}
    </section>
  );
}
