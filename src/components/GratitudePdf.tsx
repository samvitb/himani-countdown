import { useState } from "react";

export function GratitudePdf({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={title}
        title="Tap me!"
        className="gratitude-mini"
      >
        <span aria-hidden="true" className="text-base leading-none">
          🍀
        </span>
        <span className="post-it-tap">lucky</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/15 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="paper-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={title}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="post-it-close"
            >
              ×
            </button>

            <p className="paper-modal-title">{title}</p>

            <a href={url} target="_blank" rel="noreferrer" className="pdf-open-link">
              read it ♥
            </a>
          </div>
        </div>
      )}
    </>
  );
}
