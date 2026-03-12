/**
 * Modal Configuration Module
 *
 * Handles parsing modal configuration from HTML attributes.
 */

import { parseTime } from "../../lib/helpers";
import {
  ATTR_PETAL_NAME,
  ATTR_PETAL_DEBUG,
  ATTR_PETAL_LOCK_SCROLL_ON_OPEN,
  ATTR_PETAL_ANIM_OPEN,
  ATTR_PETAL_ANIM_CLOSE,
  ATTR_PETAL_AUTO_OPEN,
  ATTR_PETAL_AUTO_OPEN_DELAY,
  ATTR_PETAL_MEMORY,
  ATTR_PETAL_MEMORY_EXPIRES,
} from "../../lib/attributes";

export interface ModalConfig {
  name: string;
  debug: boolean;
  lockScroll: boolean;
  animOpen?: string | null;
  animClose?: string | null;
  autoOpen?: boolean;
  autoOpenDelay?: Date | undefined;
  memory: {
    enabled: boolean;
    expires: Date | undefined;
  };
}

/**
 * Parses modal configuration from HTML element attributes
 */
export function parseModalConfig(modal: Element): ModalConfig {
  const name = modal.getAttribute(ATTR_PETAL_NAME) || "unknown";
  const debug = modal.getAttribute(ATTR_PETAL_DEBUG) === "true";

  const lockScroll = modal.getAttribute(ATTR_PETAL_LOCK_SCROLL_ON_OPEN) !== "false"; // Default to true

  const animOpen = modal.getAttribute(ATTR_PETAL_ANIM_OPEN);
  const animClose = modal.getAttribute(ATTR_PETAL_ANIM_CLOSE);

  const autoOpen = modal.getAttribute(ATTR_PETAL_AUTO_OPEN) === "true";
  const autoOpenDelay = parseTime(modal.getAttribute(ATTR_PETAL_AUTO_OPEN_DELAY));

  const memoryEnabled = modal.getAttribute(ATTR_PETAL_MEMORY) === "true";
  const memoryExpires = parseTime(modal.getAttribute(ATTR_PETAL_MEMORY_EXPIRES));

  return {
    name,
    debug,
    lockScroll,
    animOpen,
    animClose,
    autoOpen,
    autoOpenDelay,
    memory: {
      enabled: memoryEnabled,
      expires: memoryExpires,
    },
  };
}

/**
 * Log configuration for debugging
 */
export function logConfig(config: ModalConfig): void {
  if (!config.debug) return;
  console.log(config);
}
