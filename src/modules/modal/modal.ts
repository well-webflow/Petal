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
 * HTML Elements (defined in attributes.ts):
 * - petal-el="modal" - Container element (required)
 * - petal-el="dialog" - Dialog content (required)
 * - petal-el="overlay" - Background overlay (optional)
 * - petal-trigger="open" - Open trigger (requires petal="name" on trigger if outside modal)
 * - petal-trigger="close" - Close trigger (auto-detects parent modal if no name)
 *
 * HTML Attributes (defined in attributes.ts):
 * - petal-overlay-close="true" - Enable overlay click-to-close (default: true)
 * - petal-auto-open="true" - Enable auto-open on page load (default: false)
 * - petal-auto-open-delay="5000" - Delay in milliseconds before auto-opening (default: 0)
 * - petal-debug="true" - Enable debug logging
 */
declare const Webflow: any;

import { ATTR_PETAL_MODAL, ATTR_PETAL_NAME, ATTR_PETAL_DIALOG, ATTR_PETAL_TRIGGER } from "../../lib/attributes";
import { findPetalElementByNameOrInParent, getAllPetalElementsOfType, findClosestPetalParent, findTriggersByNameOrInParent } from "../../lib/helpers";
import { parseModalConfig, logConfig, ModalConfig } from "./modal-config";
import { debug, debugElements } from "../../lib/debug";
import { storeClosedState, storeMemoryWithExpiration, checkMemory } from "../../lib/memory";
import { pauseVideo } from "../../video";
import { lockScroll, unlockScroll } from "../../lib/scroll-lock";

export interface ModalElements {
  modal: HTMLElement;
  dialog: HTMLElement;
  openTriggers: NodeListOf<HTMLElement>;
  closeTriggers: NodeListOf<HTMLElement>;
}

/**
 * Modal Controller
 * Manages modal state and orchestrates opening/closing logic with animations.
 */
class ModalController {
  constructor(
    private elements: ModalElements,
    private config: ModalConfig,
  ) {}

  /**
   * Opens the modal using GSAP
   */
  open = (): void => {
    // Lock scroll if configured
    if (this.config.lockScroll) {
      lockScroll();
      if (this.config.debug) console.log(`[DEBUG] Modal "${this.config.name}" - Locked scroll`);
    }
    // Trigger the GSAP animation in Webflow
    const wfIx = Webflow.require("ix3");
    wfIx.emit(this.config.animOpen);
  };

  /**
   * Closes the modal using GSAP
   */
  close = (): void => {
    // Unlock scroll if configured
    if (this.config.lockScroll) {
      unlockScroll();
      if (this.config.debug) console.log(`[DEBUG] Modal "${this.config.name}" - Unlocked scroll`);
    }

    // Pause any videos inside the modal
    pauseVideo(this.elements.modal);

    // Store modal closed state (session storage)
    storeClosedState("modal", this.config.name);

    // Store memory with expiration if memory is enabled
    if (this.config.memory.enabled && this.config.memory.expires) {
      storeMemoryWithExpiration("modal", this.config.name, this.config.memory.expires);
      if (this.config.debug) {
        console.log(`[DEBUG] Modal "${this.config.name}" - Stored in memory until ${this.config.memory.expires.toISOString()}`);
      }
    }

    // Trigger the GSAP animation in Webflow
    const wfIx = Webflow.require("ix3");
    console.log(`[DEBUG] Modal "${this.config.name}" - Closing with animation "${this.config.animClose}"`);
    wfIx.emit(this.config.animClose);
  };
}

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
    const dialog = findPetalElementByNameOrInParent(modal, name, ATTR_PETAL_DIALOG);
    const openTriggers = findTriggersByNameOrInParent(modal, name, "open");
    const closeTriggers = findTriggersByNameOrInParent(modal, name, "close");

    debugElements(config.debug, "MODAL", "open trigger", openTriggers);
    debugElements(config.debug, "MODAL", "close trigger", closeTriggers);

    if (!dialog || !openTriggers || !closeTriggers) {
      console.error(`[ERROR] Modal "${name}" is missing required elements. Ensure dialog, open triggers, and close triggers are present.`);
      return;
    }

    const elements: ModalElements = {
      modal,
      dialog,
      openTriggers,
      closeTriggers,
    };

    // ===========================
    // Initialization
    // ===========================

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
      const allCloseTriggers = [...Array.from(document.querySelectorAll<HTMLElement>(`[${ATTR_PETAL_TRIGGER}="close"]`))];
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

    // ===========================
    // Auto Open
    // ===========================
    if (config.autoOpen) {
      // Check if modal is in memory (user has closed it and it hasn't expired yet)
      const isInMemory = config.memory.enabled && checkMemory("modal", config.name);

      if (isInMemory) {
        debug(config.debug, "MODAL", `Skipping auto-open for "${name}" - still in memory`);
      } else {
        const delay = config.autoOpenDelay ? config.autoOpenDelay.getTime() - Date.now() : 0;
        debug(config.debug, "MODAL", `Auto-opening "${name}" after ${delay}ms`);

        setTimeout(() => {
          controller.open();
        }, delay);
      }
    }
  });
}
