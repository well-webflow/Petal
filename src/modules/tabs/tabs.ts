/**
 * -+-+-+ Tabs -+-+-+
 *
 * Handles interactive tab components with support for:
 * - GSAP animations (fade, slide)
 * - Configurable animation duration and offset
 * - Active state management
 * - Click-to-switch tab panes
 */

import { ATTR_PETAL_STATE, ATTR_PETAL_ELEMENT } from "../../lib/attributes";
import { parseTabsConfig, logConfig, TabsConfig, ATTR_PETAL_TABS, ATTR_PETAL_TAB_LINK, ATTR_PETAL_TAB_PANE } from "./tabs-config";
import { debug } from "../../lib/debug";
import { animateIn, animateOut, setActive } from "../../lib/animations";

export interface TabsElements {
  wrapper: HTMLElement;
  links: NodeListOf<HTMLElement>;
  panes: NodeListOf<HTMLElement>;
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
      animateIn(pane, this.config.animation.type, this.config.animation.duration, this.config.animation.offset, this.config.animation.easing);

      this.isAnimating = false;
    };

    if (activePane) {
      setActive(activePane, false);
      animateOut(
        activePane,
        this.config.animation.type,
        this.config.animation.duration,
        this.config.animation.offset,
        this.config.animation.easing,
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
