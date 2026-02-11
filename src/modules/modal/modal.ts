/**
 * Modal Component
 *
 * Handles interactive modal dialogs with support for:
 * - GSAP animations
 * - Optional overlay with configurable opacity
 * - Video pause on close
 * - Session state storage
 * - Open/close triggers
 * - Overlay click-to-close
 *
 * HTML Attributes (defined in attributes.ts):
 * - petal-el="modal" - Container element (required)
 * - petal-el="dialog" - Dialog content (required)
 * - petal-el="overlay" - Background overlay (optional)
 * - petal="name" - Modal identifier (optional)
 * - petal-el="open" - Open trigger (requires petal="name" on trigger if outside modal)
 * - petal-el="trigger-close" - Close trigger (auto-detects parent modal if no name)
 * - petal-overlay-close="true" - Enable overlay click-to-close (default: true)
 * - petal-overlay-opacity="0.15" - Overlay opacity (default: 0.15)
 * - petal-modal-type="center|left|right|top|bottom" - Modal position type (default: center)
 * - petal-debug="true" - Enable debug logging
 */

import { ATTR_PETAL_MODAL, ATTR_PETAL_NAME, ATTR_PETAL_TRIGGER_CLOSE, ATTR_PETAL_OVERLAY_CLOSE, ATTR_PETAL_DIALOG, ATTR_PETAL_OVERLAY, ATTR_PETAL_TRIGGER_OPEN } from "../../lib/attributes";
import { findPetalElementByNameOrInParent, findPetalElementsByNameOrInParent, getAllPetalElementsOfType, findClosestPetalParent } from "../../lib/helpers";
import { parseModalConfig, logConfig } from "./modal-config";
import { ModalController } from "./modal-controller";
import { initializeElements } from "./modal-animator";
import type { ModalElements } from "./modal-animator";
import { debug, debugElements } from "../../lib/debug";

/**
 * Initialize all modals on the page
 */
export function initializeAllModals(): void {
  const modals = getAllPetalElementsOfType(ATTR_PETAL_MODAL);

  modals.forEach((modal, index) => {
    // ===========================
    // Configuration
    // ===========================
    const name = modal.getAttribute(ATTR_PETAL_NAME) || null;

    const config = parseModalConfig(modal);
    debug(config.debug, "MODAL", `Processing ${name} (${index + 1}/${modals.length})`);
    logConfig(config);

    // ===========================
    // Element References
    // ===========================
    const overlay = findPetalElementByNameOrInParent(modal, name, ATTR_PETAL_OVERLAY);
    const dialog = findPetalElementByNameOrInParent(modal, name, ATTR_PETAL_DIALOG);
    const openTriggers = findPetalElementsByNameOrInParent(modal, name, ATTR_PETAL_TRIGGER_OPEN);
    const closeTriggers = findPetalElementsByNameOrInParent(modal, name, ATTR_PETAL_TRIGGER_CLOSE);

    debugElements(config.debug, "MODAL", "overlay", overlay);
    debugElements(config.debug, "MODAL", "open trigger", openTriggers);
    debugElements(config.debug, "MODAL", "close trigger", closeTriggers);

    if (!dialog) {
      console.warn(`⚠️ [MODAL] Skipping modal "${name}" - missing dialog`);
      return;
    }

    // ===========================
    // Initialization
    // ===========================
    const elements: ModalElements = {
      modal: modal as HTMLElement,
      dialog,
      mask: overlay,
    };

    // Create a single controller instance for this modal
    const controller = new ModalController(elements, config);

    // Initialize Open Triggers
    openTriggers?.forEach((trigger, triggerIndex) => {
      trigger.addEventListener("click", () => {
        controller.open();
      });
    });

    // Initialize Close Triggers
    closeTriggers?.forEach((trigger, triggerIndex) => {
      trigger.addEventListener("click", () => {
        controller.close();
      });
    });

    // Find and attach close triggers without names (that are children of this modal)
    if (!name) {
      const allCloseTriggers = [...Array.from(getAllPetalElementsOfType(ATTR_PETAL_TRIGGER_CLOSE))];
      allCloseTriggers.forEach((trigger) => {
        // Check if this close trigger doesn't have a name and is a child of this modal
        const triggerName = trigger.getAttribute(ATTR_PETAL_NAME);
        if (!triggerName) {
          const parentModal = findClosestPetalParent(trigger, ATTR_PETAL_MODAL);
          if (parentModal === modal) {
            trigger.addEventListener("click", () => {
              controller.close();
            });
          }
        }
      });
    }

    // Initialize Overlay Close Trigger
    const overlayCloseAttr = modal.getAttribute(ATTR_PETAL_OVERLAY_CLOSE);
    const overlayClose = overlayCloseAttr === null ? true : overlayCloseAttr === "true";
    if (overlay && overlayClose) {
      overlay.addEventListener("click", () => {
        controller.close();
      });
    }

    initializeElements(elements, config);
  });
}
