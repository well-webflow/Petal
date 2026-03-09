/**
 * Modal Configuration Module
 *
 * Handles parsing modal configuration from HTML attributes.
 */

import { ATTR_PETAL_NAME, ATTR_PETAL_DEBUG, ATTR_PETAL_LOCK_SCROLL_ON_OPEN, ATTR_PETAL_ANIM_OPEN, ATTR_PETAL_ANIM_CLOSE } from "../../lib/attributes";

export interface ModalConfig {
  name: string;
  debug: boolean;
  lockScrollOnOpen: boolean;
  animOpen?: string | null;
  animClose?: string | null;
}

/**
 * Parses modal configuration from HTML element attributes
 */
export function parseModalConfig(modal: Element): ModalConfig {
  const name = modal.getAttribute(ATTR_PETAL_NAME) || "unknown";
  const debug = modal.getAttribute(ATTR_PETAL_DEBUG) === "true";
  const lockScrollOnOpen = modal.getAttribute(ATTR_PETAL_LOCK_SCROLL_ON_OPEN) !== "false"; // Default to true

  const animOpen = modal.getAttribute(ATTR_PETAL_ANIM_OPEN);
  const animClose = modal.getAttribute(ATTR_PETAL_ANIM_CLOSE);

  return {
    name,
    debug,
    lockScrollOnOpen,
    animOpen,
    animClose,
  };
}

/**
 * Log configuration for debugging
 */
export function logConfig(config: ModalConfig): void {
  if (!config.debug) return;
  console.log(config);
}
