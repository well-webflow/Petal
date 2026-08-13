/**
 * Animation Utilities
 *
 * Shared GSAP animation utilities for consistent animations across components.
 * Supports fade and slide animations with configurable duration, offset, and easing.
 */
declare const gsap: any;

export type AnimationType = "fade" | "slide-left" | "slide-right" | "slide-up" | "slide-down" | "none";

/**
 * GSAP Easing options
 * See https://gsap.com/docs/v3/Eases/ for all available easings
 */
export type EasingType =
  | "none"
  | "power1.in"
  | "power1.out"
  | "power1.inOut"
  | "power2.in"
  | "power2.out"
  | "power2.inOut"
  | "power3.in"
  | "power3.out"
  | "power3.inOut"
  | "power4.in"
  | "power4.out"
  | "power4.inOut"
  | "back.in"
  | "back.out"
  | "back.inOut"
  | "elastic.in"
  | "elastic.out"
  | "elastic.inOut"
  | "bounce.in"
  | "bounce.out"
  | "bounce.inOut"
  | "circ.in"
  | "circ.out"
  | "circ.inOut"
  | "expo.in"
  | "expo.out"
  | "expo.inOut"
  | "sine.in"
  | "sine.out"
  | "sine.inOut";

// Direction multipliers for each animation type
const ANIM_DIRECTIONS: Record<AnimationType, { x: number; y: number }> = {
  fade: { x: 0, y: 0 },
  "slide-left": { x: 1, y: 0 },
  "slide-right": { x: -1, y: 0 },
  "slide-up": { x: 0, y: 1 },
  "slide-down": { x: 0, y: -1 },
  none: { x: 0, y: 0 },
};

/**
 * Calculate offset based on animation type and offset value
 */
function getOffset(type: AnimationType, offset: number): { x: number; y: number } {
  const dir = ANIM_DIRECTIONS[type] || ANIM_DIRECTIONS.fade;
  return { x: dir.x * offset, y: dir.y * offset };
}

/**
 * Animate element out (hide with animation)
 */
export function animateOut(
  element: HTMLElement,
  type: AnimationType,
  duration: number,
  offset: number,
  easing: EasingType,
  onComplete: () => void
): void {
  if (type === "none") {
    element.style.display = "none";
    onComplete();
    return;
  }

  const { x, y } = getOffset(type, offset);
  gsap.to(element, {
    opacity: 0,
    x,
    y,
    duration,
    ease: easing,
    onComplete: () => {
      element.style.display = "none";
      onComplete();
    },
  });
}

/**
 * Animate element in (show with animation)
 */
export function animateIn(
  element: HTMLElement,
  type: AnimationType,
  duration: number,
  offset: number,
  easing: EasingType
): void {
  element.style.display = "flex";

  if (type === "none") {
    gsap.set(element, { clearProps: "opacity,x,y" });
    return;
  }

  const { x, y } = getOffset(type, offset);
  gsap.fromTo(element, { opacity: 0, x, y }, { opacity: 1, x: 0, y: 0, duration, ease: easing });
}

/**
 * Set active state on an element
 */
export function setActive(el: HTMLElement, active: boolean): void {
  if (active) {
    el.setAttribute("petal-state", "active");
    el.classList.add("is-active");
  } else {
    el.setAttribute("petal-state", "inactive");
    el.classList.remove("is-active");
  }
}
