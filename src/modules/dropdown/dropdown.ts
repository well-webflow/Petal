/**
 * -+-+-+ Dropdown -+-+-+
 *
 * Main dropdown initialization module that handles both:
 * - Simple dropdowns (click-to-toggle with optional caret rotation)
 * - Mega dropdowns (hover-based with animated shared background)
 */

import { initializeSimpleDropdowns } from "./dropdown-simple";
import { initializeMegaDropdowns } from "./dropdown-mega";

/**
 * Initialize all dropdowns on the page
 */
export function initializeAllDropdowns(): void {
  initializeSimpleDropdowns();
  initializeMegaDropdowns();
}
