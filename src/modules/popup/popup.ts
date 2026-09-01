/**
 * -+-+-+ Popup -+-+-+
 *
 * Handles interactive popup dialogs with support for:
 * - GSAP animations
 * - Optional overlay with configurable opacity
 * - Video pause on close
 * - Session state storage
 * - Open/close triggers
 * - Overlay click-to-close
 */
declare const Webflow: any;
declare const Vimeo: any;

import { ATTR_PETAL_POPUP, ATTR_PETAL_NAME, ATTR_PETAL_TRIGGER, ATTR_PETAL_STATE, ATTR_PETAL_TRIGGER_ANIM_OPEN, ATTR_PETAL_TRIGGER_ANIM_CLOSE, ATTR_PETAL_ELEMENT, ATTR_PETAL_POPUP_BOX, ATTR_PETAL_POPUP_OVERLAY } from "../../lib/attributes";
import { getAllPetalElementsOfType, findClosestPetalParent, findTriggersByNameOrInParent, pauseVideo } from "../../lib/helpers";
import { parsePopupConfig, logConfig, PopupConfig } from "./popup-config";
import { debug, debugElements } from "../../lib/debug";
import { storeClosedState, storeMemoryWithExpiration, checkMemory } from "../../lib/memory";
import { lockScroll, unlockScroll } from "../../lib/scroll-lock";
import { animateIn, animateOut } from "../../lib/animations";

export interface PopupElements {
  popup: HTMLElement;
  box: HTMLElement | null;
  overlay: HTMLElement | null;
  openTriggers: NodeListOf<HTMLElement>;
  closeTriggers: NodeListOf<HTMLElement>;
  toggleTriggers: NodeListOf<HTMLElement>;
}

/**
 * Popup Controller
 * Manages popup state and orchestrates opening/closing logic with animations.
 */
class PopupController {
  private lastWidth: number = window.innerWidth;
  private lastHeight: number = window.innerHeight;
  private resizeHandler: (() => void) | null = null;
  private vimeoPlayer: any = null;

  constructor(
    private elements: PopupElements,
    private config: PopupConfig,
  ) {
    this.initializeVimeoPlayer();
  }

  /**
   * Opens the popup using GSAP or default animations
   */
  open = (): void => {
    try {
      // Set state to open
      this.elements.popup.setAttribute(ATTR_PETAL_STATE, "open");

      // Lock scroll if configured
      if (this.config.lockScroll) {
        lockScroll();
      }

      // Setup resize handler if close-on-resize is enabled
      if (this.config.closeOnResize) {
        this.setupResizeHandler();
      }

      // Play Vimeo video if autoplay is enabled
      if (this.config.video.autoplay && this.vimeoPlayer) {
        this.vimeoPlayer.play().catch(() => {
          // Silently handle autoplay errors
        });
      }

      // Play trigger animations
      this.playTriggerAnimations("open");

      // Check if GSAP animation is defined, otherwise use default animations
      if (this.config.gsapAnimation.open) {
        // Use GSAP animation from Webflow
        const wfIx = Webflow.require("ix3");
        wfIx.emit(this.config.gsapAnimation.open);
      } else {
        // Use default animations
        animateIn(
          this.elements.popup,
          this.config.animation.popup.type,
          this.config.animation.popup.duration,
          this.config.animation.popup.offset,
          this.config.animation.popup.easing
        );

        if (this.elements.overlay) {
          animateIn(
            this.elements.overlay,
            this.config.animation.overlay.type,
            this.config.animation.overlay.duration,
            0,
            this.config.animation.overlay.easing
          );
        }

        if (this.elements.box) {
          animateIn(
            this.elements.box,
            this.config.animation.box.type,
            this.config.animation.box.duration,
            this.config.animation.box.offset,
            this.config.animation.box.easing
          );
        }
      }
    } catch (error) {
      // If animation fails, unlock scroll to prevent permanent lock
      if (this.config.lockScroll) {
        unlockScroll();
      }
      console.error(`[ERROR] Popup "${this.config.name}" - Failed to open:`, error);
    }
  };

  /**
   * Closes the popup using GSAP or default animations
   */
  close = (): void => {
    try {
      // Set state to closed
      this.elements.popup.setAttribute(ATTR_PETAL_STATE, "closed");

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
      if (this.config.video.autopause && this.vimeoPlayer) {
        this.vimeoPlayer.pause().catch(() => {
          // Silently handle pause errors
        });
      }

      // Pause any videos inside the popup
      pauseVideo(this.elements.popup);

      // Store popup closed state (session storage)
      storeClosedState("popup", this.config.name);

      // Store memory with expiration if memory is enabled
      if (this.config.memory.enabled && this.config.memory.expires) {
        storeMemoryWithExpiration("popup", this.config.name, this.config.memory.expires);
      }

      // Play trigger animations
      this.playTriggerAnimations("close");

      // Check if GSAP animation is defined, otherwise use default animations
      if (this.config.gsapAnimation.close) {
        // Use GSAP animation from Webflow
        const wfIx = Webflow.require("ix3");
        wfIx.emit(this.config.gsapAnimation.close);
      } else {
        // Use default animations - animate box and overlay first, then popup
        const onComplete = () => {
          // Animation complete
        };

        if (this.elements.box) {
          animateOut(
            this.elements.box,
            this.config.animation.box.type,
            this.config.animation.box.duration,
            this.config.animation.box.offset,
            this.config.animation.box.easing,
            () => {}
          );
        }

        if (this.elements.overlay) {
          animateOut(
            this.elements.overlay,
            this.config.animation.overlay.type,
            this.config.animation.overlay.duration,
            0,
            this.config.animation.overlay.easing,
            () => {}
          );
        }

        animateOut(
          this.elements.popup,
          this.config.animation.popup.type,
          this.config.animation.popup.duration,
          this.config.animation.popup.offset,
          this.config.animation.popup.easing,
          onComplete
        );
      }
    } catch (error) {
      console.error(`[ERROR] Popup "${this.config.name}" - Failed to close:`, error);
    }
  };

  /**
   * Setup resize handler to close popup on window dimension changes
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
   * Initialize Vimeo player if present in popup
   */
  private initializeVimeoPlayer = (): void => {
    // Check if Vimeo is available and video autoplay/autopause is enabled
    if (typeof Vimeo === "undefined") {
      return;
    }

    if (!this.config.video.autoplay && !this.config.video.autopause) {
      return;
    }

    // Look for Vimeo iframe in popup
    const vimeoIframe = this.elements.popup.querySelector("iframe[src*='vimeo.com']");
    if (vimeoIframe) {
      try {
        this.vimeoPlayer = new Vimeo.Player(vimeoIframe);
      } catch (error) {
        console.error(`[ERROR] Popup "${this.config.name}" - Failed to initialize Vimeo player:`, error);
      }
    }
  };

  /**
   * Play trigger animations based on state
   */
  private playTriggerAnimations = (state: "open" | "close"): void => {
    if (this.config.debug) {
      console.log(`[DEBUG] Popup "${this.config.name}" - Playing ${state} animations on triggers`);
    }

    const wfIx = Webflow.require("ix3");
    const animAttr = state === "open" ? ATTR_PETAL_TRIGGER_ANIM_OPEN : ATTR_PETAL_TRIGGER_ANIM_CLOSE;

    // Play animations on all trigger types
    const allTriggers = [
      ...Array.from(this.elements.openTriggers),
      ...Array.from(this.elements.closeTriggers),
      ...Array.from(this.elements.toggleTriggers),
    ];

    if (this.config.debug) {
      console.log(`[DEBUG] Popup "${this.config.name}" - Found ${allTriggers.length} triggers total`);
    }

    allTriggers.forEach((trigger) => {
      const animName = trigger.getAttribute(animAttr);
      if (this.config.debug) {
        console.log(`[DEBUG] Popup "${this.config.name}" - Trigger animation attribute (${animAttr}):`, animName);
      }
      if (animName) {
        if (this.config.debug) {
          console.log(`[DEBUG] Popup "${this.config.name}" - Emitting trigger animation:`, animName);
        }
        wfIx.emit(animName);
      }
    });
  };
}

/**
 * Initialize all popups on the page
 */
export function initializeAllPopups(): void {
  const popups = getAllPetalElementsOfType(ATTR_PETAL_POPUP);

  popups.forEach((popup, index) => {
    // ===========================
    // Configuration
    // ===========================
    const name = popup.getAttribute(ATTR_PETAL_NAME) || null;

    const config = parsePopupConfig(popup);
    debug(config.debug, "POPUP", `Processing ${name} (${index + 1}/${popups.length})`);
    logConfig(config);

    // Initialize state attribute
    popup.setAttribute(ATTR_PETAL_STATE, "closed");

    // ===========================
    // Element References
    // ===========================
    const openTriggers = findTriggersByNameOrInParent(popup, name, "open");
    const closeTriggers = findTriggersByNameOrInParent(popup, name, "close");
    const toggleTriggers = findTriggersByNameOrInParent(popup, name, "toggle");

    // Find box and overlay for default animations
    const box = popup.querySelector<HTMLElement>(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_POPUP_BOX}"]`);
    const overlay = popup.querySelector<HTMLElement>(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_POPUP_OVERLAY}"]`);

    debugElements(config.debug, "POPUP", "open trigger", openTriggers);
    debugElements(config.debug, "POPUP", "close trigger", closeTriggers);
    debugElements(config.debug, "POPUP", "toggle trigger", toggleTriggers);
    debugElements(config.debug, "POPUP", "box", box);
    debugElements(config.debug, "POPUP", "overlay", overlay);

    if ((!openTriggers || !closeTriggers) && !toggleTriggers) {
      console.error(`[ERROR] Popup "${name}" is missing required elements. Ensure open triggers and close triggers are present.`);
      return;
    }

    const elements: PopupElements = {
      popup,
      box,
      overlay,
      openTriggers,
      closeTriggers,
      toggleTriggers,
    };

    // ===========================
    // Initialization
    // ===========================

    // Create a single controller instance for this popup
    const controller = new PopupController(elements, config);

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
        const currentState = popup.getAttribute(ATTR_PETAL_STATE);
        if (currentState === "open") {
          controller.close();
        } else {
          controller.open();
        }
      });
    });

    // Find and attach close triggers without names (that are children of this popup)
    if (!name) {
      const allCloseTriggers = [...Array.from(document.querySelectorAll<HTMLElement>(`[${ATTR_PETAL_TRIGGER}="close"]`))];
      allCloseTriggers.forEach((trigger) => {
        // Check if this close trigger doesn't have a name and is a child of this popup
        const triggerName = trigger.getAttribute(ATTR_PETAL_NAME);
        if (!triggerName) {
          const parentPopup = findClosestPetalParent(trigger, ATTR_PETAL_POPUP);
          if (parentPopup === popup) {
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
      // Check if popup is in memory (user has closed it and it hasn't expired yet)
      const isInMemory = config.memory.enabled && checkMemory("popup", config.name);

      if (isInMemory) {
        debug(config.debug, "POPUP", `Skipping auto-open for "${name}" - still in memory`);
      } else {
        const delay = config.autoOpenDelay ? config.autoOpenDelay.getTime() - Date.now() : 0;
        debug(config.debug, "POPUP", `Auto-opening "${name}" after ${delay}ms`);

        setTimeout(() => {
          controller.open();
        }, delay);
      }
    }
  });
}
