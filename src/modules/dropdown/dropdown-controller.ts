/**
 * Dropdown Controller Module
 *
 * Manages dropdown state, event handlers, and group coordination.
 * Orchestrates opening/closing logic with animations.
 */

import { gsap } from "gsap";
import { DropdownConfig } from "./dropdown-config";
import { DropdownElements, animateOpen, animateClose } from "./dropdown-animator";
import { lockScroll, unlockScroll } from "../../lib/scroll-lock";
import { debug } from "../../lib/debug";
import { getSettingValueOnCurrentBreakpoint, getCurrentSettingValue, BREAKPOINT_TABLET } from "../../lib/setting";
import {
  ARIA_EXPANDED,
  ATTR_PETAL_ANIM_DELAY,
  ATTR_PETAL_ANIM_DURATION,
  ATTR_PETAL_DROPDOWN,
  ATTR_PETAL_DROPDOWN_TOGGLE,
  ATTR_PETAL_ELEMENT,
  ATTR_PETAL_GROUP,
  ATTR_PETAL_STATE,
} from "../../lib/attributes";
import { parseNumber } from "../../lib/helpers";

type QueuedAction = "open" | "close" | null;

export class DropdownController {
  private isOpen = false;
  private timeoutId: number | null = null;
  private openTimeoutId: number | null = null;
  private currentTimeline: gsap.core.Timeline | null = null;
  private isAnimating = false;
  private openOnHover: boolean;
  private visible: boolean;
  private queuedAction: QueuedAction = null;

  constructor(
    private elements: DropdownElements,
    private config: DropdownConfig,
    private index: number,
  ) {
    this.openOnHover = this.getCurrentOpenOnHover(config);
    this.visible = this.getCurrentShowState(config);
    this.updateVisibility();
  }

  /**
   * Processes the queued action after animation completes
   */
  private processQueue = (): void => {
    console.log("🔄 processQueue called, queuedAction:", this.queuedAction);
    if (this.queuedAction === null) return;

    const action = this.queuedAction;
    this.queuedAction = null;
    console.log(`▶️ Processing queued action: ${action}`);

    if (action === "open") {
      this.open();
    } else if (action === "close") {
      this.close();
    }
  };

  /**
   * Opens the dropdown menu using GSAP
   * - Cancels any pending close timeout
   * - Closes other dropdowns in same group before opening
   * - Animates using GSAP timeline
   */
  open = (): void => {
    console.log("🟢 OPEN called, isAnimating:", this.isAnimating, "queuedAction:", this.queuedAction);

    // Don't open if already in always-visible mode
    if (this.visible) return;

    // If currently animating, queue this action
    if (this.isAnimating) {
      console.log("🔶 OPEN queued (already animating)");
      this.queuedAction = "open";
      return;
    }

    // Cancel any pending close timeout
    if (this.timeoutId) {
      console.log("🔴 Canceling pending close timeout");
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Cancel any pending open timeout
    if (this.openTimeoutId) {
      console.log("🔴 Canceling pending open timeout");
      clearTimeout(this.openTimeoutId);
      this.openTimeoutId = null;
    }

    const openDelay = getCurrentSettingValue(this.config.animOpen)?.delay || 0;

    // Check if we need to close other dropdowns in the group first
    let groupCoordinationDelay = 0;
    if (this.config.group) {
      // Find all other dropdowns in the same group
      const groupDropdowns = document.querySelectorAll(`[${ATTR_PETAL_ELEMENT}='${ATTR_PETAL_DROPDOWN}'][${ATTR_PETAL_GROUP}='${this.config.group}']`);

      // Close all other dropdowns in this group
      Array.from(groupDropdowns).forEach((dd) => {
        const ddToggle = dd.querySelector(`[${ATTR_PETAL_ELEMENT}='${ATTR_PETAL_DROPDOWN_TOGGLE}']`);
        if (ddToggle && ddToggle !== this.elements.toggle && ddToggle.getAttribute(ARIA_EXPANDED) === "true") {
          // Trigger close on the other dropdown by dispatching a mouseleave event
          dd.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true, cancelable: true }));

          // Calculate total time needed: close delay + close animation duration
          const closeDelay = getSettingValueOnCurrentBreakpoint(dd, ATTR_PETAL_ANIM_DELAY, parseNumber, "close") || 0;
          const closeDuration = getSettingValueOnCurrentBreakpoint(dd, ATTR_PETAL_ANIM_DURATION, parseNumber, "close") || 0;

          // Total time = close delay + close animation duration
          const totalCloseTime = closeDelay + closeDuration;
          groupCoordinationDelay = Math.max(groupCoordinationDelay, totalCloseTime);
        }
      });
    }

    // Set animating flag immediately to block other actions
    this.isAnimating = true;
    console.log("✅ isAnimating set to TRUE");

    // Perform the actual open (immediately or delayed)
    const performOpen = () => {
      console.log("🎬 performOpen executing");

      // Kill existing timeline if any
      if (this.currentTimeline) {
        console.log("💀 Killing previous timeline before creating new one");
        this.currentTimeline.kill();
        this.currentTimeline = null;
      }

      debug(this.config.debug, "Dropdown", `Dropdown ${this.index + 1} - openDropdown() called`);

      this.currentTimeline = animateOpen(this.elements, this.config, this.index);
      console.log("📝 New OPEN timeline created, duration:", this.currentTimeline?.duration());

      // Set up completion callback
      if (this.currentTimeline) {
        this.currentTimeline.eventCallback("onComplete", () => {
          console.log("✅ OPEN animation completed");
          console.log("📍 Drawer position BEFORE any callbacks:", {
            x: gsap.getProperty(this.elements.drawer, "x"),
            y: gsap.getProperty(this.elements.drawer, "y"),
            opacity: gsap.getProperty(this.elements.drawer, "opacity")
          });

          console.log("⏸️ Setting isAnimating to false");
          this.isAnimating = false;

          console.log("📍 Drawer position AFTER setting isAnimating:", {
            x: gsap.getProperty(this.elements.drawer, "x"),
            y: gsap.getProperty(this.elements.drawer, "y"),
            opacity: gsap.getProperty(this.elements.drawer, "opacity")
          });

          console.log("🔄 About to process queue");
          this.processQueue();

          console.log("📍 Drawer position AFTER processQueue:", {
            x: gsap.getProperty(this.elements.drawer, "x"),
            y: gsap.getProperty(this.elements.drawer, "y"),
            opacity: gsap.getProperty(this.elements.drawer, "opacity")
          });
        });
      }

      this.isOpen = true;

      // Lock scroll if configured
      if (this.config.disableScrollOnOpen) lockScroll();
    };

    // Use the greater of openDelay or groupCoordinationDelay
    const totalDelay = Math.max(openDelay, groupCoordinationDelay);

    if (totalDelay > 0) {
      console.log(`⏱️ Setting open timeout for ${totalDelay}ms`);
      this.openTimeoutId = setTimeout(() => {
        console.log("⏰ Open timeout fired");
        this.openTimeoutId = null;
        performOpen();
      }, totalDelay) as unknown as number;
    } else {
      console.log("⚡ No delay, executing immediately");
      performOpen();
    }
  };

  /**
   * Closes the dropdown menu using GSAP
   * - Cancels any pending close timeout
   * - Animates using GSAP timeline
   * - Sets visibility to hidden after animation completes
   */
  close = (): void => {
    console.log("🔴 CLOSE called, isAnimating:", this.isAnimating, "queuedAction:", this.queuedAction);

    // Don't close if in always-visible mode
    if (this.visible) return;

    // If currently animating, queue this action
    if (this.isAnimating) {
      console.log("🔶 CLOSE queued (already animating)");
      this.queuedAction = "close";
      return;
    }

    // Cancel any pending close timeout
    if (this.timeoutId) {
      console.log("🔴 Canceling pending close timeout");
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Cancel any pending open timeout
    if (this.openTimeoutId) {
      console.log("🔴 Canceling pending open timeout");
      clearTimeout(this.openTimeoutId);
      this.openTimeoutId = null;
    }

    console.log("📍 Drawer position BEFORE close animation:", {
      x: gsap.getProperty(this.elements.drawer, "x"),
      y: gsap.getProperty(this.elements.drawer, "y"),
      opacity: gsap.getProperty(this.elements.drawer, "opacity")
    });

    this.isAnimating = true;
    console.log("✅ isAnimating set to TRUE (close)");
    console.log("🎬 Starting close animation");
    this.currentTimeline = animateClose(this.elements, this.config, this.index);

    console.log("📍 Drawer position AFTER close timeline created:", {
      x: gsap.getProperty(this.elements.drawer, "x"),
      y: gsap.getProperty(this.elements.drawer, "y"),
      opacity: gsap.getProperty(this.elements.drawer, "opacity")
    });

    debug(this.config.debug, "Dropdown", `Dropdown ${this.index + 1} - closeDropdown() called`);

    // Set up completion callback
    if (this.currentTimeline) {
      this.currentTimeline.eventCallback("onComplete", () => {
        console.log("✅ CLOSE animation completed");
        console.log("📍 Drawer position on complete:", {
          x: gsap.getProperty(this.elements.drawer, "x"),
          y: gsap.getProperty(this.elements.drawer, "y"),
          opacity: gsap.getProperty(this.elements.drawer, "opacity")
        });

        // Update ARIA and state after animation completes
        this.elements.toggle.setAttribute(ARIA_EXPANDED, "false");
        this.elements.dropdown.setAttribute(ATTR_PETAL_STATE, "closed");

        // Reset Elements
        gsap.set(this.elements.menu, { display: "none", visibility: "hidden" });
        gsap.set(this.elements.drawer, { x: 0, y: 0, opacity: 0 });
        if (this.elements.overlay) {
          gsap.set(this.elements.overlay, { display: "none", visibility: "hidden", opacity: 0 });
        }

        this.isAnimating = false;
        this.processQueue();
      });
    }

    this.isOpen = false;

    // Unlock scroll if configured
    if (this.config.disableScrollOnOpen) {
      unlockScroll();
    }
  };

  /**
   * Toggles the dropdown between open and closed states
   * - Used for click-based dropdowns
   */
  toggle = (): void => {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  };

  /**
   * Handles clicks outside the dropdown
   * - Only active for click-based dropdowns
   * - Closes dropdown if click is outside both toggle and menu
   */
  handleOutsideClick = (event: MouseEvent, dropdown: Element): void => {
    if (!this.isOpen) return;

    const clickedInsideDropdown = dropdown.contains(event.target as Node);

    if (!clickedInsideDropdown) {
      this.close();
    }
  };

  /**
   * Update visibility based on current show state
   */
  private updateVisibility(): void {
    const { menu, drawer, dropdown, toggle, overlay } = this.elements;

    if (this.visible) {
      // Show menu without animation (always visible state)
      (menu as HTMLElement).style.display = "flex";
      (menu as HTMLElement).style.visibility = "visible";
      (drawer as HTMLElement).style.opacity = "1";
      (drawer as HTMLElement).style.transform = "none";

      // Set ARIA states
      toggle.setAttribute(ARIA_EXPANDED, "true");
      dropdown.setAttribute("petal-state", "open");

      // Hide overlay in always-visible mode
      if (overlay) {
        (overlay as HTMLElement).style.display = "none";
      }
    } else {
      // Hide menu and close if open
      if (this.isOpen) {
        this.close();
      } else {
        // Ensure menu is hidden and drawer is reset to initial position
        (menu as HTMLElement).style.display = "none";
        (menu as HTMLElement).style.visibility = "hidden";
      }
    }
  }

  /**
   * Handle resize event - reinitialize drawer position if closed
   */
  handleResize = (): void => {
    // Update show state and visibility on resize
    this.updateShowState();
    this.updateOpenOnHover();
  };

  getCurrentShowState(config: DropdownConfig): boolean {
    // Nullable breakpoint values fall back to desktop if not explicitly set
    const shouldShow = getCurrentSettingValue(config.visible);
    return !!shouldShow;
  }

  /**
   * Update show state based on current breakpoint
   */
  updateShowState(): boolean {
    const newShouldShow = this.getCurrentShowState(this.config);
    const changed = newShouldShow !== this.visible;

    if (changed) {
      this.visible = newShouldShow;
      this.updateVisibility();
    }

    return changed;
  }

  getCurrentOpenOnHover(config: DropdownConfig): boolean {
    const shouldHover = getCurrentSettingValue(config.openOnHover);
    const hasMouse = window.matchMedia("(pointer: fine)").matches;

    // Only enable hover if it is enabled & the device has mouse
    return !!shouldHover && hasMouse;
  }

  /**
   * Update interaction mode based on current open-on-hover setting
   */
  updateOpenOnHover(): boolean {
    const newOpenOnHover = this.getCurrentOpenOnHover(this.config);
    const changed = newOpenOnHover !== this.openOnHover;
    this.openOnHover = newOpenOnHover;
    return changed;
  }

  /**
   * Get current open-on-hover mode
   */
  getOpenOnHover(): boolean {
    return this.openOnHover;
  }

  /**
   * Get current should show state
   */
  getShouldShow(): boolean {
    return this.visible;
  }
}
