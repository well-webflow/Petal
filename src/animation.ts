// Popup animation types
export type PopupAnimation = "scale-up" | "scale-down" | "slide-up" | "slide-down" | "slide-left" | "slide-right";

const validAnimations: PopupAnimation[] = ["scale-up", "scale-down", "slide-up", "slide-down", "slide-left", "slide-right"];

const animationMap: Record<PopupAnimation, [(show: boolean) => GSAPTweenVars, (show: boolean) => GSAPTweenVars]> = {
  "scale-up": [animateScaleUp, animateScaleDown],
  "scale-down": [animateScaleDown, animateScaleUp],
  "slide-up": [animateSlideUp, animateSlideDown],
  "slide-down": [animateSlideDown, animateSlideUp],
  "slide-left": [animateSlideLeft, animateSlideRight],
  "slide-right": [animateSlideRight, animateSlideLeft],
};

export function getAnimationNew(popup: HTMLElement, open: boolean): GSAPTweenVars {
  // Popup Settings
  const animationDesktop = getPopupAnimation(popup.getAttribute("petal-anim"));
  const animationMobile = getPopupAnimation(popup.getAttribute("petal-anim-mobile")) || animationDesktop;
  const duration = parseFloat(popup.getAttribute("petal-duration") || "0.5");

  const animation = isMobile() ? animationMobile : animationDesktop;

  const [normal, reverse] = animationMap[animation];
  const gsapAnim = open ? reverse(false) : normal(true);
  gsapAnim.to.duration = duration;
  return gsapAnim;
}

// Individual animations
function animateScaleUp(show: boolean): GSAPTweenVars {
  return {
    from: { scale: 0 },
    to: { scale: 1, opacity: show ? 1 : 0, ease: "power3.inOut" },
  };
}

function animateScaleDown(show: boolean): GSAPTweenVars {
  return {
    from: { scale: 1 },
    to: { scale: 0, opacity: show ? 1 : 0, ease: "power3.inOut" },
  };
}

function animateSlideUp(show: boolean): GSAPTweenVars {
  return {
    from: { y: "100%", x: "0%" },
    to: { y: "0%", opacity: show ? 1 : 0, ease: "power3.inOut" },
  };
}

function animateSlideDown(show: boolean): GSAPTweenVars {
  return {
    from: { y: "0%", x: "0%" },
    to: { y: "100%", opacity: show ? 1 : 0, ease: "power3.inOut" },
  };
}

function animateSlideRight(show: boolean): GSAPTweenVars {
  return {
    from: { x: "0%", y: "0%" },
    to: { x: "100%", opacity: show ? 1 : 0, ease: "power3.inOut" },
  };
}

function animateSlideLeft(show: boolean): GSAPTweenVars {
  return {
    from: { x: "100%", y: "0%" },
    to: { x: "0%", opacity: show ? 1 : 0, ease: "power3.inOut" },
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
function getPopupAnimation(raw: string | null | undefined): PopupAnimation {
  return isPopupAnimation(raw ?? "") ? (raw as PopupAnimation) : "slide-up";
}
