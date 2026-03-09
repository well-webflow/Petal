import { initializeAllModals } from "./modules/modal/modal";
import { initializeBanner } from "./modules/banner/banner";
// import { initializeDropdowns } from "./modules/dropdown/dropdown";
import { initializeOverlays } from "./modules/overlay/overlay";
import "./petal.css";
// import "./modules/dropdown/dropdown.css";

console.log(`🌸 Hello from Wellflow Petal v${APP_VERSION}`);

initializeAllModals();
initializeBanner();
// initializeDropdowns();
initializeOverlays();
