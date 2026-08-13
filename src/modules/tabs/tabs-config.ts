/**
 * Tabs Configuration Module
 *
 * Handles parsing tabs configuration from HTML attributes.
 */

import { ATTR_PETAL_NAME, ATTR_PETAL_DEBUG } from "../../lib/attributes";
import { parseBoolean } from "../../lib/helpers";
import { AnimationType, EasingType } from "../../lib/animations";

// New tab-specific attributes
export const ATTR_PETAL_TABS = "tabs";
export const ATTR_PETAL_TAB_LINK = "tab-link";
export const ATTR_PETAL_TAB_PANE = "tab-pane";
export const ATTR_PETAL_ANIM = "petal-anim";
export const ATTR_PETAL_ANIM_DURATION = "petal-anim-duration";
export const ATTR_PETAL_ANIM_OFFSET = "petal-anim-offset";
export const ATTR_PETAL_ANIM_EASING = "petal-anim-easing";

export interface TabsConfig {
  name: string;
  debug: boolean;
  animation: {
    type: AnimationType;
    duration: number;
    offset: number;
    easing: EasingType;
  };
}

/**
 * Parses tabs configuration from HTML element attributes
 */
export function parseTabsConfig(tabsWrapper: Element): TabsConfig {
  const name = tabsWrapper.getAttribute(ATTR_PETAL_NAME) || "unknown";
  const debug = parseBoolean(tabsWrapper.getAttribute(ATTR_PETAL_DEBUG)) ?? false;

  const animType = (tabsWrapper.getAttribute(ATTR_PETAL_ANIM) || "fade") as AnimationType;
  const animDuration = parseFloat(tabsWrapper.getAttribute(ATTR_PETAL_ANIM_DURATION) || "0.3");
  const animOffset = parseFloat(tabsWrapper.getAttribute(ATTR_PETAL_ANIM_OFFSET) || "30");
  const animEasing = (tabsWrapper.getAttribute(ATTR_PETAL_ANIM_EASING) || "power1.out") as EasingType;

  return {
    name,
    debug,
    animation: {
      type: animType,
      duration: animDuration,
      offset: animOffset,
      easing: animEasing,
    },
  };
}

/**
 * Log configuration for debugging
 */
export function logConfig(config: TabsConfig): void {
  if (!config.debug) return;
  console.log(config);
}
