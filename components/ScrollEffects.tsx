"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { registerAuto, revealAll } from "@/components/Reveal";

/**
 * Site-wide scroll animation.
 *
 * Hand-placed <Reveal> wrappers cover the hero and the headline sections. This
 * covers everything else — grids, cards, FAQ items, forms, article paragraphs,
 * the footer — without wrapping hundreds of elements by hand: after each page
 * renders, it tags the content blocks that start *below the fold* and lets the
 * shared reveal sweep animate them in as the visitor reaches them.
 *
 * Only below-the-fold blocks are touched, so nothing the visitor can already
 * see ever blinks out and back in. Elements already inside (or containing) a
 * <Reveal> are skipped so nothing animates twice. Once an element's entrance
 * has played its reveal attributes are removed again, handing hover effects
 * and transitions back to the element's own styles.
 *
 * Opt a subtree out with `data-no-reveal`; opt a container's children in with
 * `data-reveal-children` (used for rendered article bodies).
 */
const SELECTOR = [
  "main section h2",
  "main section .lede",
  "main .grid > *",
  "main section ul > li",
  "main section ol > li",
  "main details",
  "main form",
  "main table",
  "main blockquote",
  "main figure",
  "main .card",
  "main [data-reveal-children] > *",
  "footer .grid > *",
].join(",");

/** Items in the same row enter left to right, this far apart. */
const ROW_STAGGER_MS = 90;
const MAX_STAGGER_STEPS = 4;

export default function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    // `js-anim` is absent when the visitor prefers reduced motion (or the
    // inline script never ran); in either case leave the page alone.
    if (!root.classList.contains("js-anim")) return;

    const tagged: HTMLElement[] = [];
    const unregister: (() => void)[] = [];

    // Wait a frame so layout reflects the freshly rendered route.
    const frame = window.requestAnimationFrame(() => {
      try {
        const fold = window.innerHeight;
        const width = Math.max(window.innerWidth, 1);

        for (const el of Array.from(document.querySelectorAll(SELECTOR))) {
          if (!(el instanceof HTMLElement)) continue;
          // Already animated by <Reveal>, or by an ancestor tagged just now.
          if (el.closest("[data-reveal], [data-no-reveal]")) continue;
          if (el.querySelector("[data-reveal]")) continue;
          // Elements with their own keyframe animation keep it.
          if (/(^|\s)animate-/.test(el.className)) continue;

          const rect = el.getBoundingClientRect();
          if (rect.height === 0 || rect.width === 0) continue;
          // Already on screen (or above it): never hide what can be seen.
          if (rect.top < fold) continue;

          const step = Math.min(Math.floor((rect.left / width) * 4), MAX_STAGGER_STEPS);
          el.dataset.reveal = "out";
          el.dataset.revealAuto = "";
          tagged.push(el);
          unregister.push(registerAuto(el, Math.max(step, 0) * ROW_STAGGER_MS));
        }
      } catch {
        // Any failure: show everything rather than risk hidden content.
        for (const el of tagged) el.dataset.reveal = "in";
        revealAll();
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      for (const off of unregister) off();
      // Anything still waiting when the route changes must not stay hidden.
      for (const el of tagged) {
        if (el.isConnected && el.dataset.reveal === "out") el.dataset.reveal = "in";
      }
    };
  }, [pathname]);

  return null;
}
