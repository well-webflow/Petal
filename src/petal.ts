import { initializeAllModals } from "./modules/modal/modal";
import { initializeBanner } from "./modules/banner/banner";
import { initializeAllTabs } from "./modules/tabs/tabs";
import { initializeAllDropdowns } from "./modules/dropdown/dropdown";

console.log(`🌸 Hello from Wellflow Petal v${APP_VERSION}`);

function initializePetal() {
  initializeAllModals();
  initializeBanner();
  initializeAllTabs();
  initializeAllDropdowns();
}

// Wait for DOM to be ready before initializing
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePetal);
} else {
  // DOM is already ready, initialize immediately
  initializePetal();
}
