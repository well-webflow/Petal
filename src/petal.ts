import { initializeAllModals } from "./modules/modal/modal";
import { initializeBanner } from "./modules/banner/banner";
import "./petal.css";

console.log(`🌸 Hello from Wellflow Petal v${APP_VERSION}`);

initializeAllModals();
initializeBanner();
