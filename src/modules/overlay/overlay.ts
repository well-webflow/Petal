/**
 * Overlay Component
 *
 * Handles overlays that respond to petal-state changes in grouped elements.
 * Overlays can be controlled by:
 * 1. petal-group attribute - Shows when any element with matching group has petal-state='active'|'open'
 * 2. petal name attribute - Shows when any element with matching name has petal-state='active'|'open'
 * 3. Parent element - Shows when parent element has petal-state='active'|'open'
 *
 * HTML Attributes:
 * - petal-el="overlay" - The overlay element (required)
 * - petal-group="groupName" - Group name to watch for active/open state (optional)
 * - petal="name" - Name to watch for active/open state (optional, fallback if no group)
 *
 * Priority order: group > name > parent
 */

import { debug, debugElements } from "../../lib/debug";
import { ATTR_PETAL_OVERLAY, ATTR_PETAL_GROUP, ATTR_PETAL_NAME, ATTR_PETAL_STATE, ATTR_PETAL_OVERLAY_OPACITY, ATTR_PETAL_DEBUG } from "../../lib/attributes";
import { getAllPetalElementsOfType, findClosestPetalParent } from "../../lib/helpers";
import { gsap } from "gsap";

interface OverlayController {
  overlay: HTMLElement;
  group: string | null;
  name: string | null;
  maxOpacity: number;
  observer: MutationObserver;
  currentTimeline: gsap.core.Timeline | null;
  cleanup: () => void;
}

const overlayControllers: OverlayController[] = [];

/**
 * Check if any element in a group has petal-state='active' or 'open'
 */
function hasActiveElementInGroup(group: string): boolean {
  const elements = document.querySelectorAll(`[${ATTR_PETAL_GROUP}="${group}"]`);
  return Array.from(elements).some((el) => {
    const state = el.getAttribute(ATTR_PETAL_STATE);
    return state === "active" || state === "open";
  });
}

/**
 * Check if any element with a name has petal-state='active' or 'open'
 */
function hasActiveElementWithName(name: string): boolean {
  const elements = document.querySelectorAll(`[${ATTR_PETAL_NAME}="${name}"]`);
  return Array.from(elements).some((el) => {
    const state = el.getAttribute(ATTR_PETAL_STATE);
    return state === "active" || state === "open";
  });
}

/**
 * Check if parent element has petal-state='active' or 'open'
 */
function hasActiveParent(overlay: HTMLElement): boolean {
  const parent = overlay.parentElement;
  if (!parent) return false;
  const state = parent.getAttribute(ATTR_PETAL_STATE);
  return state === "active" || state === "open";
}

/**
 * Update overlay visibility based on active states
 */
function updateOverlayVisibility(controller: OverlayController): void {
  const { overlay, group, name, maxOpacity } = controller;
  let shouldShow = false;

  // Priority 1: Check group
  if (group) {
    shouldShow = hasActiveElementInGroup(group);
  }
  // Priority 2: Check name
  else if (name) {
    shouldShow = hasActiveElementWithName(name);
  }
  // Priority 3: Check parent
  else {
    shouldShow = hasActiveParent(overlay);
  }

  // Kill any existing animation
  if (controller.currentTimeline) {
    controller.currentTimeline.kill();
    controller.currentTimeline = null;
  }

  // Animate overlay
  if (shouldShow) {
    // Show and fade in
    const tl = gsap.timeline();
    tl.set(overlay, { display: "flex" });
    tl.to(overlay, { opacity: maxOpacity, duration: 0.3 });
    controller.currentTimeline = tl;
  } else {
    // Fade out and hide
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { display: "none" });
      },
    });
    tl.to(overlay, { opacity: 0, duration: 0.3 });
    controller.currentTimeline = tl;
  }
}

/**
 * Initialize a single overlay
 */
function initializeOverlay(overlay: HTMLElement): OverlayController | null {
  const group = overlay.getAttribute(ATTR_PETAL_GROUP);
  const name = overlay.getAttribute(ATTR_PETAL_NAME);

  // Skip if this overlay is controlled by modal/dropdown
  // (i.e., it has a parent that's a modal or dropdown)
  const parentModal = findClosestPetalParent(overlay, "modal");
  const parentDropdown = findClosestPetalParent(overlay, "dropdown");

  // If overlay has a group or name attribute, it uses the new system
  // Otherwise, let modal/dropdown handle it
  if (!group && !name && (parentModal || parentDropdown)) {
    return null;
  }

  // Get max opacity from attribute (default to 1)
  const maxOpacity = parseFloat(overlay.getAttribute(ATTR_PETAL_OVERLAY_OPACITY) || "1");

  // Create controller
  const controller: OverlayController = {
    overlay,
    group,
    name,
    maxOpacity,
    observer: null as any, // Set below
    currentTimeline: null,
    cleanup: () => {},
  };

  // Set initial state
  gsap.set(overlay, { opacity: 0, display: "none" });

  // Set initial visibility
  updateOverlayVisibility(controller);

  // Watch for attribute changes on all relevant elements
  const observer = new MutationObserver((mutations) => {
    // Check if any mutation affects petal-state
    const stateChanged = mutations.some((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === ATTR_PETAL_STATE) {
        const target = mutation.target as Element;

        // Check if this element is in our group or has our name
        if (group && target.getAttribute(ATTR_PETAL_GROUP) === group) return true;
        if (name && target.getAttribute(ATTR_PETAL_NAME) === name) return true;
        if (!group && !name && target === overlay.parentElement) return true;

        return false;
      }
      return false;
    });

    if (stateChanged) {
      updateOverlayVisibility(controller);
    }
  });

  // Observe attribute changes on document body
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: [ATTR_PETAL_STATE],
    subtree: true,
  });

  controller.observer = observer;
  controller.cleanup = () => {
    observer.disconnect();
  };

  return controller;
}

/**
 * Initialize all overlays on the page
 */
export function initializeOverlays(): void {
  const overlays = getAllPetalElementsOfType(ATTR_PETAL_OVERLAY);

  overlays.forEach((overlay, index) => {
    const group = overlay.getAttribute(ATTR_PETAL_GROUP);
    const name = overlay.getAttribute(ATTR_PETAL_NAME);
    const d = overlay.getAttribute(ATTR_PETAL_DEBUG) === "true";

    debug(d, "OVERLAY", `Overlay ${index + 1} - Group: "${group}", Name: "${name}"`);

    const controller = initializeOverlay(overlay as HTMLElement);

    if (controller) {
      overlayControllers.push(controller);
    } else {
    }
  });
}

/**
 * Cleanup all overlay controllers
 */
export function cleanupOverlays(): void {
  overlayControllers.forEach((controller) => controller.cleanup());
  overlayControllers.length = 0;
}
