"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
}

export function ScrollReveal({ children, className = "", delay = 0, threshold = 0.12 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.setProperty("--stagger-delay", `${delay}ms`);
          el.classList.add("animate-fade-up");
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    el.style.opacity = "0";
    observer.observe(el);

    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
