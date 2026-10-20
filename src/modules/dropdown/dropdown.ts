/**
 * -+-+-+ Dropdown -+-+-+
 *
 * Handles interactive dropdown components with support for:
 * - Click or hover interaction modes
 * - GSAP animations (fade, slide)
 * - Caret rotation animation
 * - Active class on the toggle while open (petal-active-class, default: is-active)
 * - Start-open configuration
 * - Click outside to close (click mode)
 * - petal-trigger open/close/toggle elements (unnamed: nearest popup or dropdown; named: matching petal name)
 * - Enabling/disabling per breakpoint (petal-dropdown-enabled, -tablet, -mobile-landscape, -mobile)
 *
 * Dropdowns inside a dropdown-group:
 * - Only one dropdown in the group is open at a time
 * - Animate when the group opens from closed or fully closes; switching between dropdowns swaps instantly
 * - If the group contains a dropdown-group-bg, it resizes to match the open menu
 */

import { ATTR_PETAL_ELEMENT, ATTR_PETAL_STATE, ATTR_PETAL_TRIGGER_OPEN, ATTR_PETAL_TRIGGER_CLOSE, ATTR_PETAL_TRIGGER_TOGGLE } from "../../lib/attributes";
import { debug, debugElements } from "../../lib/debug";
import { findTriggers } from "../../lib/helpers";
import { animateIn, animateOut, clearAnimation, showInstantly, hideInstantly } from "../../lib/animations";
import { getCurrentSettingValue, onBreakpointChange } from "../../lib/setting";
import {
  parseDropdownConfig,
  logConfig,
  DropdownConfig,
  ATTR_PETAL_DROPDOWN,
  ATTR_PETAL_DROPDOWN_TOGGLE,
  ATTR_PETAL_DROPDOWN_MENU,
  ATTR_PETAL_DROPDOWN_CARET,
  ATTR_PETAL_DROPDOWN_GROUP,
  ATTR_PETAL_DROPDOWN_GROUP_BG,
} from "./dropdown-config";

// Delay in milliseconds before closing a hover dropdown when the mouse leaves
const HOVER_CLOSE_DELAY = 200;

function petalSelector(el: string): string {
  return `[${ATTR_PETAL_ELEMENT}="${el}"]`;
}

export interface DropdownElements {
  dropdown: HTMLElement;
  toggle: HTMLElement;
  menu: HTMLElement;
  caret: HTMLElement | null;
  openTriggers: HTMLElement[];
  closeTriggers: HTMLElement[];
  toggleTriggers: HTMLElement[];
}

/**
 * Dropdown Group
 * Keeps only one dropdown in a dropdown-group open at a time and drives the optional shared background.
 */
class DropdownGroup {
  private active: DropdownController | null = null;
  private members: DropdownController[] = [];

  constructor(private bg: HTMLElement | null) {
    if (!bg) return;

    bg.style.height = "0px";

    // Keep the open hover dropdown open while the mouse is over the background
    bg.addEventListener("mouseenter", () => this.active?.cancelClose());
    bg.addEventListener("mouseleave", () => this.active?.scheduleClose());
  }

  add(member: DropdownController): void {
    this.members.push(member);
  }

  /**
   * Whether the target is inside the shared background
   */
  backgroundContains(target: Node): boolean {
    return this.bg?.contains(target) ?? false;
  }

  /**
   * Marks a dropdown as open and immediately hides the others, including any still animating closed.
   * Returns true when another dropdown was already open, so the caller can skip its animation.
   */
  activate(member: DropdownController): boolean {
    const isSwitching = this.active !== null && this.active !== member;
    this.active = member;

    this.members.forEach((other) => {
      if (other !== member) other.close(true);
    });

    return isSwitching;
  }

  /**
   * Clears the open dropdown and collapses the shared background
   */
  deactivate(member: DropdownController): void {
    if (this.active !== member) return;

    this.active = null;
    if (this.bg) this.bg.style.height = "0px";
  }

  /**
   * Resizes the shared background to match the open menu
   */
  fitBackground(member: DropdownController, menu: HTMLElement): void {
    if (!this.bg) return;

    // Use double requestAnimationFrame to ensure DOM has updated before measuring height
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.active !== member) return;
        this.bg!.style.height = `${menu.getBoundingClientRect().height}px`;
      });
    });
  }
}

/**
 * Dropdown Controller
 * Manages dropdown state and open/close behavior with animations.
 */
class DropdownController {
  private enabled: boolean = false;
  private closeTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private elements: DropdownElements,
    private config: DropdownConfig,
    private group: DropdownGroup | null
  ) {}

  isOpen(): boolean {
    return this.elements.menu.getAttribute(ATTR_PETAL_STATE) === "open";
  }

  /**
   * Toggle the dropdown open/closed
   */
  toggle = (): void => {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  };

  /**
   * Open the dropdown, animating unless another dropdown in the group was already open
   */
  open = (): void => {
    if (!this.enabled || this.isOpen()) return;

    this.cancelClose();
    const isSwitching = this.group?.activate(this) ?? false;
    this.setState(true);

    const { menu } = this.elements;
    if (isSwitching) {
      showInstantly(menu);
    } else {
      clearAnimation(menu);
      animateIn(menu, this.config.animation.type, this.config.animation.duration, this.config.animation.offset, this.config.animation.easing);
    }

    this.group?.fitBackground(this, menu);
  };

  /**
   * Close the dropdown with animation, or instantly
   * An instant close also cuts short a close animation that is still running
   */
  close = (instant: boolean = false): void => {
    if (!this.enabled) return;

    const wasOpen = this.isOpen();
    if (!wasOpen && !instant) return;

    this.cancelClose();
    this.setState(false);

    const { menu } = this.elements;
    if (instant) {
      hideInstantly(menu);
    } else {
      animateOut(menu, this.config.animation.type, this.config.animation.duration, this.config.animation.offset, this.config.animation.easing, () => {});
    }

    if (wasOpen) this.group?.deactivate(this);
  };

  /**
   * Close after a short delay (hover mode only)
   */
  scheduleClose = (): void => {
    if (this.config.interaction !== "hover") return;

    this.cancelClose();
    this.closeTimeout = setTimeout(() => this.close(), HOVER_CLOSE_DELAY);
  };

  /**
   * Cancel a pending delayed close
   */
  cancelClose = (): void => {
    if (this.closeTimeout === null) return;

    clearTimeout(this.closeTimeout);
    this.closeTimeout = null;
  };

  /**
   * Add interaction listeners based on mode
   */
  bindEvents(): void {
    const { dropdown, toggle, openTriggers, closeTriggers, toggleTriggers } = this.elements;
    const triggers = [...openTriggers, ...closeTriggers, ...toggleTriggers];

    if (this.config.interaction === "hover") {
      toggle.addEventListener("mouseenter", this.open);
      dropdown.addEventListener("mouseenter", this.cancelClose);
      dropdown.addEventListener("mouseleave", this.scheduleClose);
    } else {
      toggle.addEventListener("click", this.toggle);

      // Close when clicking outside the dropdown, its group background and its triggers
      document.addEventListener("click", (e) => {
        const target = e.target as Node;
        if (!this.isOpen() || dropdown.contains(target) || this.group?.backgroundContains(target)) return;
        if (triggers.some((trigger) => trigger.contains(target))) return;
        this.close();
      });
    }

    // petal-trigger elements work in both modes
    openTriggers.forEach((trigger) => trigger.addEventListener("click", () => this.open()));
    closeTriggers.forEach((trigger) => trigger.addEventListener("click", () => this.close()));
    toggleTriggers.forEach((trigger) => trigger.addEventListener("click", () => this.toggle()));
  }

  /**
   * Enable or disable the dropdown for the current breakpoint
   * Disabled dropdowns ignore interaction and leave the menu's visibility to CSS
   */
  applyBreakpoint(initial: boolean = false): void {
    const enabled = getCurrentSettingValue(this.config.enabled) ?? true;
    if (!initial && enabled === this.enabled) return;

    debug(this.config.debug, "DROPDOWN", `"${this.config.name}" ${enabled ? "enabled" : "disabled"} at ${window.innerWidth}px`);

    const { toggle, menu, caret } = this.elements;
    this.cancelClose();
    if (this.isOpen()) this.group?.deactivate(this);
    clearAnimation(menu);
    this.enabled = enabled;

    if (enabled) {
      // Hide menu by default
      this.setState(false);
      menu.style.display = "none";

      if (initial && this.config.startOpen) {
        debug(this.config.debug, "DROPDOWN", `Opening "${this.config.name}" on initialization (start-open)`);
        this.open();
      }
    } else {
      menu.removeAttribute(ATTR_PETAL_STATE);
      toggle.classList.remove(this.config.activeClass);
      if (caret) caret.style.removeProperty("transform");
    }
  }

  private setState(open: boolean): void {
    this.elements.menu.setAttribute(ATTR_PETAL_STATE, open ? "open" : "closed");
    this.elements.toggle.classList.toggle(this.config.activeClass, open);

    // Rotate caret if present
    if (this.elements.caret) {
      this.elements.caret.style.transform = open ? "scaleY(-1)" : "none";
    }
  }
}

/**
 * Finds the first element of a type that belongs to this dropdown, skipping elements of nested dropdowns
 */
function getOwnElement(dropdown: HTMLElement, el: string): HTMLElement | null {
  const matches = Array.from(dropdown.querySelectorAll<HTMLElement>(petalSelector(el)));
  return matches.find((match) => match.closest(petalSelector(ATTR_PETAL_DROPDOWN)) === dropdown) ?? null;
}

/**
 * Finds the group for a dropdown inside a dropdown-group element, creating it on first use
 */
function getGroup(dropdown: HTMLElement, groups: Map<HTMLElement, DropdownGroup>): DropdownGroup | null {
  const groupEl = dropdown.parentElement?.closest<HTMLElement>(petalSelector(ATTR_PETAL_DROPDOWN_GROUP));
  if (!groupEl) return null;

  // A dropdown nested inside another dropdown of the group isn't a member, so it doesn't close its parent
  const parentDropdown = dropdown.parentElement?.closest(petalSelector(ATTR_PETAL_DROPDOWN));
  if (parentDropdown && groupEl.contains(parentDropdown)) return null;

  let group = groups.get(groupEl);
  if (!group) {
    group = new DropdownGroup(groupEl.querySelector<HTMLElement>(petalSelector(ATTR_PETAL_DROPDOWN_GROUP_BG)));
    groups.set(groupEl, group);
  }
  return group;
}

/**
 * Initialize all dropdowns on the page
 */
export function initializeAllDropdowns(): void {
  const dropdowns = document.querySelectorAll<HTMLElement>(petalSelector(ATTR_PETAL_DROPDOWN));
  const groups = new Map<HTMLElement, DropdownGroup>();
  const controllers: DropdownController[] = [];

  dropdowns.forEach((dropdown, index) => {
    // ===========================
    // Configuration
    // ===========================
    const config = parseDropdownConfig(dropdown);

    debug(config.debug, "DROPDOWN", `Processing ${config.name} (${index + 1}/${dropdowns.length})`);
    logConfig(config);

    // ===========================
    // Element References
    // ===========================
    const toggle = getOwnElement(dropdown, ATTR_PETAL_DROPDOWN_TOGGLE);
    const menu = getOwnElement(dropdown, ATTR_PETAL_DROPDOWN_MENU);
    const caret = getOwnElement(dropdown, ATTR_PETAL_DROPDOWN_CARET);

    if (!toggle || !menu) {
      console.error(`[ERROR] Dropdown "${config.name}" is missing required elements. Ensure dropdown-toggle and dropdown-menu are present.`);
      return;
    }

    debugElements(config.debug, "DROPDOWN", "toggle", toggle);
    debugElements(config.debug, "DROPDOWN", "menu", menu);
    debugElements(config.debug, "DROPDOWN", "caret", caret);

    const openTriggers = findTriggers(dropdown, ATTR_PETAL_TRIGGER_OPEN);
    const closeTriggers = findTriggers(dropdown, ATTR_PETAL_TRIGGER_CLOSE);
    const toggleTriggers = findTriggers(dropdown, ATTR_PETAL_TRIGGER_TOGGLE);

    debugElements(config.debug, "DROPDOWN", "open trigger", openTriggers);
    debugElements(config.debug, "DROPDOWN", "close trigger", closeTriggers);
    debugElements(config.debug, "DROPDOWN", "toggle trigger", toggleTriggers);

    // ===========================
    // Initialization
    // ===========================
    const group = getGroup(dropdown, groups);
    const controller = new DropdownController({ dropdown, toggle, menu, caret, openTriggers, closeTriggers, toggleTriggers }, config, group);
    group?.add(controller);

    controller.bindEvents();
    controller.applyBreakpoint(true);
    controllers.push(controller);
  });

  // Re-evaluate petal-dropdown-enabled whenever the window crosses a breakpoint
  onBreakpointChange(() => controllers.forEach((controller) => controller.applyBreakpoint()));
}
