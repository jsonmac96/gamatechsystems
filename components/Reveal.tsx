"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Scroll-triggered entrance animation.
 *
 * ## Why this is not an IntersectionObserver
 *
 * The obvious implementation — one IntersectionObserver per element with a
 * fractional threshold — turned out to leave content permanently invisible in
 * testing: depending on how fast the page was scrolled, a measurable share of
 * elements never received an intersecting entry and stayed at `opacity: 0`.
 * For a marketing site that is the worst possible failure, because the page
 * looks blank and nothing in the console says why.
 *
 * So this uses a single shared, rAF-throttled scroll/resize pass over a
 * registry of nodes. It is deterministic — on every frame where the page has
 * moved, each pending node is simply asked "is your top edge above the fold
 * yet?" — and cheap, because one listener serves every element on the page.
 *
 * ## Failing safe
 *
 * Independent guarantees that content is never stuck hidden:
 *   1. The CSS that hides a pending element only applies under `html.js-anim`,
 *      a class set by a tiny inline script. No JavaScript, no hiding.
 *   2. A `<noscript>` rule in the root layout forces everything visible.
 *   3. A safety sweep runs on a timer as well as on scroll, so anything on
 *      screen is revealed within a second even if every scroll event were
 *      lost. Content further down still waits for the visitor to reach it,
 *      which is what makes it animate in rather than already being there.
 *   4. Print styles show everything, and any exception shows everything.
 */

type RevealProps = {
  children: ReactNode;
  /** Direction the element travels in from. */
  variant?: "up" | "left" | "right" | "scale";
  /** Stagger in milliseconds, for revealing a list one item at a time. */
  delay?: number;
  /** Render as a different element — useful for list items and sections. */
  as?: ElementType;
  className?: string;
};

type Pending = { node: HTMLElement; delay: number; auto: boolean };

const pending = new Set<Pending>();
let listening = false;
let frameQueued = false;

/** How far above the viewport bottom an element must reach before revealing. */
const TRIGGER_INSET = 60;
/** How often the safety sweep re-checks pending elements without a scroll. */
const SAFETY_SWEEP_MS = 700;
/** Slightly longer than the reveal transition in globals.css. */
const SETTLE_MS = 900;

function reveal(entry: Pending): void {
  entry.node.dataset.reveal = "in";
  if (!entry.auto) return;
  // Elements tagged automatically are ordinary page content — cards with
  // their own hover lift, form fields and so on. Once the entrance has
  // played, hand them back their own transform and transition entirely.
  window.setTimeout(() => {
    delete entry.node.dataset.reveal;
    delete entry.node.dataset.revealAuto;
  }, SETTLE_MS);
}

function show(entry: Pending): void {
  pending.delete(entry);
  if (entry.delay > 0) {
    window.setTimeout(() => reveal(entry), entry.delay);
  } else {
    reveal(entry);
  }
}

function showAll(): void {
  for (const entry of Array.from(pending)) {
    pending.delete(entry);
    reveal(entry);
  }
}

function sweep(): void {
  frameQueued = false;
  const fold = window.innerHeight - TRIGGER_INSET;

  for (const entry of Array.from(pending)) {
    // A node removed from the document can never intersect again.
    if (!entry.node.isConnected) {
      pending.delete(entry);
      continue;
    }
    const rect = entry.node.getBoundingClientRect();
    // Reveal once the element's top edge has risen above the fold, or when any
    // part of a tall element is on screen.
    if (rect.top <= fold && rect.bottom >= 0) show(entry);
  }
}

function requestSweep(): void {
  if (frameQueued) return;
  frameQueued = true;
  window.requestAnimationFrame(sweep);
}

function startListening(): void {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", requestSweep, { passive: true });
  window.addEventListener("resize", requestSweep, { passive: true });
  // Covers anchor jumps and restored scroll positions.
  window.addEventListener("hashchange", requestSweep);
  // Runs for the page's lifetime: a no-op whenever nothing is pending.
  window.setInterval(() => {
    if (pending.size > 0) requestSweep();
  }, SAFETY_SWEEP_MS);
}

function register(node: HTMLElement, delay: number, auto = false): () => void {
  const entry: Pending = { node, delay, auto };
  pending.add(entry);
  startListening();
  requestSweep();
  return () => pending.delete(entry);
}

/**
 * Animate an element that was not wrapped in <Reveal> — used by
 * <ScrollEffects> to give every page scroll animations without wrapping each
 * block by hand. The caller sets `data-reveal="out"` first.
 */
export function registerAuto(node: HTMLElement, delay: number): () => void {
  try {
    return register(node, delay, true);
  } catch {
    node.dataset.reveal = "in";
    return () => {};
  }
}

/** Reveal everything still pending — the escape hatch for any failure. */
export function revealAll(): void {
  showAll();
}

export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  as,
  className = "",
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    try {
      const reduceMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        node.dataset.reveal = "in";
        return;
      }

      return register(node, delay);
    } catch {
      // Any failure at all: show the content rather than hide it.
      node.dataset.reveal = "in";
      showAll();
      return;
    }
  }, [delay]);

  return (
    <Tag
      ref={ref}
      data-reveal="out"
      data-reveal-variant={variant === "up" ? undefined : variant}
      className={className}
    >
      {children}
    </Tag>
  );
}
