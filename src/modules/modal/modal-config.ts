/**
 * Modal Configuration Module
 *
 * Handles parsing modal configuration from HTML attributes.
 */

import { AnimationOptions, getAnimationConfig } from "../../lib/animations";
import { ATTR_PETAL_NAME, ATTR_PETAL_DEBUG, ATTR_PETAL_OVERLAY_OPACITY, ATTR_PETAL_MODAL_TYPE, ATTR_PETAL_LOCK_SCROLL_ON_OPEN } from "../../lib/attributes";
import { PetalSetting } from "../../lib/setting";

export interface ModalConfig {
  name: string;
  debug: boolean;
  maskOpacity: number;
  animOpen: PetalSetting<AnimationOptions>;
  animClose: PetalSetting<AnimationOptions>;
  lockScrollOnOpen: boolean;
}

/**
 * Parses modal configuration from HTML element attributes
 */
export function parseModalConfig(modal: Element): ModalConfig {
  const name = modal.getAttribute(ATTR_PETAL_NAME) || "unknown";
  const debug = modal.getAttribute(ATTR_PETAL_DEBUG) === "true";
  const maskOpacity = parseFloat(modal.getAttribute(ATTR_PETAL_OVERLAY_OPACITY) || "0.15");
  const lockScrollOnOpen = modal.getAttribute(ATTR_PETAL_LOCK_SCROLL_ON_OPEN) !== "false"; // Default to true

  const animOpen = getAnimationConfig(modal, "open");
  const animClose = getAnimationConfig(modal, "close");

  return {
    name,
    debug,
    maskOpacity,
    animOpen,
    animClose,
    lockScrollOnOpen,
  };
}

/**
 * Log configuration for debugging
 */
export function logConfig(config: ModalConfig): void {
  if (!config.debug) return;
  console.log(config);
}
