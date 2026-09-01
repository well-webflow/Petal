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
export const ATTR_PETAL_VISIBLE = "petal-visible";

/**-------------------------*
 * ANIMATIONS
 *--------------------------*/
export const ATTR_PETAL_ANIM_OPEN = "petal-anim-open";
export const ATTR_PETAL_ANIM_CLOSE = "petal-anim-close";

/**-------------------------*
 * TRIGGERS
 *--------------------------*/
export const ATTR_PETAL_TRIGGER = "petal-trigger"; // Attribute to identify trigger elements
export const ATTR_PETAL_TRIGGER_ANIM_OPEN = "petal-trigger-anim-open"; // Attribute to specify the animation to play when opening
export const ATTR_PETAL_TRIGGER_ANIM_CLOSE = "petal-trigger-anim-close"; // Attribute to specify the animation to play when closing
// Type
export const ATTR_PETAL_TRIGGER_TOGGLE = "toggle";
export const ATTR_PETAL_TRIGGER_OPEN = "open";
export const ATTR_PETAL_TRIGGER_CLOSE = "close";

/**-------------------------*
 * BREAKPOINTS
 *--------------------------*/
export const ATTR_PETAL_HIDE_DESKTOP = "petal-hide-desktop";
export const ATTR_PETAL_HIDE_TABLET = "petal-hide-tablet";
export const ATTR_PETAL_HIDE_MOBILE_LANDSCAPE = "petal-hide-mobile-landscape";
export const ATTR_PETAL_HIDE_MOBILE = "petal-hide-mobile";

/**-------------------------*
 * OBSERVER
 *--------------------------*/
export const ATTR_PETAL_CLOSE_ON_RESIZE = "petal-close-on-resize";
export const ATTR_PETAL_CLOSE_ON_BREAKPOINT = "petal-close-on-breakpoint";

/**-------------------------*
 * OVERLAY
 *--------------------------*/
export const ATTR_PETAL_OVERLAY = "overlay";
export const ATTR_PETAL_OVERLAY_OPACITY = "petal-overlay-opacity";
export const ATTR_PETAL_OVERLAY_CLOSE = "petal-overlay-close";

/**-------------------------*
 * POPUP
 *--------------------------*/

// ELEMENTS
export const ATTR_PETAL_POPUP = "popup";
export const ATTR_PETAL_POPUP_BOX = "popup-box";
export const ATTR_PETAL_POPUP_OVERLAY = "popup-overlay";

// AUTO OPEN
export const ATTR_PETAL_AUTO_OPEN = "petal-auto-open";
export const ATTR_PETAL_AUTO_OPEN_DELAY = "petal-auto-open-delay";

// POPUP ANIMATIONS
export const ATTR_PETAL_POPUP_ANIM = "petal-popup-anim";
export const ATTR_PETAL_POPUP_ANIM_DURATION = "petal-popup-anim-duration";
export const ATTR_PETAL_POPUP_ANIM_OFFSET = "petal-popup-anim-offset";
export const ATTR_PETAL_POPUP_ANIM_EASING = "petal-popup-anim-easing";

// POPUP BOX ANIMATIONS
export const ATTR_PETAL_POPUP_BOX_ANIM = "petal-popup-box-anim";
export const ATTR_PETAL_POPUP_BOX_ANIM_DURATION = "petal-popup-box-anim-duration";
export const ATTR_PETAL_POPUP_BOX_ANIM_OFFSET = "petal-popup-box-anim-offset";
export const ATTR_PETAL_POPUP_BOX_ANIM_EASING = "petal-popup-box-anim-easing";

// POPUP OVERLAY ANIMATIONS
export const ATTR_PETAL_POPUP_OVERLAY_ANIM = "petal-popup-overlay-anim";
export const ATTR_PETAL_POPUP_OVERLAY_ANIM_DURATION = "petal-popup-overlay-anim-duration";
export const ATTR_PETAL_POPUP_OVERLAY_ANIM_EASING = "petal-popup-overlay-anim-easing";

/**-------------------------*
 * VIDEO
 *--------------------------*/

export const ATTR_PETAL_VIDEO_AUTOPLAY = "petal-video-autoplay"; // Enable autoplay for video elements within the modal
export const ATTR_PETAL_VIDEO_AUTOPAUSE = "petal-video-autopause"; // Enable auto-pause for video elements when modal is closed

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

/**-------------------------*
 * MEMORY
 *--------------------------*/

export const ATTR_PETAL_MEMORY = "petal-memory"; // Enable memory for this element (i.e. don't show again if closed)
export const ATTR_PETAL_MEMORY_EXPIRES = "petal-memory-expires"; // Time to keep user session (FORMAT: "4y", "2m" "1d", "2h", "30m", "15s", "200ms")
