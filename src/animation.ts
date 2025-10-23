import {
  animateScaleUp,
  animateOpenSlideUp,
  animateOpenSlideDown,
  animateOpenSlideLeft,
  animateOpenSlideRight,
  animateScaleDown,
  animateCloseSlideUp,
  animateCloseSlideDown,
  animateCloseSlideLeft,
  animateCloseSlideRight,
} from "./lib/animations";
import { ATTR_PETAL_ANIM_OPEN, ATTR_PETAL_ANIM_CLOSE, ATTR_PETAL_ANIM_OPEN_MOBILE, ATTR_PETAL_ANIM_CLOSE_MOBILE, ATTR_PETAL_DURATION } from "./lib/attributes";
import { isMobile } from "./lib/breakpoints";

// Popup animation types
export type PopupAnimation = "scale" | "slide-up" | "slide-down" | "slide-left" | "slide-right";
const validAnimations: PopupAnimation[] = ["scale", "slide-up", "slide-down", "slide-left", "slide-right"];

const animationOpenMap: Record<PopupAnimation, () => GSAPTweenVars> = {
  scale: animateScaleUp,
  "slide-up": animateOpenSlideUp,
  "slide-down": animateOpenSlideDown,
  "slide-left": animateOpenSlideLeft,
  "slide-right": animateOpenSlideRight,
};

const animationCloseMap: Record<PopupAnimation, () => GSAPTweenVars> = {
  scale: animateScaleDown,
  "slide-up": animateCloseSlideUp,
  "slide-down": animateCloseSlideDown,
  "slide-left": animateCloseSlideLeft,
  "slide-right": animateCloseSlideRight,
};

// Map open animations to their corresponding close animations
const reverseAnimationMap: Record<PopupAnimation, PopupAnimation> = {
  scale: "scale",
  "slide-up": "slide-down",
  "slide-down": "slide-up",
  "slide-left": "slide-right",
  "slide-right": "slide-left",
};

/**
 * Creates GSAP animation based on the popup's attributes
 * @param popup The Popup element
 * @param direction Open or Close
 * @returns GSAP animation vars for the popup
 */
export function getPopupGSAPAnimation(popup: HTMLElement, direction: "open" | "close"): GSAPTweenVars {
  // Determine the name of the animation to perform
  let animationName = getAnimationName(popup, direction);

  // Get the animation function
  let anim;
  if (direction === "open") anim = animationOpenMap[animationName]();
  else anim = animationCloseMap[animationName]();

  // Set the animation duration
  const duration = parseFloat(popup.getAttribute(ATTR_PETAL_DURATION) || "0.5");
  anim.to.duration = duration;

  return anim;
}

/**
 *
 * @param popup The Popup element
 * @param direction Open or Close
 * @returns The name of the animation to perform
 */
function getAnimationName(popup: HTMLElement, direction: "open" | "close"): PopupAnimation {
  const openDesktop = getPopupAnimation(popup, ATTR_PETAL_ANIM_OPEN);
  const openMobile = getPopupAnimation(popup, ATTR_PETAL_ANIM_OPEN_MOBILE);

  const closeDesktop = getPopupAnimation(popup, ATTR_PETAL_ANIM_CLOSE);
  const closeMobile = getPopupAnimation(popup, ATTR_PETAL_ANIM_CLOSE_MOBILE);

  if (direction === "open") {
    if (isMobile()) return openMobile;
    else return openDesktop;
  }
  // If closing
  else {
    const hasCloseDesktop = popup.hasAttribute(ATTR_PETAL_ANIM_CLOSE);
    const hasCloseMobile = popup.hasAttribute(ATTR_PETAL_ANIM_CLOSE_MOBILE);

    if (isMobile()) {
      // If no mobile close animation is set, use the reverse of the open animation
      return hasCloseMobile ? closeMobile : reverseAnimationMap[openMobile];
    } else {
      // If no desktop close animation is set, use the reverse of the open animation
      return hasCloseDesktop ? closeDesktop : reverseAnimationMap[openDesktop];
    }
  }
}

// Validate popup animation string
export function isPopupAnimation(value: string): value is PopupAnimation {
  return validAnimations.includes(value as PopupAnimation);
}

// Safe parser with fallback
function getPopupAnimation(popup: HTMLElement, attr: string): PopupAnimation {
  const raw = popup.getAttribute(attr);
  return isPopupAnimation(raw ?? "") ? (raw as PopupAnimation) : "slide-up";
}
