/**
 * Modal Animator Module
 *
 * Handles GSAP animations for modals including:
 * - Dialog opening/closing animations
 * - Mask fade transitions
 * - Timeline management
 */

import { gsap } from "gsap";
import { animations, AnimationOptions, clearAnimationProperties, getAnimation, reverseAnimation } from "../../lib/animations";
import { getCurrentSettingValue } from "../../lib/setting";
import type { ModalConfig } from "./modal-config";
import { debug } from "../../lib/debug";
import { isAllNullish } from "../../lib/helpers";

export interface ModalElements {
  modal: HTMLElement;
  dialog: HTMLElement;
  mask: HTMLElement | null;
}

const DEFAULT_ANIMATION: AnimationOptions = {
  animation: "scale",
  delay: 0,
  duration: 0.5,
  offset: "50%",
  ease: undefined,
};

/**
 * Animates modal opening with GSAP
 */
export function animateOpen(elements: ModalElements, config: ModalConfig): gsap.core.Timeline | null {
  const { modal, dialog, mask } = elements;
  const tl = gsap.timeline();

  const anim = getAnimation(config.animOpen, DEFAULT_ANIMATION);

  console.log("CCHECK", anim);

  if (!anim) return null;

  debug(config.debug, "MODAL", `"${config.name}" - open()`);

  // Clear any leftover animation properties before starting
  clearAnimationProperties(dialog);

  // Set Modal display to flex
  tl.set(modal, { display: "flex" });
  if (config.debug) console.log(`[DEBUG] Modal "${config.name}" - Set display to flex`);

  // Set initial dialog state to prevent flicker
  tl.set(dialog, anim.from);

  // Animate Mask open (if mask exists)
  if (mask) {
    const maskAnim = animations.fade({ offset: config.maskOpacity });
    tl.fromTo(mask, maskAnim.from, maskAnim.to, "<");
    if (config.debug) console.log(`[DEBUG] Modal "${config.name}" - Animating mask open (opacity: ${config.maskOpacity})`);
  }

  // Animate Dialog Open
  tl.fromTo(dialog, anim.from, anim.to);
  if (config.debug) console.log(`[DEBUG] Modal "${config.name}" - Animating dialog open`);

  return tl;
}

/**
 * Animates modal closing with GSAP
 */
export function animateClose(elements: ModalElements, config: ModalConfig): gsap.core.Timeline {
  const { modal, dialog, mask } = elements;
  const tl = gsap.timeline();

  if (config.debug) console.log(`[DEBUG] Modal "${config.name}" - closeModal() called`);

  // Use explicit close animation if set, otherwise reverse the open animation
  const closeAnimConfig = getCurrentSettingValue(config.animClose);
  let closeAnim;

  if (closeAnimConfig && closeAnimConfig.animation) {
    // Use explicit close animation
    closeAnim = getAnimation(config.animClose, DEFAULT_ANIMATION);
  } else {
    // Auto-reverse the open animation
    const openAnim = getAnimation(config.animOpen, DEFAULT_ANIMATION);
    closeAnim = reverseAnimation(openAnim);
  }

  console.log("CLOSE: ", closeAnim);

  if (!closeAnim) return gsap.timeline(); // Return empty timeline if no animation

  // Animate the Dialog Closed (duration is now in anim.to)
  tl.fromTo(dialog, closeAnim.from, closeAnim.to);
  if (config.debug) console.log(`[DEBUG] Modal "${config.name}" - Animating dialog close`);

  // Animate Mask Closed (if mask exists)
  if (mask) {
    const maskCloseAnim = reverseAnimation(animations.fade({ offset: config.maskOpacity }));
    tl.fromTo(mask, maskCloseAnim.from, maskCloseAnim.to, "<");
    if (config.debug) console.log(`[DEBUG] Modal "${config.name}" - Animating mask close`);
  }

  // Hide the Modal and clear all animation properties
  tl.set(modal, { display: "none" });
  tl.call(() => clearAnimationProperties(dialog));
  if (config.debug) console.log(`[DEBUG] Modal "${config.name}" - Set display to none and cleared all animation properties`);

  return tl;
}

/**
 * Initialize modal elements to their starting state
 */
export function initializeElements(elements: ModalElements, config: ModalConfig): void {
  const { modal, mask } = elements;

  // Initialize Mask (if it exists)
  if (mask) {
    mask.style.opacity = "0";
    if (config.debug) console.log(`    [DEBUG] Set mask opacity to 0`);
  }

  // Initialize Modal
  modal.style.display = "none";
  if (config.debug) console.log(`    [DEBUG] Set modal display to none`);
}
