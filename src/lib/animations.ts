/**
 * Animation Configurations
 *
 * Centralized animation definitions used by all Petal modules.
 * Returns animation configs with 'from' and 'to' states for GSAP.
 */

import { gsap } from "gsap";
import { ATTR_PETAL_ANIM, ATTR_PETAL_ANIM_DELAY, ATTR_PETAL_ANIM_DURATION, ATTR_PETAL_ANIM_EASE, ATTR_PETAL_ANIM_OFFSET } from "./attributes";
import { BREAKPOINT_SUFFIXES, getCurrentSettingValue, parseSetting, PetalSetting } from "./setting";
import { isAllNullish, parseNumber, parseString } from "./helpers";

export type AnimationType =
  | "scale"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "crop-up"
  | "crop-down"
  | "fade";

const validTypes: AnimationType[] = [
  "scale",
  "slide-up",
  "slide-down",
  "slide-left",
  "slide-right",
  "crop-up",
  "crop-down",
  "fade",
];
export type ANIM_OPTIONS = "open" | "close";

const DEFAULT_POS_OFFSET = "100%";
const DEFAULT_OPACITY_OFFSET = "1";

export interface AnimationOptions {
  animation?: AnimationType | null;
  delay?: number;
  duration?: number | string;
  offset?: number | string;
  ease?: string;
}

export function getAnimationConfig(el: Element, animType: ANIM_OPTIONS = "open"): PetalSetting<AnimationOptions> {
  function getAnimationConfigOnBreakpoint(el: Element, animType: string, breakpoint?: BREAKPOINT_SUFFIXES) {
    return {
      animation: parseSetting(el, `${ATTR_PETAL_ANIM}`, parseAnimation, breakpoint, animType),
      offset: parseSetting(el, `${ATTR_PETAL_ANIM_OFFSET}`, parseString, breakpoint, animType),
      delay: parseSetting(el, `${ATTR_PETAL_ANIM_DELAY}`, parseNumber, breakpoint, animType),
      duration: parseSetting(el, `${ATTR_PETAL_ANIM_DURATION}-${animType}`, parseNumber, breakpoint),
      ease: parseSetting(el, `${ATTR_PETAL_ANIM_EASE}-${animType}`, parseString, breakpoint),
    };
  }

  // Build raw config with all breakpoints
  const config = {
    desktop: getAnimationConfigOnBreakpoint(el, animType),
    tablet: getAnimationConfigOnBreakpoint(el, animType, "tablet"),
    mobileLandscape: getAnimationConfigOnBreakpoint(el, animType, "mobile-landscape"),
    mobile: getAnimationConfigOnBreakpoint(el, animType, "mobile"),
  };

  return config;
}

/**
 * Validates and parses modal animation string
 */
export function isValidAnimation(value: string | null): value is AnimationType {
  return validTypes.includes(value as AnimationType);
}

export function parseAnimation(raw: string | null): AnimationType | null {
  if (raw === null) return null;
  return validTypes.includes(raw as AnimationType) ? (raw as AnimationType) : null;
}

/**
 * Reverses an animation by swapping from/to while preserving ease and duration in 'to'
 *
 * Example:
 *   Input:  { from: { x: 100, opacity: 0 }, to: { x: 0, opacity: 1, ease: "power1.out", duration: 0.5 } }
 *   Output: { from: { x: 0, opacity: 1 }, to: { x: 100, opacity: 0, ease: "power1.out", duration: 0.5 } }
 *
 * @param anim The animation config to reverse
 * @returns A new animation config with from/to swapped
 */
export function reverseAnimation(anim: { from: Record<string, any>; to: Record<string, any> }) {
  const { ease, duration, ...toPropsWithoutEasing } = anim.to;

  return {
    from: toPropsWithoutEasing,
    to: { ...anim.from, ease, duration },
  };
}

/**
 * Unified animation system with configurable offsets, easing, and duration
 * - For modals: use "100%" offset for full viewport movements
 * - For dropdowns: use small pixel offsets (e.g., 25) for subtle movements
 * - Easing: GSAP easing function (default: "power1.inOut")
 * - Duration: Animation duration in seconds (default: 0.5)
 *
 * Use reverseAnimation() to create closing animations from opening animations
 */
export const animations = {
  scale: (options?: AnimationOptions) => {
    const { ease = "power1.inOut", duration = 0.5 } = options || {};
    return {
      from: { scale: 0, opacity: 0 },
      to: { scale: 1, opacity: 1, ease, duration },
    };
  },

  "slide-up": (options?: AnimationOptions) => {
    const { offset = DEFAULT_POS_OFFSET, ease = "power1.inOut", duration = 0.5 } = options || {};
    return {
      from: { x: 0, y: offset, opacity: 0 },
      to: { x: 0, y: 0, opacity: 1, ease, duration },
    };
  },

  "slide-down": (options?: AnimationOptions) => {
    const { offset = DEFAULT_POS_OFFSET, ease = "power1.inOut", duration = 0.5 } = options || {};
    return {
      from: { x: 0, y: typeof offset === "number" ? -offset : `-${offset}`, opacity: 0 },
      to: { x: 0, y: 0, opacity: 1, ease, duration },
    };
  },

  "slide-left": (options?: AnimationOptions) => {
    const { offset = DEFAULT_POS_OFFSET, ease = "power1.inOut", duration = 0.5 } = options || {};
    return {
      from: { x: offset, y: 0, opacity: 0 },
      to: { x: 0, y: 0, opacity: 1, ease, duration },
    };
  },

  "slide-right": (options?: AnimationOptions) => {
    const { offset = DEFAULT_POS_OFFSET, ease = "power1.inOut", duration = 0.5 } = options || {};
    return {
      from: { x: typeof offset === "number" ? -offset : `-${offset}`, y: 0, opacity: 0 },
      to: { x: 0, y: 0, opacity: 1, ease, duration },
    };
  },

  "crop-up": (options?: AnimationOptions) => {
    const { ease = "power1.inOut", duration = 0.5 } = options || {};
    return {
      from: { clipPath: "inset(100% 0% 0% 0%)" },
      to: { clipPath: "inset(0% 0% 0% 0%)", ease, duration },
    };
  },

  "crop-down": (options?: AnimationOptions) => {
    const { ease = "power1.inOut", duration = 0.5 } = options || {};
    return {
      from: { clipPath: "inset(0% 0% 100% 0%)" },
      to: { clipPath: "inset(0% 0% 0% 0%)", ease, duration },
    };
  },

  fade: (options?: AnimationOptions) => {
    const { offset = DEFAULT_OPACITY_OFFSET, ease = "power1.inOut", duration = 0.5 } = options || {};
    return {
      from: { opacity: 0 },
      to: { opacity: offset, ease, duration },
    };
  },
};

/**
 * Takes an AnimationOption config and gets the current value at the current breakpoint.
 * If the AnimationOption is undefined, falls back to a Default Config.
 * @param animationConfig The Animation Config object
 * @returns The GSAP animation config with 'from' and 'to' states, or a default animation if invalid
 */
export function getAnimation(animationConfig: PetalSetting<AnimationOptions> | undefined, defaultAnimationConfig: AnimationOptions) {
  let anim = getCurrentSettingValue(animationConfig);
  if (!anim || isAllNullish(anim)) {
    anim = defaultAnimationConfig;
  }
  const animationType = anim.animation;
  return animations[animationType as AnimationType](anim);
}

/**
 * Clears all animation-related properties from an element
 * This ensures clean state when switching between different animation types
 *
 * Resets:
 * - Position transforms (x, y)
 * - Scale transforms
 * - Opacity
 * - Clip-path
 * - All transforms
 */
export function clearAnimationProperties(element: Element): void {
  // Use GSAP's clearProps to ensure all inline styles are removed
  gsap.set(element, { clearProps: "x,y,scale,opacity,clipPath,transform" });
}
