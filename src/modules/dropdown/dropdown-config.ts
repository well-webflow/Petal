/**
 * Dropdown Configuration Module
 *
 * Handles parsing dropdown configuration from HTML attributes.
 */

import { ATTR_PETAL_NAME, ATTR_PETAL_DEBUG } from "../../lib/attributes";
import { parseBoolean } from "../../lib/helpers";
import { AnimationType, EasingType } from "../../lib/animations";

// Dropdown-specific attributes
export const ATTR_PETAL_DROPDOWN = "dropdown";
export const ATTR_PETAL_DROPDOWN_TOGGLE = "dropdown-toggle";
export const ATTR_PETAL_DROPDOWN_MENU = "dropdown-menu";
export const ATTR_PETAL_DROPDOWN_CARET = "dropdown-caret";
export const ATTR_PETAL_DROPDOWN_BG = "dropdown-bg";
export const ATTR_PETAL_DROPDOWN_TYPE = "petal-dropdown-type";
export const ATTR_PETAL_DROPDOWN_START_OPEN = "petal-dropdown-start-open";
export const ATTR_PETAL_ANIM = "petal-anim";
export const ATTR_PETAL_ANIM_DURATION = "petal-anim-duration";
export const ATTR_PETAL_ANIM_OFFSET = "petal-anim-offset";
export const ATTR_PETAL_ANIM_EASING = "petal-anim-easing";

export type DropdownType = "simple" | "mega";

export interface DropdownConfig {
  name: string;
  debug: boolean;
  type: DropdownType;
  startOpen: boolean;
  animation: {
    type: AnimationType;
    duration: number;
    offset: number;
    easing: EasingType;
  };
}

/**
 * Parses dropdown configuration from HTML element attributes
 */
export function parseDropdownConfig(dropdown: Element): DropdownConfig {
  const name = dropdown.getAttribute(ATTR_PETAL_NAME) || "unknown";
  const debug = parseBoolean(dropdown.getAttribute(ATTR_PETAL_DEBUG)) ?? false;
  const type = (dropdown.getAttribute(ATTR_PETAL_DROPDOWN_TYPE) || "simple") as DropdownType;
  const startOpen = parseBoolean(dropdown.getAttribute(ATTR_PETAL_DROPDOWN_START_OPEN)) ?? false;

  const animType = (dropdown.getAttribute(ATTR_PETAL_ANIM) || "fade") as AnimationType;
  const animDuration = parseFloat(dropdown.getAttribute(ATTR_PETAL_ANIM_DURATION) || "0.3");
  const animOffset = parseFloat(dropdown.getAttribute(ATTR_PETAL_ANIM_OFFSET) || "30");
  const animEasing = (dropdown.getAttribute(ATTR_PETAL_ANIM_EASING) || "power1.out") as EasingType;

  return {
    name,
    debug,
    type,
    startOpen,
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
export function logConfig(config: DropdownConfig): void {
  if (!config.debug) return;
  console.log(config);
}
