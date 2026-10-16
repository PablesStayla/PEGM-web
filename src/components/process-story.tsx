"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { Headline, StoryDict } from "@/lib/i18n/es";

function HeadlineBlock({ headline }: { headline: Headline }) {
  return (
    <>
      {headline.lines.map((line) => (
        <Fragment key={line}>
          {line}
          <br />
        </Fragment>
      ))}
      <em>{headline.accent}</em>
    </>
  );
}

export function ProcessStory({ story }: { story: StoryDict }) {
  const chapters = story.chapters;
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const elements = ref.current?.querySelectorAll<HTMLElement>("[data-chapter]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting)
            setActive(Number((entry.target as HTMLElement).dataset.chapter));
        }
      },
      { rootMargin: "-30% 0px -40% 0px", threshold: 0 },
    );
    elements?.forEach((element) => {
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  const chapter = chapters[active];

  return (
    <section id="especialidades" className="process-story" ref={ref} aria-label={story.ariaSection}>
      <div className="portfolio-container story-grid">
        <div className="story-sticky">
          <p className="eyebrow">{story.eyebrow}</p>
          <h2>
            <HeadlineBlock headline={story.heading} />
          </h2>
          <div className="story-instrument" data-active={active} aria-hidden="true">
            <div className="instrument-header">
              <span>{story.instrumentLabel}</span>
              <span>0{active + 1} — 04</span>
            </div>
            <div className="instrument-drawing">
              <svg viewBox="0 0 400 280" fill="none">
                <title>{story.svgTitle}</title>
                <defs>
                  <linearGradient id="flow-color">
                    <stop stopColor="#e8a168" />
                    <stop offset="1" stopColor="#83b8bd" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <path
                    key={i}
                    className="flow-line"
                    d={`M 0 ${52 + i * 28} C 100 ${20 + i * 22}, 110 ${260 - i * 30}, 205 140 S 290 ${20 + i * 34}, 400 ${45 + i * 28}`}
                    stroke="url(#flow-color)"
                    strokeWidth="1.2"
                  />
                ))}
                <circle cx="200" cy="140" r="85" stroke="currentColor" strokeDasharray="2 7" />
                <circle cx="200" cy="140" r="60" stroke="currentColor" />
                <path d="M200 32V60M200 220V248M92 140H120M280 140H308" stroke="currentColor" />
              </svg>
              <span className="instrument-symbol" key={chapter.symbol}>
                {chapter.symbol}
              </span>
            </div>
            <div className="instrument-reading">
              <strong>{chapter.metric}</strong>
              <span>{chapter.unit}</span>
            </div>
            <div className="instrument-footer">
              <span>{chapter.detail}</span>
              <span>↗</span>
            </div>
          </div>
          <nav className="chapter-nav" aria-label={story.ariaNav}>
            {chapters.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={i === active ? "step" : undefined}
              >
                <span>0{i + 1}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="story-chapters">
          {chapters.map((item, i) => (
            <article
              id={item.id}
              data-chapter={i}
              key={item.id}
              className={`story-chapter ${active === i ? "chapter-active" : ""}`}
            >
              <span className="chapter-number">
                0{i + 1} / {item.label}
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <p className="chapter-tools">{item.tools}</p>
              <span className="chapter-caption">
                {item.caption} <span aria-hidden="true">↗</span>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
