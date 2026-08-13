/**
 * Initializes mega dropdown menus with animated background and hover interactions.
 *
 * This function creates an interactive mega dropdown system that:
 * - Opens dropdowns on hover with a smooth animated background
 * - Manages only one active dropdown at a time
 * - Includes a delay before closing to improve user experience
 * - Disables on mobile devices (screens < 991px)
 */
function initMegaDropdowns() {
  // Delay in milliseconds before closing dropdowns when mouse leaves
  const DELAY = 0;
  // Media query to detect mobile devices
  const isMobile = window.matchMedia("(max-width: 991px)");

  // Find all mega dropdown elements and the shared background element
  const dropdowns = document.querySelectorAll('[petal-el="dropdown"][petal-dropdown-type="mega"]');
  const bg = document.querySelector('[petal-el="dropdown-bg"]') as HTMLElement | null;

  // Exit early if no dropdowns or background element found
  if (!dropdowns.length || !bg) return;

  // Track the currently active dropdown
  let activeDropdown: Element | null = null;
  // Track the timeout ID for delayed closing
  let closeTimeout: ReturnType<typeof setTimeout> | null = null;

  // Initialize background height to 0
  bg.style.height = "0px";

  /**
   * Opens a dropdown menu and animates the background to match its height
   */
  function openDropdown(dropdown: Element) {
    // Don't open dropdowns on mobile devices
    if (isMobile.matches) return;
    // Cancel any pending close operation
    if (closeTimeout !== null) clearTimeout(closeTimeout);
    // Don't reopen if already active
    if (activeDropdown === dropdown) return;
    // Close the currently active dropdown before opening a new one
    if (activeDropdown) closeDropdown(activeDropdown);

    // Set this dropdown as active
    activeDropdown = dropdown;

    // Find the dropdown menu element
    const menu = dropdown.querySelector('[petal-el="dropdown-menu"]') as HTMLElement;
    if (!menu) return;

    // Show the dropdown
    menu.style.display = "flex";

    // Use double requestAnimationFrame to ensure DOM has updated before measuring height
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Measure the menu height and animate the background to match
        const height = menu.getBoundingClientRect().height;
        bg!.style.height = `${height}px`;
      });
    });
  }

  /**
   * Closes a dropdown menu by hiding it
   */
  function closeDropdown(dropdown: Element) {
    const menu = dropdown.querySelector('[petal-el="dropdown-menu"]') as HTMLElement;
    if (menu) menu.style.display = "none";
  }

  /**
   * Schedules all dropdowns to close after a delay
   * This allows users to move between the dropdown and background without closing
   */
  function closeAll() {
    closeTimeout = setTimeout(() => {
      // Close the active dropdown if one exists
      if (activeDropdown) closeDropdown(activeDropdown);
      // Reset the background height
      bg!.style.height = "0px";
      // Clear the active dropdown reference
      activeDropdown = null;
    }, DELAY);
  }

  /**
   * Cancels any pending close operation
   * Called when mouse re-enters a dropdown or background area
   */
  function cancelClose() {
    if (closeTimeout !== null) clearTimeout(closeTimeout);
  }

  // Set up event listeners for each dropdown
  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('[petal-el="dropdown-toggle"]');
    const menu = dropdown.querySelector('[petal-el="dropdown-menu"]');

    // Open dropdown when hovering over the toggle element
    if (toggle) toggle.addEventListener("mouseenter", () => openDropdown(dropdown));

    if (menu) {
      // Cancel close when mouse enters the menu (prevents premature closing)
      menu.addEventListener("mouseenter", cancelClose);
      // Schedule close when mouse leaves the menu
      menu.addEventListener("mouseleave", closeAll);
    }

    // Schedule close when mouse leaves the entire dropdown
    dropdown.addEventListener("mouseleave", closeAll);
  });

  // Cancel close when mouse enters the background
  bg.addEventListener("mouseenter", cancelClose);
  // Schedule close when mouse leaves the background
  bg.addEventListener("mouseleave", closeAll);
}
