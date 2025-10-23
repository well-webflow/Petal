import { ATTR_PETAL_ANIM_OPEN, ATTR_PETAL_ANIM_CLOSE, ATTR_PETAL_ANIM_OPEN_MOBILE, ATTR_PETAL_ANIM_CLOSE_MOBILE, ATTR_PETAL_DURATION } from "./lib/attributes";

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

export function getAnimation(popup: HTMLElement, direction: "open" | "close"): GSAPTweenVars {
  const duration = parseFloat(popup.getAttribute(ATTR_PETAL_DURATION) || "0.5");

  // Determine which attributes to check based on direction and device
  let animationType = getAnimationType(popup, direction);

  console.log(`Animation type: `, animationType);

  let anim;

  // Get the animation based on direction
  if (direction === "open") anim = animationOpenMap[animationType]();
  else anim = animationCloseMap[animationType]();

  console.log(`Using ${animationType} animation for ${direction} on popup:`, popup);

  // If closing and no specific close animation is set, reverse the open animation
  // const hasCloseAnim = popup.getAttribute(ATTR_PETAL_ANIM_CLOSE) || popup.getAttribute(ATTR_PETAL_ANIM_CLOSE_MOBILE);
  // if (direction === "close" && !hasCloseAnim) {
  //   // Swap from and to for reverse effect
  //   const reversed = {
  //     from: anim.to,
  //     to: anim.from,
  //   };
  //   reversed.to.duration = duration;
  //   return reversed;
  // }

  anim.to.duration = duration;
  return anim;
}

function getAnimationType(popup: HTMLElement, direction: "open" | "close"): PopupAnimation {
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

// Individual animations
// Scale: works the same for open/close (just reversed)
function animateScaleUp(): GSAPTweenVars {
  return {
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1, ease: "power3.inOut" },
  };
}

// Scale: works the same for open/close (just reversed)
function animateScaleDown(): GSAPTweenVars {
  return {
    from: { scale: 1, opacity: 0 },
    to: { scale: 0, opacity: 1, ease: "power3.inOut" },
  };
}

// Slide animations: direction describes the movement direction
// slide-up = slides UP on both open and close (bottom → center → top)
function animateOpenSlideUp(): GSAPTweenVars {
  return {
    from: { y: "100%", x: "0%", opacity: 0 }, // From bottom
    to: { y: "0%", x: "0%", opacity: 1, ease: "power3.inOut" }, // To top
  };
}

// Slide animations: direction describes the movement direction
// slide-up = slides UP on both open and close (bottom → center → top)
function animateCloseSlideUp(): GSAPTweenVars {
  return {
    from: { y: "0%", x: "0%", opacity: 1 }, // From bottom
    to: { y: "-100%", x: "0%", opacity: 0, ease: "power3.inOut" }, // To top
  };
}

// slide-down = slides DOWN on both open and close (top → center → bottom)
function animateOpenSlideDown(): GSAPTweenVars {
  return {
    from: { y: "-100%", x: "0%", opacity: 0 }, // From top
    to: { y: "0%", x: "0%", opacity: 1, ease: "power3.inOut" }, // To bottom
  };
}

// slide-down = slides DOWN on both open and close (top → center → bottom)
function animateCloseSlideDown(): GSAPTweenVars {
  return {
    from: { y: "0%", x: "0%", opacity: 1 }, // From top
    to: { y: "100%", x: "0%", opacity: 0, ease: "power3.inOut" }, // To bottom
  };
}

// slide-right = slides RIGHT (from left to center) when opening, slides LEFT (center to left) when closing
function animateOpenSlideRight(): GSAPTweenVars {
  return {
    from: { x: "-100%", y: "0%", opacity: 0 }, // From left
    to: { x: "0%", y: "0%", opacity: 1, ease: "power3.inOut" }, // To center
  };
}

// slide-right = slides RIGHT (from left to center) when opening, slides LEFT (center to left) when closing
function animateCloseSlideRight(): GSAPTweenVars {
  return {
    from: { x: "0%", y: "0%", opacity: 1 }, // From left
    to: { x: "100%", y: "0%", opacity: 0, ease: "power3.inOut" }, // To center
  };
}

// slide-left = slides LEFT (from right to center) when opening, slides RIGHT (center to right) when closing
function animateOpenSlideLeft(): GSAPTweenVars {
  return {
    from: { x: "100%", y: "0%", opacity: 0 }, // From right
    to: { x: "0%", y: "0%", opacity: 1, ease: "power3.inOut" }, // To center
  };
}

// slide-left = slides LEFT (from right to center) when opening, slides RIGHT (center to right) when closing
function animateCloseSlideLeft(): GSAPTweenVars {
  return {
    from: { x: "0%", y: "0%", opacity: 1 }, // From right
    to: { x: "-100%", y: "0%", opacity: 0, ease: "power3.inOut" }, // To center
  };
}

// Reusable mask animations
export function animateMaskOpen(opacity: number): GSAPTweenVars {
  return {
    from: { opacity: 0 },
    to: { opacity: opacity, duration: 0.5 },
  };
}

export function animateMaskClosed(opacity: number): GSAPTweenVars {
  return {
    from: { opacity: opacity },
    to: { opacity: 0, duration: 0.5 },
  };
}

// Device check
function isMobile(): boolean {
  return window.innerWidth <= 768;
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
