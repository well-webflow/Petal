/**
 * Dropdown Component
 *
 * Handles interactive dropdown menus with support for:
 * - Click or hover-based opening
 * - Customizable close delays
 * - Grouped dropdown coordination
 * - CSS-based animations
 * - Accessibility (aria-expanded)
 * - Named element linking (petal="name")
 */

import {
  ATTR_PETAL_NAME,
  ATTR_PETAL_ELEMENT,
  ATTR_PETAL_DROPDOWN,
  ATTR_PETAL_DROPDOWN_TOGGLE,
  ATTR_PETAL_DROPDOWN_MENU,
  ATTR_PETAL_DROPDOWN_MENU_BOX,
  ATTR_PETAL_TRIGGER_CLOSE,
  ATTR_PETAL_STATE,
  ARIA_EXPANDED,
  ATTR_PETAL_OVERLAY,
} from "../../lib/attributes";
import { parseDropdownConfig, logConfig, DropdownConfig } from "./dropdown-config";
import { DropdownController } from "./dropdown-controller";
import type { DropdownElements } from "./dropdown-animator";
import { findPetalElementByNameOrInParent } from "../../lib/helpers";
import { debug, debugElements } from "../../lib/debug";
import { BREAKPOINT_TABLET, getCurrentSettingValue } from "lib/setting";

export function initializeDropdowns() {
  const init = () => {
    const dropdowns = document.querySelectorAll(`[${ATTR_PETAL_ELEMENT}='${ATTR_PETAL_DROPDOWN}']`);

    dropdowns.forEach((dropdown, index) => {
      // Get the name attribute from the dropdown container
      const petalName = dropdown.getAttribute(ATTR_PETAL_NAME);

      // ===========================
      // Configuration
      // ===========================

      const config = parseDropdownConfig(dropdown);
      logConfig(index, config);

      // ===========================
      // Elements
      // ===========================

      const toggle = findPetalElementByNameOrInParent(dropdown, petalName, ATTR_PETAL_DROPDOWN_TOGGLE);
      const menu = findPetalElementByNameOrInParent(dropdown, petalName, ATTR_PETAL_DROPDOWN_MENU);
      const drawer = findPetalElementByNameOrInParent(dropdown, petalName, ATTR_PETAL_DROPDOWN_MENU_BOX);
      const overlay = findPetalElementByNameOrInParent(dropdown, petalName, ATTR_PETAL_OVERLAY);
      const close = findPetalElementByNameOrInParent(dropdown, petalName, ATTR_PETAL_TRIGGER_CLOSE);

      // Validate required elements
      if (!toggle || !menu || !drawer) {
        console.warn(`Dropdown ${petalName} is missing elements and won't work properly. Please make sure the dropdown has a toggle, menu, and drawer.`);
        return;
      }

      const elements: DropdownElements = { dropdown, toggle, menu, drawer, overlay };

      if (config.debug) {
        console.log(`\n=== Initializing Dropdown ${index + 1} ===`);
        if (petalName) {
          console.log(`Dropdown ${index + 1} - Name: "${petalName}"`);
        }
        debugElements(config.debug, "DROPDOWN", "toggle", toggle);
        debugElements(config.debug, "DROPDOWN", "menu", menu);
        debugElements(config.debug, "DROPDOWN", "drawer", drawer);
        debugElements(config.debug, "DROPDOWN", "overlay", overlay);
        debugElements(config.debug, "DROPDOWN", "close", close);
      }

      // ===========================
      // Controller Setup
      // ===========================

      const controller = new DropdownController(elements, config, index);

      // ===========================
      // Initialization
      // ===========================

      // Set initial aria-expanded state and ensure dropdown is closed
      toggle.setAttribute(ARIA_EXPANDED, "false");
      dropdown.setAttribute(ATTR_PETAL_STATE, "closed");

      // ===========================
      // Event Listeners
      // ===========================

      // Event listener references
      const mouseEnterHandler = () => {
        controller.open();
      };

      const mouseLeaveHandler = () => {
        controller.close();
      };

      const clickOutsideHandler = (event: MouseEvent) => {
        controller.handleOutsideClick(event, dropdown);
      };

      // Function to attach/detach event listeners based on hover mode
      const updateEventListeners = () => {
        const previousMode = controller.getOpenOnHover();
        const modeChanged = controller.updateOpenOnHover();

        if (modeChanged) {
          const newMode = controller.getOpenOnHover();
          debug(config.debug, "DROPDOWN", `Dropdown ${index + 1} - Switching interaction mode to ${newMode ? "hover" : "click"}`);

          // Remove old listeners
          if (previousMode) {
            dropdown.removeEventListener("mouseenter", mouseEnterHandler);
            dropdown.removeEventListener("mouseleave", mouseLeaveHandler);
          } else {
            toggle.removeEventListener("click", controller.toggle);
            document.removeEventListener("click", clickOutsideHandler);
          }

          // Attach new listeners
          if (newMode) {
            dropdown.addEventListener("mouseenter", mouseEnterHandler);
            dropdown.addEventListener("mouseleave", mouseLeaveHandler);
          } else {
            toggle.addEventListener("click", controller.toggle);
            document.addEventListener("click", clickOutsideHandler);
          }
        }
      };

      // Reinitialize drawer position on window resize and update event listeners
      const handleResize = () => {
        controller.handleResize();
        updateEventListeners();
      };
      window.addEventListener("resize", handleResize);

      // Initial event listener setup
      const initialOpenOnHover = controller.getOpenOnHover();
      if (initialOpenOnHover) {
        dropdown.addEventListener("mouseenter", mouseEnterHandler);
        dropdown.addEventListener("mouseleave", mouseLeaveHandler);
      } else {
        toggle.addEventListener("click", controller.toggle);
        document.addEventListener("click", clickOutsideHandler);
      }

      // Attach click listener to dropdown-close element (if it exists)
      if (close) {
        close.addEventListener("click", (event) => {
          event.stopPropagation();
          controller.close();
        });
      }
    });
  };

  // Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
