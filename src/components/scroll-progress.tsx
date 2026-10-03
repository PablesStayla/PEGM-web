"use client";

import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - innerHeight;
        const progress = scrollable > 0 ? scrollY / scrollable : 0;
        barRef.current?.style.setProperty("transform", `scaleX(${progress})`);
      });
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-0.5" aria-hidden>
      <div ref={barRef} className="h-full origin-left scale-x-0 bg-accent will-change-transform" />
    </div>
  );
}
