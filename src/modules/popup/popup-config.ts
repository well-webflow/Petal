/**
 * Popup Configuration Module
 *
 * Handles parsing popup configuration from HTML attributes.
 */

import { parseTime, parseBoolean } from "../../lib/helpers";
import { AnimationType, EasingType } from "../../lib/animations";
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
  ATTR_PETAL_POPUP_ANIM,
  ATTR_PETAL_POPUP_ANIM_DURATION,
  ATTR_PETAL_POPUP_ANIM_OFFSET,
  ATTR_PETAL_POPUP_ANIM_EASING,
  ATTR_PETAL_POPUP_BOX_ANIM,
  ATTR_PETAL_POPUP_BOX_ANIM_DURATION,
  ATTR_PETAL_POPUP_BOX_ANIM_OFFSET,
  ATTR_PETAL_POPUP_BOX_ANIM_EASING,
  ATTR_PETAL_POPUP_OVERLAY_ANIM,
  ATTR_PETAL_POPUP_OVERLAY_ANIM_DURATION,
  ATTR_PETAL_POPUP_OVERLAY_ANIM_EASING,
} from "../../lib/attributes";

export interface PopupConfig {
  name: string;
  debug: boolean;
  lockScroll: boolean;
  closeOnResize: boolean;
  gsapAnimation: {
    open?: string | null;
    close?: string | null;
  };
  animation: {
    popup: {
      type: AnimationType;
      duration: number;
      offset: number;
      easing: EasingType;
    };
    box: {
      type: AnimationType;
      duration: number;
      offset: number;
      easing: EasingType;
    };
    overlay: {
      type: AnimationType;
      duration: number;
      easing: EasingType;
    };
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
 * Parses popup configuration from HTML element attributes
 */
export function parsePopupConfig(popup: Element): PopupConfig {
  const name = popup.getAttribute(ATTR_PETAL_NAME) || "unknown";
  const debug = parseBoolean(popup.getAttribute(ATTR_PETAL_DEBUG)) ?? false;

  const lockScroll = parseBoolean(popup.getAttribute(ATTR_PETAL_LOCK_SCROLL_ON_OPEN)) ?? true; // Default to true
  const closeOnResize = parseBoolean(popup.getAttribute(ATTR_PETAL_CLOSE_ON_RESIZE)) ?? false;

  const videoAutoplay = parseBoolean(popup.getAttribute(ATTR_PETAL_VIDEO_AUTOPLAY)) ?? false;
  const videoAutopause = parseBoolean(popup.getAttribute(ATTR_PETAL_VIDEO_AUTOPAUSE)) ?? true; // Default to true

  // GSAP animations (legacy, takes precedence if defined)
  const gsapAnimOpen = popup.getAttribute(ATTR_PETAL_ANIM_OPEN);
  const gsapAnimClose = popup.getAttribute(ATTR_PETAL_ANIM_CLOSE);

  // Default animations for popup wrapper
  const popupAnimType = (popup.getAttribute(ATTR_PETAL_POPUP_ANIM) || "fade") as AnimationType;
  const popupAnimDuration = parseFloat(popup.getAttribute(ATTR_PETAL_POPUP_ANIM_DURATION) || "0.3");
  const popupAnimOffset = parseFloat(popup.getAttribute(ATTR_PETAL_POPUP_ANIM_OFFSET) || "0");
  const popupAnimEasing = (popup.getAttribute(ATTR_PETAL_POPUP_ANIM_EASING) || "power2.out") as EasingType;

  // Default animations for popup box
  const boxAnimType = (popup.getAttribute(ATTR_PETAL_POPUP_BOX_ANIM) || "fade") as AnimationType;
  const boxAnimDuration = parseFloat(popup.getAttribute(ATTR_PETAL_POPUP_BOX_ANIM_DURATION) || "0.4");
  const boxAnimOffset = parseFloat(popup.getAttribute(ATTR_PETAL_POPUP_BOX_ANIM_OFFSET) || "30");
  const boxAnimEasing = (popup.getAttribute(ATTR_PETAL_POPUP_BOX_ANIM_EASING) || "power2.out") as EasingType;

  // Default animations for overlay
  const overlayAnimType = (popup.getAttribute(ATTR_PETAL_POPUP_OVERLAY_ANIM) || "fade") as AnimationType;
  const overlayAnimDuration = parseFloat(popup.getAttribute(ATTR_PETAL_POPUP_OVERLAY_ANIM_DURATION) || "0.3");
  const overlayAnimEasing = (popup.getAttribute(ATTR_PETAL_POPUP_OVERLAY_ANIM_EASING) || "power2.out") as EasingType;

  const autoOpen = parseBoolean(popup.getAttribute(ATTR_PETAL_AUTO_OPEN)) ?? false;
  const autoOpenDelay = parseTime(popup.getAttribute(ATTR_PETAL_AUTO_OPEN_DELAY));

  const memoryEnabled = parseBoolean(popup.getAttribute(ATTR_PETAL_MEMORY)) ?? false;
  const memoryExpires = parseTime(popup.getAttribute(ATTR_PETAL_MEMORY_EXPIRES));

  return {
    name,
    debug,
    lockScroll,
    closeOnResize,
    gsapAnimation: {
      open: gsapAnimOpen,
      close: gsapAnimClose,
    },
    animation: {
      popup: {
        type: popupAnimType,
        duration: popupAnimDuration,
        offset: popupAnimOffset,
        easing: popupAnimEasing,
      },
      box: {
        type: boxAnimType,
        duration: boxAnimDuration,
        offset: boxAnimOffset,
        easing: boxAnimEasing,
      },
      overlay: {
        type: overlayAnimType,
        duration: overlayAnimDuration,
        easing: overlayAnimEasing,
      },
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
export function logConfig(config: PopupConfig): void {
  if (!config.debug) return;
  console.log(config);
}
