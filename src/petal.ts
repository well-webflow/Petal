import { initializeAllModals } from "./modules/modal/modal";
import { initializeBanner } from "./modules/banner/banner";
import { initializeAllTabs } from "./modules/tabs/tabs";
import { initializeAllDropdowns } from "./modules/dropdown/dropdown";

console.log(`🌸 Hello from Wellflow Petal v${APP_VERSION}`);

initializeAllModals();
initializeBanner();
initializeAllTabs();
initializeAllDropdowns();
