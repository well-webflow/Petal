/**
 * -+-+-+ Mega Dropdown -+-+-+
 *
 * Initializes mega dropdown menus with animated background and click/hover interactions.
 *
 * This function creates an interactive mega dropdown system that:
 * - Opens dropdowns on hover or click with a smooth animated background
 * - Manages only one active dropdown at a time
 * - Includes a delay before closing (hover mode) to improve user experience
 * - Click outside to close (click mode)
 * - GSAP animations (fade, slide) support
 * - Disables on mobile devices (screens < 991px)
 */

import { ATTR_PETAL_ELEMENT } from "../../lib/attributes";
import {
  parseDropdownConfig,
  ATTR_PETAL_DROPDOWN,
  ATTR_PETAL_DROPDOWN_TOGGLE,
  ATTR_PETAL_DROPDOWN_MENU,
  ATTR_PETAL_DROPDOWN_BG,
  ATTR_PETAL_DROPDOWN_TYPE,
  DropdownConfig,
} from "./dropdown-config";
import { animateIn, animateOut, clearAnimation } from "../../lib/animations";

const BG_SELECTOR = `[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_DROPDOWN_BG}"]`;

/**
 * Finds the background element closest to a dropdown by walking up its ancestors
 */
function findBackground(dropdown: HTMLElement): HTMLElement | null {
  let el = dropdown.parentElement;
  while (el) {
    const bg = el.querySelector<HTMLElement>(BG_SELECTOR);
    if (bg) return bg;
    el = el.parentElement;
  }
  return null;
}

/**
 * Initialize all mega dropdowns on the page
 * Dropdowns are grouped by their nearest background element, so each nav works independently
 */
export function initializeMegaDropdowns(): void {
  const dropdowns = document.querySelectorAll<HTMLElement>(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_DROPDOWN}"][${ATTR_PETAL_DROPDOWN_TYPE}="mega"]`);

  const groups = new Map<HTMLElement, HTMLElement[]>();
  dropdowns.forEach((dropdown) => {
    const bg = findBackground(dropdown);
    if (!bg) return;
    const group = groups.get(bg) ?? [];
    group.push(dropdown);
    groups.set(bg, group);
  });

  groups.forEach((group, bg) => initializeMegaGroup(group, bg));
}

/**
 * Initialize a group of mega dropdowns that share a background element
 */
function initializeMegaGroup(dropdowns: HTMLElement[], bg: HTMLElement): void {
  // Delay in milliseconds before closing dropdowns when mouse leaves
  const DELAY = 0;
  // Media query to detect mobile devices
  const isMobile = window.matchMedia("(max-width: 991px)");

  // Track the currently active dropdown
  let activeDropdown: Element | null = null;
  let activeConfig: DropdownConfig | null = null;
  // Track the timeout ID for delayed closing
  let closeTimeout: ReturnType<typeof setTimeout> | null = null;

  const menus = dropdowns
    .map((dropdown) => dropdown.querySelector<HTMLElement>(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_DROPDOWN_MENU}"]`))
    .filter((menu): menu is HTMLElement => menu !== null);

  /**
   * Resets all menus for the current breakpoint
   * Desktop: menus are hidden until opened. Mobile: menu visibility is left to CSS
   */
  function applyBreakpoint() {
    cancelClose();
    activeDropdown = null;
    activeConfig = null;
    bg.style.height = "0px";

    menus.forEach((menu) => {
      clearAnimation(menu);
      if (!isMobile.matches) menu.style.display = "none";
    });
  }

  /**
   * Opens a dropdown menu and animates the background to match its height
   */
  function openDropdown(dropdown: Element, config: DropdownConfig) {
    // Don't open dropdowns on mobile devices
    if (isMobile.matches) return;
    // Cancel any pending close operation
    if (closeTimeout !== null) clearTimeout(closeTimeout);
    // Don't reopen if already active
    if (activeDropdown === dropdown) return;
    // Close the currently active dropdown before opening a new one
    if (activeDropdown && activeConfig) closeDropdown(activeDropdown, activeConfig);

    // Set this dropdown as active
    activeDropdown = dropdown;
    activeConfig = config;

    // Find the dropdown menu element
    const menu = dropdown.querySelector<HTMLElement>(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_DROPDOWN_MENU}"]`);
    if (!menu) return;

    // Animate menu in
    animateIn(menu, config.animation.type, config.animation.duration, config.animation.offset, config.animation.easing);

    // Use double requestAnimationFrame to ensure DOM has updated before measuring height
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Measure the menu height and animate the background to match
        const height = menu.getBoundingClientRect().height;
        bg!.style.height = `${height}px`;
      });
    });
  }

  /**
   * Closes a dropdown menu by hiding it
   */
  function closeDropdown(dropdown: Element, config: DropdownConfig) {
    const menu = dropdown.querySelector<HTMLElement>(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_DROPDOWN_MENU}"]`);
    if (!menu) return;

    // Animate menu out
    animateOut(menu, config.animation.type, config.animation.duration, config.animation.offset, config.animation.easing, () => {
      // Callback after animation completes
    });
  }

  /**
   * Schedules all dropdowns to close after a delay
   * This allows users to move between the dropdown and background without closing
   */
  function closeAll() {
    closeTimeout = setTimeout(() => {
      // Close the active dropdown if one exists
      if (activeDropdown && activeConfig) closeDropdown(activeDropdown, activeConfig);
      // Reset the background height
      bg!.style.height = "0px";
      // Clear the active dropdown reference
      activeDropdown = null;
      activeConfig = null;
    }, DELAY);
  }

  /**
   * Cancels any pending close operation
   * Called when mouse re-enters a dropdown or background area
   */
  function cancelClose() {
    if (closeTimeout !== null) clearTimeout(closeTimeout);
  }

  // Set up event listeners for each dropdown
  dropdowns.forEach((dropdown) => {
    const config = parseDropdownConfig(dropdown);

    const toggle = dropdown.querySelector(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_DROPDOWN_TOGGLE}"]`);
    const menu = dropdown.querySelector(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_DROPDOWN_MENU}"]`);

    if (config.interaction === "hover") {
      // HOVER MODE: Open on mouseenter
      if (toggle) toggle.addEventListener("mouseenter", () => openDropdown(dropdown, config));

      if (menu) {
        // Cancel close when mouse enters the menu (prevents premature closing)
        menu.addEventListener("mouseenter", cancelClose);
        // Schedule close when mouse leaves the menu
        menu.addEventListener("mouseleave", closeAll);
      }

      // Schedule close when mouse leaves the entire dropdown
      dropdown.addEventListener("mouseleave", closeAll);
    } else if (config.interaction === "click") {
      // CLICK MODE: Toggle on click
      if (toggle) {
        toggle.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent event bubbling

          // If this dropdown is already active, close it
          if (activeDropdown === dropdown) {
            if (activeConfig) closeDropdown(activeDropdown, activeConfig);
            bg!.style.height = "0px";
            activeDropdown = null;
            activeConfig = null;
          } else {
            // Otherwise open it
            openDropdown(dropdown, config);
          }
        });
      }

      // Close when clicking outside
      document.addEventListener("click", (e) => {
        if (activeDropdown && !activeDropdown.contains(e.target as Node) && !bg!.contains(e.target as Node)) {
          if (activeConfig) closeDropdown(activeDropdown, activeConfig);
          bg!.style.height = "0px";
          activeDropdown = null;
          activeConfig = null;
        }
      });
    }
  });

  // Background interactions (only for hover mode)
  bg.addEventListener("mouseenter", cancelClose);
  bg.addEventListener("mouseleave", closeAll);

  // Set initial state and reset whenever the window crosses the mobile breakpoint
  applyBreakpoint();
  isMobile.addEventListener("change", applyBreakpoint);
}
