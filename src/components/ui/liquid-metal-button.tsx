"use client";

import type { ShaderMount } from "@paper-design/shaders";
import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import styles from "./liquid-metal-button.module.css";

type LiquidMetalLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  glintDelay?: number;
};

// The whole card remains a native link; the metal and ripple are decorative.
export function LiquidMetalLink({ href, className, children, glintDelay = 0 }: LiquidMetalLinkProps) {
  const surface = useRef<HTMLSpanElement>(null);
  const flash = useRef<HTMLSpanElement>(null);
  const shader = useRef<ShaderMount | null>(null);
  const ripple = useRef<Animation | null>(null);
  const request = useRef(0);
  const unavailable = useRef(false);

  function stopShader() {
    request.current += 1;
    shader.current?.dispose();
    shader.current = null;
  }

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stopMotion = () => {
      stopShader();
      ripple.current?.cancel();
    };
    reducedMotion.addEventListener("change", stopMotion);
    return () => {
      reducedMotion.removeEventListener("change", stopMotion);
      stopMotion();
    };
  }, []);

  async function startShader(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse" || unavailable.current || shader.current || !CSS.supports("mask-composite", "exclude") ||
      !window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;

    const pending = ++request.current;
    try {
      const { ShaderMount, liquidMetalFragmentShader, LiquidMetalShapes, ShaderFitOptions } =
        await import("@paper-design/shaders");
      if (pending !== request.current || !surface.current) return;

      shader.current = new ShaderMount(surface.current, liquidMetalFragmentShader, {
        u_fit: ShaderFitOptions.none,
        u_originX: 0.5,
        u_originY: 0.5,
        u_colorBack: [0.12, 0.05, 0.19, 1],
        u_colorTint: [0.85, 0.74, 1, 1],
        u_repetition: 2.8,
        u_softness: 0.55,
        u_shiftRed: 0.08,
        u_shiftBlue: 0.18,
        u_distortion: 0.14,
        u_contour: 0,
        u_angle: 45,
        u_scale: 1.3,
        u_shape: LiquidMetalShapes.none,
        u_isImage: false,
      }, undefined, 0.65, 28, 1, 180_000);
    } catch {
      // The CSS finish is always present, including when WebGL is unavailable.
      unavailable.current = true;
      surface.current?.replaceChildren();
    }
  }

  function press(event: PointerEvent<HTMLAnchorElement>) {
    const dot = flash.current;
    if (!dot || event.button !== 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    dot.style.left = `${event.clientX - bounds.left}px`;
    dot.style.top = `${event.clientY - bounds.top}px`;
    ripple.current?.cancel();
    ripple.current = dot.animate([
      { opacity: 0.3, transform: "translate(-50%, -50%) scale(0.92)" },
      { opacity: 0, transform: "translate(-50%, -50%) scale(3.5)" },
    ], { duration: 160, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${className ?? ""}`}
      onPointerEnter={startShader} onPointerLeave={stopShader} onPointerCancel={stopShader} onPointerDown={press}>
      <span aria-hidden="true" className={styles.rim}>
        <span className={styles.surface} ref={surface} />
        <span className={styles.glint} style={{ animationDelay: `${glintDelay}ms` }} />
      </span>
      <span aria-hidden="true" className={styles.press}><span className={styles.flash} ref={flash} /></span>
      {children}
    </a>
  );
}
