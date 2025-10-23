import { findPopupElement, forEachPetalTrigger, getAllPetalElementsOfType, getAllPopups } from "./lib/helpers";
import { getPopupGSAPAnimation } from "./animation";
import { animateMaskOpen, animateMaskClosed } from "./lib/animations";
import { ATTR_PETAL_CLOSE, ATTR_PETAL_OPEN, PetalElements } from "./lib/elements";
import { ATTR_PETAL_MASK_OPACITY } from "./lib/attributes";
import { pauseVideo } from "./video";

export function initializeAllPopups(): void {
  const popups = getAllPopups();

  popups.forEach((popup) => {
    const mask = findPopupElement(popup, "mask");
    const slot = findPopupElement(popup, "slot");

    // Set slot opacity to 0
    if (slot) (slot as HTMLElement).style.opacity = "0";

    // Set mask opacity to 0
    if (mask) (mask as HTMLElement).style.opacity = "0";

    // Set popup display to none
    popup.style.display = "none";
  });
}

// Animate open/close
export function openPopup(petal: PetalElements): void {
  const { name, popup, slot, mask } = petal;
  const tl = gsap.timeline();

  // Set Popup display to flex
  tl.set(popup, { display: "flex" });
  // Animate Mask open
  const maskOpacity = parseFloat(mask?.getAttribute(ATTR_PETAL_MASK_OPACITY) || "0.15");
  tl.fromTo(mask, animateMaskOpen(maskOpacity).from, animateMaskOpen(maskOpacity).to, "<");
  // Animate Slot Open
  const anim = getPopupGSAPAnimation(popup, "open");
  console.log("Opening popup:", name, "with animation:", anim);
  tl.set(slot, { clearProps: "x,y,scale,transform" });
  tl.fromTo(slot, anim.from, anim.to);
}

// Animate open/close
export function closePopup(petal: PetalElements): void {
  const { name, popup, slot, mask } = petal;
  const tl = gsap.timeline();

  // Pause any videos in the popup
  pauseVideo(popup);
  // Animate the Slot Closed
  const anim = getPopupGSAPAnimation(popup, "close");
  console.log("Closing popup:", name, "with animation:", anim);
  tl.fromTo(slot, anim.from, anim.to);
  // Animate Mask Closed
  if (mask) tl.to(mask, animateMaskClosed(0).to, "<");

  // Hide the Popup and clear transforms so they don't persist
  tl.set(popup, { display: "none" });
  tl.set(slot, { clearProps: "x,y,scale,transform" });
}

// Initialize Popup Open Triggers
forEachPetalTrigger(getAllPetalElementsOfType(ATTR_PETAL_OPEN), (petal) => {
  const { trigger } = petal;
  trigger.addEventListener("click", () => openPopup(petal));
});

// Initialize Popup Close Triggers
forEachPetalTrigger(getAllPetalElementsOfType(ATTR_PETAL_CLOSE), (petal) => {
  const { trigger } = petal;
  trigger.addEventListener("click", () => closePopup(petal));
});
