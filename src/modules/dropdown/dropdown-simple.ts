/**
 * -+-+-+ Simple Dropdown -+-+-+
 *
 * Handles interactive simple dropdown components with support for:
 * - Click to toggle open/close
 * - GSAP animations (fade, slide)
 * - Caret rotation animation
 * - Start-open configuration
 * - Configurable animation duration and offset
 */

import { ATTR_PETAL_ELEMENT, ATTR_PETAL_STATE } from "../../lib/attributes";
import { debug, debugElements } from "../../lib/debug";
import {
  parseDropdownConfig,
  logConfig,
  DropdownConfig,
  ATTR_PETAL_DROPDOWN,
  ATTR_PETAL_DROPDOWN_TOGGLE,
  ATTR_PETAL_DROPDOWN_MENU,
  ATTR_PETAL_DROPDOWN_CARET,
} from "./dropdown-config";
import { animateIn, animateOut } from "../../lib/animations";

export interface DropdownElements {
  dropdown: HTMLElement;
  toggle: HTMLElement;
  menu: HTMLElement;
  caret: HTMLElement | null;
}

/**
 * Simple Dropdown Controller
 * Manages dropdown state and toggle behavior with animations.
 */
class DropdownController {
  private isAnimating: boolean = false;

  constructor(
    private elements: DropdownElements,
    private config: DropdownConfig
  ) {}

  /**
   * Toggle the dropdown open/closed
   */
  toggle = (): void => {
    if (this.isAnimating) return;

    const isOpen = this.elements.menu.getAttribute(ATTR_PETAL_STATE) === "open";

    if (isOpen) {
      this.close();
    } else {
      this.open();
    }
  };

  /**
   * Open the dropdown with animation
   */
  open = (): void => {
    if (this.isAnimating || this.elements.menu.getAttribute(ATTR_PETAL_STATE) === "open") {
      return;
    }

    this.isAnimating = true;
    this.elements.menu.setAttribute(ATTR_PETAL_STATE, "open");

    // Rotate caret if present
    if (this.elements.caret) {
      this.elements.caret.style.transform = "scaleY(-1)";
    }

    animateIn(
      this.elements.menu,
      this.config.animation.type,
      this.config.animation.duration,
      this.config.animation.offset,
      this.config.animation.easing
    );

    this.isAnimating = false;
  };

  /**
   * Close the dropdown with animation
   */
  close = (): void => {
    if (this.isAnimating || this.elements.menu.getAttribute(ATTR_PETAL_STATE) === "closed") {
      return;
    }

    this.isAnimating = true;
    this.elements.menu.setAttribute(ATTR_PETAL_STATE, "closed");

    // Rotate caret back if present
    if (this.elements.caret) {
      this.elements.caret.style.transform = "none";
    }

    animateOut(
      this.elements.menu,
      this.config.animation.type,
      this.config.animation.duration,
      this.config.animation.offset,
      this.config.animation.easing,
      () => {
        this.isAnimating = false;
      }
    );
  };
}

/**
 * Initialize all simple dropdowns on the page
 */
export function initializeSimpleDropdowns(): void {
  const dropdowns = document.querySelectorAll<HTMLElement>(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_DROPDOWN}"]`);

  dropdowns.forEach((dropdown, index) => {
    // ===========================
    // Configuration
    // ===========================
    const config = parseDropdownConfig(dropdown);

    // Skip mega dropdowns - they're handled separately
    if (config.type === "mega") return;

    debug(config.debug, "DROPDOWN", `Processing ${config.name} (${index + 1}/${dropdowns.length})`);
    logConfig(config);

    // ===========================
    // Element References
    // ===========================
    const toggle = dropdown.querySelector<HTMLElement>(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_DROPDOWN_TOGGLE}"]`);
    const menu = dropdown.querySelector<HTMLElement>(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_DROPDOWN_MENU}"]`);
    const caret = dropdown.querySelector<HTMLElement>(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_DROPDOWN_CARET}"]`);

    if (!toggle || !menu) {
      console.error(
        `[ERROR] Dropdown "${config.name}" is missing required elements. Ensure dropdown-toggle and dropdown-menu are present.`
      );
      return;
    }

    debugElements(config.debug, "DROPDOWN", "toggle", toggle);
    debugElements(config.debug, "DROPDOWN", "menu", menu);
    debugElements(config.debug, "DROPDOWN", "caret", caret);

    const elements: DropdownElements = {
      dropdown,
      toggle,
      menu,
      caret,
    };

    // ===========================
    // Initialization
    // ===========================
    const controller = new DropdownController(elements, config);

    // Set initial state and hide menu by default
    menu.setAttribute(ATTR_PETAL_STATE, "closed");
    if (!config.startOpen) {
      menu.style.display = "none";
    }

    // Add click listener
    toggle.addEventListener("click", () => {
      controller.toggle();
    });

    // Handle start-open
    if (config.startOpen) {
      debug(config.debug, "DROPDOWN", `Opening "${config.name}" on initialization (start-open)`);
      controller.open();
    }
  });
}
