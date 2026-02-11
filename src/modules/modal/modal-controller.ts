/**
 * Modal Controller Module
 *
 * Manages modal state and orchestrates opening/closing logic with animations.
 */

import { storeClosedState } from "../../lib/memory";
import { pauseVideo } from "../../video";
import { lockScroll, unlockScroll } from "../../lib/scroll-lock";
import type { ModalConfig } from "./modal-config";
import type { ModalElements } from "./modal-animator";
import { animateOpen, animateClose } from "./modal-animator";

export class ModalController {
  private currentTimeline: gsap.core.Timeline | null = null;
  private isAnimating = false;
  private queuedAction: (() => void) | null = null;

  constructor(
    private elements: ModalElements,
    private config: ModalConfig
  ) {}

  /**
   * Opens the modal using GSAP
   */
  open = (): void => {
    // If currently animating, queue this action
    if (this.isAnimating) {
      this.queuedAction = this.open;
      return;
    }

    // Lock scroll if configured
    if (this.config.lockScrollOnOpen) {
      lockScroll();
      if (this.config.debug)
        console.log(`[DEBUG] Modal "${this.config.name}" - Locked scroll`);
    }

    // Kill any existing timeline
    if (this.currentTimeline) {
      this.currentTimeline.kill();
      this.currentTimeline = null;
    }

    this.isAnimating = true;
    this.currentTimeline = animateOpen(this.elements, this.config);

    // Set up completion callback
    if (this.currentTimeline) {
      this.currentTimeline.eventCallback("onComplete", () => {
        this.isAnimating = false;
        this.processQueue();
      });
    }
  };

  /**
   * Closes the modal using GSAP
   */
  close = (): void => {
    // If currently animating, queue this action
    if (this.isAnimating) {
      this.queuedAction = this.close;
      return;
    }

    // Kill any existing timeline
    if (this.currentTimeline) {
      this.currentTimeline.kill();
      this.currentTimeline = null;
    }

    // Unlock scroll if configured
    if (this.config.lockScrollOnOpen) {
      unlockScroll();
      if (this.config.debug)
        console.log(`[DEBUG] Modal "${this.config.name}" - Unlocked scroll`);
    }

    // Pause any videos inside the modal
    pauseVideo(this.elements.modal);
    if (this.config.debug)
      console.log(`[DEBUG] Modal "${this.config.name}" - Paused any videos`);

    // Store modal closed state
    storeClosedState("modal", this.config.name);
    if (this.config.debug)
      console.log(`[DEBUG] Modal "${this.config.name}" - Stored closed state in session`);

    this.isAnimating = true;
    this.currentTimeline = animateClose(this.elements, this.config);

    // Set up completion callback
    if (this.currentTimeline) {
      this.currentTimeline.eventCallback("onComplete", () => {
        this.isAnimating = false;
        this.processQueue();
      });
    }
  };

  /**
   * Process any queued actions after animation completes
   */
  private processQueue = (): void => {
    if (this.queuedAction) {
      const action = this.queuedAction;
      this.queuedAction = null;
      action();
    }
  };
}
