/**
 * Modal Configuration Module
 *
 * Handles parsing modal configuration from HTML attributes.
 */

import { parseTime, parseBoolean } from "../../lib/helpers";
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
  ATTR_PETAL_CLOSE_ON_RESIZE,
  ATTR_PETAL_VIDEO_AUTOPLAY,
  ATTR_PETAL_VIDEO_AUTOPAUSE,
} from "../../lib/attributes";

export interface ModalConfig {
  name: string;
  debug: boolean;
  lockScroll: boolean;
  closeOnResize: boolean;
  animation: {
    open?: string | null;
    close?: string | null;
  };
  video: {
    autoplay: boolean;
    autopause: boolean;
  };
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
  const debug = parseBoolean(modal.getAttribute(ATTR_PETAL_DEBUG)) ?? false;

  const lockScroll = parseBoolean(modal.getAttribute(ATTR_PETAL_LOCK_SCROLL_ON_OPEN)) ?? true; // Default to true
  const closeOnResize = parseBoolean(modal.getAttribute(ATTR_PETAL_CLOSE_ON_RESIZE)) ?? false;

  const videoAutoplay = parseBoolean(modal.getAttribute(ATTR_PETAL_VIDEO_AUTOPLAY)) ?? false;
  const videoAutopause = parseBoolean(modal.getAttribute(ATTR_PETAL_VIDEO_AUTOPAUSE)) ?? true; // Default to true

  const animOpen = modal.getAttribute(ATTR_PETAL_ANIM_OPEN);
  const animClose = modal.getAttribute(ATTR_PETAL_ANIM_CLOSE);

  const autoOpen = parseBoolean(modal.getAttribute(ATTR_PETAL_AUTO_OPEN)) ?? false;
  const autoOpenDelay = parseTime(modal.getAttribute(ATTR_PETAL_AUTO_OPEN_DELAY));

  const memoryEnabled = parseBoolean(modal.getAttribute(ATTR_PETAL_MEMORY)) ?? false;
  const memoryExpires = parseTime(modal.getAttribute(ATTR_PETAL_MEMORY_EXPIRES));

  return {
    name,
    debug,
    lockScroll,
    closeOnResize,
    animation: {
      open: animOpen,
      close: animClose,
    },
    video: {
      autoplay: videoAutoplay,
      autopause: videoAutopause,
    },
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
