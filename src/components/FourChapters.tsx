import { useEffect, useRef, useState, type TouchEvent } from "react";

/* ================================================================== *
 * ✏️  EDIT ME — the whole letter lives in this block.
 * ================================================================== */

/** Shows up when Himani's card reads this many days. */
const SHOW_ON_DAY = 37;

/** Opens by itself the first time she loads the page that day. */
const AUTO_OPEN = true;

const BUTTON_LABEL = "open your four months ♥";

type Page = {
  kicker?: string;
  title?: string;
  body?: string;
  line?: string;
  signoff?: string;
  cover?: boolean;
};

const PAGES: Page[] = [
  {
    cover: true,
    kicker: "for himani · from samvit",
    title: "four months",
    line: "tap to turn the page →",
  },
  {
    kicker: "september 30, 2026",
    body: "hi baby happy 4 months !!! i know it not too significant of anniversary but it means alot to me and you so far from me but I still wanted to do something for this day because every day with you is so so special to me. I love you infinity mwwah",
  },
  {
    title: "June 2026",
    body: "we start dating this monthh it our firstt month really together!! i think that this month was my favorite month of my life so far, because i getted to see you basically every single day and it was sooo amazing i really miss it :( my favoritee day was when you comed my house and we made yummy pizza together i miss it so much :( this also the month I sick and you comed to me and got me yummy soup and tea and this meant so much to me and maked me so happy. you always make me so happy and I love you so much, even with sad ricco news you made this month the best ever just because i got to spend so much time with you :) every single second with you no matter what were doing is a second spent well and I so excited for the day I get to spend every second with you again. I love you.",
  },
  {
    title: "July 2026",
    body: "this alsoo one of my favoritest months ever of my life but maybe a bit less cause u left me near the end :( my favorite memories here was when i got to see you and watch fireworks with you on the fourth of julyyy ! i was so sad about this day at first because i knew you were working and i really wanted to spend it with you, and then you telled me we could hangout after your work and i got soooo happy and excited there nobody in the world i would rather spend this day with :) i always got so happy and excited whenever you wanted to see me after work because i missed you so much while you busy and just wanted to be with you and kees you mwwawaahh. i love you baby and if i never said it i so proud of you for all those shifts you worked, i know how hard you work id never be able to do that and i really angry that u spend your money on me 😡 this need to stop 😡😡😡 your the strongest woman i know and i admire you so much and i hope to be half the person you are someday. i love yoouuuu :)",
  },
  {
    title: "August 2026",
    body: "our first month apart :( it was really hard but somehow even from 8580 miles away, you managed to make every single day so much better for me . i missed you soo much more than i could ever describe and it was so hard for me being apart from you because you truly my everything. i was so so so scared before you left because i truly not know how i live without you :( time would pass soooo slow while you sleep each day felt like an eternity and I just looked forward to seeing this countdown go down every night hehe :) i so proud of us for making it, and the time apart from you just showed me how much i love you and need you in my life every single day, I love youu",
  },
  {
    title: "September 2026",
    body: "this was one of more difficult months and I so sorry for that baby :( i know we fighted alot but please please just bear with me baby, i know i can be difficult and cranky and you don't like me as much now cause I being like this but its just cause i miss you so much so please bear with me :( even if it was difficult, i am so so so proud of us for making it and it normal for couple to fight at this point for bit, but it gonna get soooo much better now that we made it through this patch and it was just cause i missed you so much and it's really difficult being away from you. the fact we made it through this time make me so hopeful and excited for our future togetherr !! i know you the one i wanna spend the rest of my life with and nothing is putting us apart ever. please always remember how much I love you, I love you infinity and nothing could ever change that. i love you more and more and more every single day. no fights till 2028 atleast now 😡😡 I love you baby and thank you so much for everything you are to me you truly mean the world to me you my everything mwwwwwaah. I so excited to see you whenever you come home to me next :( and i know you having a super amazing time at college but just please don't forget about me and come home to me soon i really miss you :(",
  },
  {
    kicker: "one last thing",
    body: "happy 4 months again baby mwah mwah. i gonna take chance to celebrate every anniversary even if it as tiny as doing something like this. i know 4 months is gonna mean nothing in the long run because we gonna spend the next 100 years together anyway, but I love you so much and i need you to know that. you are my entire universe and id always always do anything for you. i love you baby thank you for being the best girlfriend in the whole wide universe :)",
    signoff: "— samvit 🦒",
  },
];

/* ================================================================== */

const SEEN_KEY = `himani-chapters-${SHOW_ON_DAY}`;

export function FourChapters({ day }: { day: number }) {
  const visible = day === SHOW_ON_DAY;

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const touchX = useRef<number | null>(null);

  // Opens itself on her first visit of the day, then behaves like a button.
  useEffect(() => {
    if (!visible || !AUTO_OPEN) return;
    try {
      if (window.localStorage.getItem(SEEN_KEY)) return;
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private browsing — just skip the auto-open */
    }
    setOpen(true);
  }, [visible]);

  function go(to: number, how: "next" | "prev") {
    if (to < 0 || to >= PAGES.length) return;
    setDir(how);
    setIndex(to);
  }

  const next = () => go(index + 1, "next");
  const prev = () => go(index - 1, "prev");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, index]);

  function launch() {
    setIndex(0);
    setDir("next");
    setOpen(true);
  }

  function onTouchStart(e: TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: TouchEvent) {
    if (touchX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (delta < -45) next();
    if (delta > 45) prev();
  }

  if (!visible) return null;

  const page = PAGES[index];
  const last = index === PAGES.length - 1;

  return (
    <div className="fc-banner-wrap">
      <button type="button" className="fc-banner" onClick={launch}>
        <span aria-hidden="true">💌</span>
        {BUTTON_LABEL}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="fc-book"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="dialog"
            aria-label="Four months"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="post-it-close"
            >
              ×
            </button>

            <div
              key={index}
              className={`fc-page${dir === "next" ? " from-right" : " from-left"}${
                page.cover ? " is-cover" : ""
              }`}
            >
              {page.kicker && <p className="fc-kicker">{page.kicker}</p>}
              {page.title && <h2 className="fc-title">{page.title}</h2>}
              {page.body && <p className="fc-body">{page.body}</p>}
              {page.line && <p className="fc-line">{page.line}</p>}
              {page.signoff && <p className="fc-signoff">{page.signoff}</p>}
            </div>

            <div className="fc-dots" role="group" aria-label="Pages">
              {PAGES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Page ${i + 1}`}
                  className={`fc-dot${i === index ? " is-on" : ""}`}
                  onClick={() => go(i, i > index ? "next" : "prev")}
                />
              ))}
            </div>

            <div className="fc-nav">
              <button
                type="button"
                className="fc-nav-btn"
                onClick={prev}
                disabled={index === 0}
              >
                ← back
              </button>
              <span className="fc-count">
                {index + 1} / {PAGES.length}
              </span>
              {last ? (
                <button
                  type="button"
                  className="fc-nav-btn is-primary"
                  onClick={() => setOpen(false)}
                >
                  close ♥
                </button>
              ) : (
                <button type="button" className="fc-nav-btn is-primary" onClick={next}>
                  next →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
