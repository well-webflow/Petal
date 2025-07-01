import gsap from "gsap";
import { animateMaskClosed, animateMaskOpen, getAnimationNew } from "./animation";
import { pauseVideo } from "./video";

// Error types for debug logging
export type ErrorType = "NO_NAME" | "NO_TRIGGER" | "NO_POPUP" | "NO_MASK" | "NO_SLOT";

// Initialize popup triggers
document.querySelectorAll("[petal-el='trigger'], [petal-el='mask']").forEach((trigger) => {
  const popupName = trigger.getAttribute("petal");
  if (!popupName) {
    logError("NO_NAME", "", trigger);
    return;
  }

  const popup = document.querySelector(`[petal='${popupName}'][petal-el='popup']`) as HTMLElement | null;
  if (!popup) {
    logError("NO_POPUP", popupName, trigger);
    return;
  }

  // Popup Elements
  const mask = popup.querySelector("[petal-el='mask']");
  const slot = popup.querySelector("[petal-el='slot']");

  // Mask Settings
  const maskOpacity = parseFloat(mask?.getAttribute("petal-mask-opacity") || "0.15");

  // Initialize GSAP timeline
  const tl = gsap.timeline();

  // Initialize Popup
  gsap.set(slot, { opacity: 0 });

  trigger.addEventListener("click", () => animate(popup));

  // Animate open/close
  function animate(popup: HTMLElement): void {
    if (!slot) console.warn("A slot was not found for this popup.");

    // Get the animation
    const open = getComputedStyle(popup).display !== "none";
    const anim = getAnimationNew(popup, open);
    console.log(anim);

    console.log(`[Petal Popup]`, {
      popupName,
      popup,
      slot,
      maskOpacity,
      open,
      anim,
    });

    // If the popup is closed, open it
    if (!open) {
      // Show Popup
      tl.set(popup, { display: "flex" });
      // Animate Mask Open
      if (mask) {
        tl.fromTo(mask, animateMaskOpen(maskOpacity).from, animateMaskOpen(maskOpacity).to, "<");
      }
      // Animate the Slot Open
      tl.fromTo(slot, anim.from, anim.to);
    }

    // If the popup is open, close it
    else {
      // Pause any videos in the popup
      pauseVideo(popup);
      // Animate the Slot Closed
      tl.fromTo(slot, anim.from, anim.to);
      // Animate Mask Closed
      if (mask) {
        tl.fromTo(mask, animateMaskClosed(maskOpacity).from, animateMaskClosed(maskOpacity).to, "<");
      }
      // Hide the Popup
      tl.set(popup, { display: "none" });
    }
  }
});

// Centralized error logging
function logError(error: ErrorType, popupName: string, trigger: Element): void {
  switch (error) {
    case "NO_NAME":
      console.error(`Trigger is missing the "petal" attribute:`, trigger);
      break;
    case "NO_POPUP":
      console.error(`Popup with name "${popupName}" not found for trigger:`, trigger);
      break;
    default:
      console.error(`Popup error [${error}] for "${popupName}":`, trigger);
  }
}
