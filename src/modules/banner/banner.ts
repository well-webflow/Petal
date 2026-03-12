import { debug, debugElements } from "../../lib/debug";
import { ATTR_PETAL_BANNER, ATTR_PETAL_BANNER_CLOSE, ATTR_PETAL_NAME, ATTR_PETAL_ELEMENT } from "../../lib/attributes";
import { getAllPetalElementsOfType } from "../../lib/helpers";
import { storeClosedState, checkClosedState, clearClosedState, storeMemoryWithExpiration, checkMemory, clearMemory } from "../../lib/memory";
import { parseBannerConfig } from "./banner-config";

export function initializeBanner() {
  const banners = getAllPetalElementsOfType(ATTR_PETAL_BANNER);

  banners.forEach((banner) => {
    const name = banner.getAttribute(ATTR_PETAL_NAME);
    if (!name) {
      console.warn("Banner element is missing a name attribute. Each banner must have a unique name to function properly.");
      return;
    }

    // Get the banner config
    const config = parseBannerConfig(banner);
    debug(config.debug, "BANNER", "Banner Configuration:");
    if (config.debug) console.log(config);

    // ELEMENTS
    const closeButtons = banner.querySelectorAll(`[${ATTR_PETAL_ELEMENT}="${ATTR_PETAL_BANNER_CLOSE}"]`);
    debugElements(config.debug, "BANNER", "close button", closeButtons);

    // If banner doesn't allow close, hide close buttons and clear any stored memory
    if (!config.allowClose) {
      closeButtons.forEach((closeButton) => {
        (closeButton as HTMLElement).style.display = "none";
      });
      clearClosedState("banner", name);
      clearMemory("banner", name);
    }

    // If allowClose is true, check if banner was previously closed and set up event listeners on close buttons
    if (config.allowClose) {
      let shouldHide = false;

      // Check memory first (localStorage with expiration)
      if (config.memory.enabled) {
        const isInMemory = checkMemory("banner", name);
        if (isInMemory) {
          shouldHide = true;
          debug(config.debug, "BANNER", `Banner "${name}" is in memory - hiding`);
        }
      } else {
        // Fall back to session storage check (default 30 minutes)
        if (checkClosedState("banner", name, 30)) {
          shouldHide = true;
          debug(config.debug, "BANNER", `Banner "${name}" was closed in this session - hiding`);
        }
      }

      if (shouldHide) {
        banner.classList.add("petal-hide-banner");
      }

      // Set up the close button
      closeButtons.forEach((closeButton) => {
        closeButton.addEventListener("click", () => {
          // Hide the banner
          banner.classList.add("petal-hide-banner");

          // Store in memory if enabled
          if (config.memory.enabled && config.memory.expires) {
            storeMemoryWithExpiration("banner", name, config.memory.expires);
            debug(config.debug, "BANNER", `Banner "${name}" stored in memory until ${config.memory.expires.toISOString()}`);
          } else {
            // Fall back to session storage
            storeClosedState("banner", name);
            debug(config.debug, "BANNER", `Banner "${name}" stored in session`);
          }
        });
      });
    }
  });
}
