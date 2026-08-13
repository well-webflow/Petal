/**
 * -+-+-+ Tabs -+-+-+
 *
 * Handles interactive tab components with support for:
 * - GSAP animations (fade, slide)
 * - Configurable animation duration and offset
 * - Active state management
 * - Click-to-switch tab panes
 */
declare const gsap: any;

import { ATTR_PETAL_NAME, ATTR_PETAL_STATE, ATTR_PETAL_ELEMENT } from "../../lib/attributes";
import {
  parseTabsConfig,
  logConfig,
  TabsConfig,
  AnimationType,
  ATTR_PETAL_TABS,
  ATTR_PETAL_TAB_LINK,
  ATTR_PETAL_TAB_PANE,
} from "./tabs-config";
import { debug } from "../../lib/debug";

export interface TabsElements {
  wrapper: HTMLElement;
  links: NodeListOf<HTMLElement>;
  panes: NodeListOf<HTMLElement>;
}

// Direction multipliers for each animation type
const ANIM_DIRECTIONS: Record<AnimationType, { x: number; y: number }> = {
  fade: { x: 0, y: 0 },
  "slide-left": { x: 1, y: 0 },
  "slide-right": { x: -1, y: 0 },
  "slide-up": { x: 0, y: 1 },
  "slide-down": { x: 0, y: -1 },
  none: { x: 0, y: 0 },
};

/**
 * Calculate offset based on animation type and offset value
 */
function getOffset(type: AnimationType, offset: number): { x: number; y: number } {
  const dir = ANIM_DIRECTIONS[type] || ANIM_DIRECTIONS.fade;
  return { x: dir.x * offset, y: dir.y * offset };
}

/**
 * Set active state on an element
 */
function setActive(el: HTMLElement, active: boolean): void {
  if (active) {
    el.setAttribute(ATTR_PETAL_STATE, "active");
    el.classList.add("is-active");
  } else {
    el.setAttribute(ATTR_PETAL_STATE, "inactive");
    el.classList.remove("is-active");
  }
}

/**
 * Animate pane out
 */
function animateOut(
  pane: HTMLElement,
  type: AnimationType,
  duration: number,
  offset: number,
  onComplete: () => void
): void {
  if (type === "none") {
    pane.style.display = "none";
    onComplete();
    return;
  }

  const { x, y } = getOffset(type, offset);
  gsap.to(pane, {
    opacity: 0,
    x,
    y,
    duration,
    ease: "power1.out",
    onComplete: () => {
      pane.style.display = "none";
      onComplete();
    },
  });
}

/**
 * Animate pane in
 */
function animateIn(pane: HTMLElement, type: AnimationType, duration: number, offset: number): void {
  pane.style.display = "flex";

  if (type === "none") {
    gsap.set(pane, { clearProps: "opacity,x,y" });
    return;
  }

  const { x, y } = getOffset(type, offset);
  gsap.fromTo(pane, { opacity: 0, x, y }, { opacity: 1, x: 0, y: 0, duration, ease: "power1.out" });
}

/**
 * Tabs Controller
 * Manages tab state and orchestrates switching logic with animations.
 */
class TabsController {
  private isAnimating: boolean = false;

  constructor(
    private elements: TabsElements,
    private config: TabsConfig
  ) {}

  /**
   * Switch to a specific pane
   */
  switchPane = (pane: HTMLElement, index: number): void => {
    if (this.isAnimating || pane.getAttribute(ATTR_PETAL_STATE) === "active") {
      return;
    }

    this.isAnimating = true;

    const activePane = [...this.elements.panes].find((p) => p.getAttribute(ATTR_PETAL_STATE) === "active");

    const openNext = () => {
      // Update all links
      this.elements.links.forEach((link) => setActive(link, false));
      setActive(this.elements.links[index], true);

      // Update pane
      setActive(pane, true);
      animateIn(pane, this.config.animation.type, this.config.animation.duration, this.config.animation.offset);

      this.isAnimating = false;
    };

    if (activePane) {
      setActive(activePane, false);
      animateOut(
        activePane,
        this.config.animation.type,
        this.config.animation.duration,
        this.config.animation.offset,
        openNext
      );
    } else {
      openNext();
    }
  };
}

/**
 * Initialize all tabs on the page
 */
export function initializeAllTabs(): void {
  const tabsWrappers = document.querySelectorAll<HTMLElement>(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_TABS}"]`);

  tabsWrappers.forEach((wrapper, index) => {
    // ===========================
    // Configuration
    // ===========================
    const config = parseTabsConfig(wrapper);
    debug(config.debug, "TABS", `Processing ${config.name} (${index + 1}/${tabsWrappers.length})`);
    logConfig(config);

    if (!config.name) {
      console.warn("Tabs Instance does not have a name.");
      return;
    }

    // ===========================
    // Element References
    // ===========================
    const links = wrapper.querySelectorAll<HTMLElement>(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_TAB_LINK}"]`);
    const panes = wrapper.querySelectorAll<HTMLElement>(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_TAB_PANE}"]`);

    if (links.length === 0 || panes.length === 0) {
      console.error(`[ERROR] Tabs "${config.name}" is missing required elements (tab-link or tab-pane).`);
      return;
    }

    const elements: TabsElements = {
      wrapper,
      links,
      panes,
    };

    // ===========================
    // Initialization
    // ===========================
    const controller = new TabsController(elements, config);

    // Initialize links and panes
    links.forEach((link, linkIndex) => {
      setActive(link, linkIndex === 0);

      link.addEventListener("click", () => {
        const pane = panes[linkIndex];
        if (pane) {
          controller.switchPane(pane, linkIndex);
        }
      });
    });

    panes.forEach((pane, paneIndex) => {
      setActive(pane, paneIndex === 0);
      if (paneIndex !== 0) {
        pane.style.display = "none";
      }
    });
  });
}
