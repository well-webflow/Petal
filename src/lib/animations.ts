export function animateScaleUp(): GSAPTweenVars {
  return {
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1, ease: "power3.inOut" },
  };
}
export function animateScaleDown(): GSAPTweenVars {
  return {
    from: { scale: 1, opacity: 0 },
    to: { scale: 0, opacity: 1, ease: "power3.inOut" },
  };
}
export function animateOpenSlideUp(): GSAPTweenVars {
  return {
    from: { y: "100%", x: "0%", opacity: 0 }, // From bottom
    to: { y: "0%", x: "0%", opacity: 1, ease: "power3.inOut" }, // To top
  };
}
export function animateOpenSlideDown(): GSAPTweenVars {
  return {
    from: { y: "-100%", x: "0%", opacity: 0 }, // From top
    to: { y: "0%", x: "0%", opacity: 1, ease: "power3.inOut" }, // To bottom
  };
}
export function animateOpenSlideRight(): GSAPTweenVars {
  return {
    from: { x: "-100%", y: "0%", opacity: 0 }, // From left
    to: { x: "0%", y: "0%", opacity: 1, ease: "power3.inOut" }, // To center
  };
}
export function animateOpenSlideLeft(): GSAPTweenVars {
  return {
    from: { x: "100%", y: "0%", opacity: 0 }, // From right
    to: { x: "0%", y: "0%", opacity: 1, ease: "power3.inOut" }, // To center
  };
}
export function animateCloseSlideUp(): GSAPTweenVars {
  return {
    from: { y: "0%", x: "0%", opacity: 1 }, // From bottom
    to: { y: "-100%", x: "0%", opacity: 0, ease: "power3.inOut" }, // To top
  };
}
export function animateCloseSlideDown(): GSAPTweenVars {
  return {
    from: { y: "0%", x: "0%", opacity: 1 }, // From top
    to: { y: "100%", x: "0%", opacity: 0, ease: "power3.inOut" }, // To bottom
  };
}
export function animateCloseSlideRight(): GSAPTweenVars {
  return {
    from: { x: "0%", y: "0%", opacity: 1 }, // From left
    to: { x: "100%", y: "0%", opacity: 0, ease: "power3.inOut" }, // To center
  };
}
export function animateCloseSlideLeft(): GSAPTweenVars {
  return {
    from: { x: "0%", y: "0%", opacity: 1 }, // From right
    to: { x: "-100%", y: "0%", opacity: 0, ease: "power3.inOut" }, // To center
  };
}

// Mask animations

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
