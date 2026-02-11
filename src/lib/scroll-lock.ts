/**
 * Scroll Lock Utility
 *
 * Prevents scrolling by capturing the current scroll position and using position: fixed on the body.
 * This approach preserves the body's overflow property and works with sticky navigation.
 * Tracks lock count to support multiple simultaneous locks.
 */

let lockCount = 0;
let scrollPosition = 0;

/**
 * Locks scrolling by fixing the body position
 */
export function lockScroll(): void {
  if (lockCount === 0) {
    // Store current scroll position
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Apply lock using position fixed
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = "100%";
  }
  lockCount++;
}

/**
 * Unlocks scrolling and restores scroll position
 */
export function unlockScroll(): void {
  if (lockCount > 0) {
    lockCount--;
  }

  if (lockCount === 0) {
    // Remove lock styles
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    // Restore scroll position
    window.scrollTo(0, scrollPosition);
  }
}

/**
 * Resets the lock count (useful for cleanup)
 */
export function resetScrollLock(): void {
  if (lockCount > 0) {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollPosition);
    lockCount = 0;
  }
}
