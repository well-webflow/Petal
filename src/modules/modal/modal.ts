/**
 * -+-+-+ Modal -+-+-+
 *
 * Handles interactive modal dialogs with support for:
 * - GSAP animations
 * - Optional overlay with configurable opacity
 * - Video pause on close
 * - Session state storage
 * - Open/close triggers
 * - Overlay click-to-close
 */
declare const Webflow: any;
declare const Vimeo: any;

import { ATTR_PETAL_MODAL, ATTR_PETAL_NAME, ATTR_PETAL_DIALOG, ATTR_PETAL_TRIGGER, ATTR_PETAL_STATE } from "../../lib/attributes";
import { findPetalElementByNameOrInParent, getAllPetalElementsOfType, findClosestPetalParent, findTriggersByNameOrInParent, pauseVideo } from "../../lib/helpers";
import { parseModalConfig, logConfig, ModalConfig } from "./modal-config";
import { debug, debugElements } from "../../lib/debug";
import { storeClosedState, storeMemoryWithExpiration, checkMemory } from "../../lib/memory";
import { lockScroll, unlockScroll } from "../../lib/scroll-lock";

export interface ModalElements {
  modal: HTMLElement;
  dialog: HTMLElement;
  openTriggers: NodeListOf<HTMLElement>;
  closeTriggers: NodeListOf<HTMLElement>;
  toggleTriggers: NodeListOf<HTMLElement>;
}

/**
 * Modal Controller
 * Manages modal state and orchestrates opening/closing logic with animations.
 */
class ModalController {
  private lastWidth: number = window.innerWidth;
  private lastHeight: number = window.innerHeight;
  private resizeHandler: (() => void) | null = null;
  private vimeoPlayer: any = null;

  constructor(
    private elements: ModalElements,
    private config: ModalConfig,
  ) {
    this.initializeVimeoPlayer();
  }

  /**
   * Opens the modal using GSAP
   */
  open = (): void => {
    try {
      // Set state to open
      this.elements.modal.setAttribute(ATTR_PETAL_STATE, "open");

      // Lock scroll if configured
      if (this.config.lockScroll) {
        lockScroll();
      }

      // Setup resize handler if close-on-resize is enabled
      if (this.config.closeOnResize) {
        this.setupResizeHandler();
      }

      // Play Vimeo video if autoplay is enabled
      if (this.config.videoAutoplay && this.vimeoPlayer) {
        this.vimeoPlayer.play().catch(() => {
          // Silently handle autoplay errors
        });
      }

      // Trigger the GSAP animation in Webflow
      const wfIx = Webflow.require("ix3");
      wfIx.emit(this.config.animOpen);
    } catch (error) {
      // If animation fails, unlock scroll to prevent permanent lock
      if (this.config.lockScroll) {
        unlockScroll();
      }
      console.error(`[ERROR] Modal "${this.config.name}" - Failed to open:`, error);
    }
  };

  /**
   * Closes the modal using GSAP
   */
  close = (): void => {
    try {
      // Set state to closed
      this.elements.modal.setAttribute(ATTR_PETAL_STATE, "closed");

      // Unlock scroll if configured
      if (this.config.lockScroll) {
        unlockScroll();
      }

      // Remove resize handler if it exists
      if (this.resizeHandler) {
        window.removeEventListener("resize", this.resizeHandler);
        this.resizeHandler = null;
      }

      // Pause Vimeo video if autopause is enabled
      if (this.config.videoAutopause && this.vimeoPlayer) {
        this.vimeoPlayer.pause().catch(() => {
          // Silently handle pause errors
        });
      }

      // Pause any videos inside the modal
      pauseVideo(this.elements.modal);

      // Store modal closed state (session storage)
      storeClosedState("modal", this.config.name);

      // Store memory with expiration if memory is enabled
      if (this.config.memory.enabled && this.config.memory.expires) {
        storeMemoryWithExpiration("modal", this.config.name, this.config.memory.expires);
      }

      // Trigger the GSAP animation in Webflow
      const wfIx = Webflow.require("ix3");
      wfIx.emit(this.config.animClose);
    } catch (error) {
      console.error(`[ERROR] Modal "${this.config.name}" - Failed to close:`, error);
    }
  };

  /**
   * Setup resize handler to close modal on window dimension changes
   */
  private setupResizeHandler = (): void => {
    // Reset tracked dimensions when setting up
    this.lastWidth = window.innerWidth;
    this.lastHeight = window.innerHeight;

    // Create and store the handler
    this.resizeHandler = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      // Only close if actual dimensions changed
      if (currentWidth !== this.lastWidth || currentHeight !== this.lastHeight) {
        this.close();
      }
    };

    // Add the event listener
    window.addEventListener("resize", this.resizeHandler);
  };

  /**
   * Initialize Vimeo player if present in modal
   */
  private initializeVimeoPlayer = (): void => {
    // Check if Vimeo is available and video autoplay/autopause is enabled
    if (typeof Vimeo === "undefined") {
      return;
    }

    if (!this.config.videoAutoplay && !this.config.videoAutopause) {
      return;
    }

    // Look for Vimeo iframe in modal
    const vimeoIframe = this.elements.modal.querySelector("iframe[src*='vimeo.com']");
    if (vimeoIframe) {
      try {
        this.vimeoPlayer = new Vimeo.Player(vimeoIframe);
      } catch (error) {
        console.error(`[ERROR] Modal "${this.config.name}" - Failed to initialize Vimeo player:`, error);
      }
    }
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

    // Initialize state attribute
    modal.setAttribute(ATTR_PETAL_STATE, "closed");

    // ===========================
    // Element References
    // ===========================
    const dialog = findPetalElementByNameOrInParent(modal, name, ATTR_PETAL_DIALOG);
    const openTriggers = findTriggersByNameOrInParent(modal, name, "open");
    const closeTriggers = findTriggersByNameOrInParent(modal, name, "close");
    const toggleTriggers = findTriggersByNameOrInParent(modal, name, "toggle");

    debugElements(config.debug, "MODAL", "open trigger", openTriggers);
    debugElements(config.debug, "MODAL", "close trigger", closeTriggers);
    debugElements(config.debug, "MODAL", "toggle trigger", toggleTriggers);

    if (!dialog || !openTriggers || !closeTriggers) {
      console.error(`[ERROR] Modal "${name}" is missing required elements. Ensure dialog, open triggers, and close triggers are present.`);
      return;
    }

    const elements: ModalElements = {
      modal,
      dialog,
      openTriggers,
      closeTriggers,
      toggleTriggers,
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

    // Initialize Toggle Triggers
    toggleTriggers?.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const currentState = modal.getAttribute(ATTR_PETAL_STATE);
        if (currentState === "open") {
          controller.close();
        } else {
          controller.open();
        }
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
