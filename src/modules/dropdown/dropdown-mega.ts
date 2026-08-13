/**
 * -+-+-+ Mega Dropdown -+-+-+
 *
 * Initializes mega dropdown menus with animated background and hover interactions.
 *
 * This function creates an interactive mega dropdown system that:
 * - Opens dropdowns on hover with a smooth animated background
 * - Manages only one active dropdown at a time
 * - Includes a delay before closing to improve user experience
 * - GSAP animations (fade, slide) support
 * - Disables on mobile devices (screens < 991px)
 */

import { ATTR_PETAL_ELEMENT } from "../../lib/attributes";
import { debug } from "../../lib/debug";
import {
  parseDropdownConfig,
  logConfig,
  ATTR_PETAL_DROPDOWN,
  ATTR_PETAL_DROPDOWN_TOGGLE,
  ATTR_PETAL_DROPDOWN_MENU,
  ATTR_PETAL_DROPDOWN_BG,
  ATTR_PETAL_DROPDOWN_TYPE,
  DropdownConfig,
} from "./dropdown-config";
import { animateIn, animateOut } from "../../lib/animations";

/**
 * Initialize all mega dropdowns on the page
 */
export function initializeMegaDropdowns(): void {
  // Delay in milliseconds before closing dropdowns when mouse leaves
  const DELAY = 0;
  // Media query to detect mobile devices
  const isMobile = window.matchMedia("(max-width: 991px)");

  // Find all mega dropdown elements and the shared background element
  const dropdowns = document.querySelectorAll<HTMLElement>(
    `[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_DROPDOWN}"][${ATTR_PETAL_DROPDOWN_TYPE}="mega"]`
  );
  const bg = document.querySelector<HTMLElement>(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_DROPDOWN_BG}"]`);

  // Exit early if no dropdowns or background element found
  if (!dropdowns.length || !bg) return;

  // Track the currently active dropdown
  let activeDropdown: Element | null = null;
  let activeConfig: DropdownConfig | null = null;
  // Track the timeout ID for delayed closing
  let closeTimeout: ReturnType<typeof setTimeout> | null = null;

  // Initialize background height to 0
  bg.style.height = "0px";

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

    // Open dropdown when hovering over the toggle element
    if (toggle) toggle.addEventListener("mouseenter", () => openDropdown(dropdown, config));

    if (menu) {
      // Cancel close when mouse enters the menu (prevents premature closing)
      menu.addEventListener("mouseenter", cancelClose);
      // Schedule close when mouse leaves the menu
      menu.addEventListener("mouseleave", closeAll);
    }

    // Schedule close when mouse leaves the entire dropdown
    dropdown.addEventListener("mouseleave", closeAll);
  });

  // Cancel close when mouse enters the background
  bg.addEventListener("mouseenter", cancelClose);
  // Schedule close when mouse leaves the background
  bg.addEventListener("mouseleave", closeAll);
}
