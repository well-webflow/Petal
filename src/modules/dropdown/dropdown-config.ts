/**
 * Dropdown Configuration Module
 *
 * Handles parsing and managing dropdown configuration from HTML attributes
 * including animations, delays, offsets, and responsive breakpoints.
 */

import { AnimationOptions, getAnimationConfig } from "../../lib/animations";
import { ATTR_PETAL_GROUP, ATTR_PETAL_DEBUG, ATTR_PETAL_DROPDOWN_OPEN_ON_HOVER, ATTR_PETAL_LOCK_SCROLL_ON_OPEN, ATTR_PETAL_NAME } from "../../lib/attributes";
import { BREAKPOINT_TABLET, PetalSetting, parseSettingBreakpoint, getCurrentSettingValue, parseSetting } from "../../lib/setting";
import { parseBoolean, parseString } from "../../lib/helpers";

export interface DropdownConfig {
  name: string;
  group: string | null; // Group coordination
  debug: boolean; // Debug mode
  disableScrollOnOpen: boolean; // Scroll lock
  openOnHover: PetalSetting<boolean | undefined>; // Open-on-hover settings
  visible?: PetalSetting<boolean | undefined>; // Show on breakpoints
  animOpen?: PetalSetting<AnimationOptions>; // Open Animation
  animClose?: PetalSetting<AnimationOptions>; // Close Animation
}

/**
 * Parses dropdown configuration from HTML element attributes
 */
export function parseDropdownConfig(dropdown: Element): DropdownConfig {
  // Name
  const name = dropdown.getAttribute(ATTR_PETAL_NAME) || "";

  // Group coordination
  const group = parseSetting(dropdown, ATTR_PETAL_GROUP, parseString) || null;

  // Debug mode
  const debug = parseSetting(dropdown, ATTR_PETAL_DEBUG, parseBoolean) || false;

  // Scroll lock
  const disableScrollOnOpen = parseSetting(dropdown, ATTR_PETAL_LOCK_SCROLL_ON_OPEN, parseBoolean) || false;

  // Will this dropdown open on hover? (Only if device has mouse OR on desktop breakpoint)
  const openOnHover = parseSettingBreakpoint(dropdown, ATTR_PETAL_DROPDOWN_OPEN_ON_HOVER, parseBoolean);

  // Open animation configuration with cascading defaults
  const animOpen = getAnimationConfig(dropdown, "open");
  const animClose = getAnimationConfig(dropdown, "close");

  return {
    name,
    group,
    debug,
    disableScrollOnOpen,
    openOnHover,
    animOpen,
    animClose,
  };
}

/**
 * Log configuration for debugging
 */
export function logConfig(index: number, config: DropdownConfig): void {
  if (!config.debug) return;

  console.log(`Dropdown ${index + 1} - Config:`, {
    group: config.group,
    debug: config.debug,
    openOnHover: config.openOnHover,
    show: config.visible,
    animOpen: config.animOpen,
    animClose: config.animClose,
  });
}
