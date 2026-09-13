import { useEffect, useState, type CSSProperties } from "react";
import { Confetti } from "@/components/Confetti";

/* ------------------------------------------------------------------ *
 * ✏️  EDIT ME — the pairs, the button, and what she sees when she wins.
 * ------------------------------------------------------------------ */
const EMOJIS = ["🦒", "❤️", "🦛", "🍀", "😡", "💋", "😈", "☹️"];

const BUTTON_LABEL = "play a silly game ♥";
const HEADING = "match the pairs";
const WIN_TITLE = "you found them all ♥";
const WIN_NOTE = "good job baby";
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
  const [open, setOpen] = useState(false);
  // Built on open, never during render: Math.random() on the server would
  // disagree with the browser and break hydration.
  const [deck, setDeck] = useState<Card[] | null>(null);
  const [round, setRound] = useState(0);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
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

  // Escape closes, and the page behind shouldn't scroll while we're open.
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

  function newGame() {
    setDeck(buildDeck());
    setRound((r) => r + 1);
    setFlipped([]);
    setMatched([]);
    setWrong(false);
    setLock(false);
    setMoves(0);
  }

  function launch() {
    newGame();
    setOpen(true);
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
    <div className="mm-launch-wrap">
      <button type="button" className="mm-button mm-launch" onClick={launch}>
        {BUTTON_LABEL}
      </button>

      {open && (
        <>
          {won && <Confetti />}
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/15 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              className="mm-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Emoji memory game"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close game"
                className="post-it-close"
              >
                ×
              </button>

              <h2 className="mm-title">{HEADING}</h2>

              <div className="mm-meta">
                <span>{moves} moves</span>
                {best !== null && <span>best {best}</span>}
              </div>

              <div className="mm-grid" role="group" aria-label="Cards">
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
                  <p className="mm-win-note">{WIN_NOTE}</p>
                  <button type="button" className="mm-button" onClick={newGame}>
                    play again ♥
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="mm-button mm-button-quiet"
                  onClick={newGame}
                >
                  shuffle
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
