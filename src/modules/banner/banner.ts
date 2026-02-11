import { debug, debugElements } from "../../lib/debug";
import { ATTR_PETAL_BANNER, ATTR_PETAL_BANNER_CLOSE, ATTR_PETAL_NAME, ATTR_PETAL_ELEMENT, ATTR_PETAL_SESSION_TTL, ATTR_ALLOW_CLOSE } from "../../lib/attributes";
import { getAllPetalElementsOfType } from "../../lib/helpers";
import { storeClosedState, checkClosedState, clearClosedState } from "../../lib/memory";
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
    }

    // If allowClose is true, check if banner was previously closed and set up event listeners on close buttons
    if (config.allowClose) {
      // Check if banner was closed and session is still valid (only if allowClose is true)
      if (checkClosedState("banner", name, config.sessionTTLMinutes)) {
        // If closed and session valid, hide the banner
        banner.classList.add("petal-hide-banner");
      }
      // Set up the close button
      closeButtons.forEach((closeButton) => {
        closeButton.addEventListener("click", () => {
          // Hide the banner
          banner.classList.add("petal-hide-banner");
          // Store closed state in sessionStorage with timestamp
          storeClosedState("banner", name);
        });
      });
    }
  });
}
