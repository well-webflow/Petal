/**
 * Dropdown Animator Module
 *
 * Handles GSAP animations for dropdown menus including:
 * - Opening/closing animations
 * - Overlay fade transitions
 * - Timeline management
 */

import { gsap } from "gsap";
import { animations, AnimationOptions, clearAnimationProperties, AnimationType, isValidAnimation, getAnimation, reverseAnimation } from "../../lib/animations";
import { ATTR_PETAL_STATE, ARIA_EXPANDED } from "../../lib/attributes";
import { DropdownConfig } from "./dropdown-config";
import { getCurrentSettingValue } from "../../lib/setting";

export interface DropdownElements {
  dropdown: Element;
  toggle: Element;
  menu: Element;
  drawer: Element;
  overlay: Element | null;
}

const DEFAULT_ANIMATION: AnimationOptions = {
  animation: "slide-up",
  delay: 0,
  duration: 0.5,
  offset: 0,
  ease: undefined,
};

/**
 * Animates dropdown opening with GSAP
 */
export function animateOpen(elements: DropdownElements, config: DropdownConfig, index: number): gsap.core.Timeline | null {
  const { dropdown, toggle, menu, drawer, overlay } = elements;

  // Get current breakpoint animation
  const anim = getAnimation(config.animOpen, DEFAULT_ANIMATION);
  console.log("🎨 OPEN animation config:", { from: anim.from, to: anim.to });

  // Create GSAP timeline
  const tl = gsap.timeline();

  // Kill any existing animations on drawer to prevent conflicts
  gsap.killTweensOf(drawer);
  console.log("💀 Killing any existing tweens on drawer");

  // Now make elements visible
  gsap.set(menu, { display: "flex", visibility: "visible" });
  if (overlay) {
    gsap.set(overlay, { display: "flex", visibility: "visible" });
  }

  // Animate the drawer
  console.log("🎬 GSAP animating drawer from", anim.from, "to", anim.to);
  tl.fromTo(drawer, anim.from, anim.to);

  // Add callbacks to track animation progress
  tl.eventCallback("onStart", () => console.log("▶️ Timeline STARTED"));
  tl.eventCallback("onUpdate", () => {
    const progress = tl.progress();
    if (progress > 0 && progress < 1) {
      console.log(`📊 Timeline progress: ${(progress * 100).toFixed(1)}%`);
    }
  });
  tl.eventCallback("onInterrupt", () => console.log("⚠️ Timeline INTERRUPTED"));

  // Fade in overlay
  if (overlay) {
    tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "<");
  }

  // Update ARIA and state
  toggle.setAttribute(ARIA_EXPANDED, "true");
  dropdown.setAttribute(ATTR_PETAL_STATE, "open");

  return tl;
}

/**
 * Animates dropdown closing with GSAP
 */
export function animateClose(elements: DropdownElements, config: DropdownConfig, index: number): gsap.core.Timeline {
  const { drawer, overlay } = elements;

  // Use explicit close animation if set, otherwise reverse the open animation
  const closeAnimConfig = getCurrentSettingValue(config.animClose);
  let closeAnim;

  if (closeAnimConfig && closeAnimConfig.animation) {
    // Use explicit close animation
    closeAnim = getAnimation(config.animClose, DEFAULT_ANIMATION);
    // Reverse the animation
    closeAnim = reverseAnimation(closeAnim);
    console.log("🎨 CLOSE animation config (explicit):", { from: closeAnim.from, to: closeAnim.to });
  } else {
    // Auto-reverse the open animation
    const openAnim = getAnimation(config.animOpen, DEFAULT_ANIMATION);
    closeAnim = reverseAnimation(openAnim);
    console.log("🎨 CLOSE animation config (reversed open):", { from: closeAnim.from, to: closeAnim.to });
  }

  // Create GSAP timeline
  const tl = gsap.timeline();

  // Animate the drawer using 'to' instead of 'fromTo' to avoid interpolation
  // This animates from current state to the target state
  console.log("🎬 GSAP animating drawer to", closeAnim.to);
  tl.to(drawer, closeAnim.to);

  // Fade out overlay
  if (overlay) {
    tl.to(overlay, { opacity: 0, duration: 0.5 }, "<");
  }

  return tl;
}
