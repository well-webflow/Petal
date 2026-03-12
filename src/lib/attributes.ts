export interface PetalElements {
  name: string;
  trigger: Element;
  modal: HTMLElement;
  mask: Element;
  dialog: Element;
}

// BASE
export const ATTR_PETAL_NAME = "petal";
export const ATTR_PETAL_ELEMENT = "petal-el";
export const ATTR_PETAL_GROUP = "petal-group"; // Group name for coordinated behavior across components
export const ATTR_PETAL_STATE = "petal-state";
export const ATTR_PETAL_DEBUG = "petal-debug"; // Enable debug console logging

// BEHAVIOR
export const ATTR_PETAL_SHOW_ONCE = "petal-show-once"; // Regardless of other settings, only show the modal once per user session
export const ATTR_PETAL_SESSION_TTL = "petal-session-ttl"; // Time to keep user session (in hours)

// VISIBILITY
export const ATTR_PETAL_VISIBLE = "petal-visible";

/**-------------------------*
 * ANIMATIONS
 *--------------------------*/
export const ATTR_PETAL_ANIM_OPEN = "petal-anim-open";
export const ATTR_PETAL_ANIM_CLOSE = "petal-anim-close";

/**-------------------------*
 * TRIGGERS
 *--------------------------*/

export const ATTR_PETAL_TRIGGER = "petal-trigger";
export const ATTR_PETAL_TRIGGER_OPEN = "petal-trigger-open";
export const ATTR_PETAL_TRIGGER_CLOSE = "petal-trigger-close";

/**-------------------------*
 * BREAKPOINTS
 *--------------------------*/
export const ATTR_PETAL_HIDE_DESKTOP = "petal-hide-desktop";
export const ATTR_PETAL_HIDE_TABLET = "petal-hide-tablet";
export const ATTR_PETAL_HIDE_MOBILE_LANDSCAPE = "petal-hide-mobile-landscape";
export const ATTR_PETAL_HIDE_MOBILE = "petal-hide-mobile";

/**-------------------------*
 * OVERLAY
 *--------------------------*/

export const ATTR_PETAL_OVERLAY = "overlay";
export const ATTR_PETAL_OVERLAY_OPACITY = "petal-overlay-opacity";
export const ATTR_PETAL_OVERLAY_CLOSE = "petal-overlay-close";

/**-------------------------*
 * MODAL
 *--------------------------*/

// ELEMENTS
export const ATTR_PETAL_MODAL = "modal";
export const ATTR_PETAL_DIALOG = "dialog";
export const ATTR_PETAL_MODAL_TYPE = "petal-modal-type";

// AUTO OPEN
export const ATTR_PETAL_AUTO_OPEN = "petal-auto-open";
export const ATTR_PETAL_AUTO_OPEN_DELAY = "petal-auto-open-delay";

/**-------------------------*
 * NAV
 *--------------------------*/

// ELEMENTS
export const ATTR_PETAL_NAV = "nav";
export const ATTR_PETAL_NAV_SECONDARY = "nav-secondary";
export const ATTR_PETAL_BANNER = "banner";
export const ATTR_PETAL_BANNER_CLOSE = "banner-close";

// SETTINGS
export const ATTR_ALLOW_CLOSE = "petal-allow-close";
export const ATTR_PETAL_POSITION = "petal-position";

// CSS
export const ATTR_PETAL_BANNER_CLOSED_CLASS = "petal-hide-nav-banner";

/**-------------------------*
 * DROPDOWN
 *--------------------------*/

// ELEMENTS
export const ATTR_PETAL_DROPDOWN = "dropdown";
export const ATTR_PETAL_DROPDOWN_TOGGLE = "dropdown-toggle";
export const ATTR_PETAL_DROPDOWN_MENU = "dropdown-menu";
export const ATTR_PETAL_DROPDOWN_MENU_BOX = "dropdown-drawer";

// BEHAVIOR
export const ATTR_PETAL_LOCK_SCROLL_ON_OPEN = "petal-lock-scroll-on-open";

// OPEN/CLOSE BEHAVIOR
export const ATTR_PETAL_DROPDOWN_OPEN_ON_HOVER = "petal-dropdown-open-on-hover";

// ARIA ATTRIBUTES
export const ARIA_EXPANDED = "aria-expanded";
