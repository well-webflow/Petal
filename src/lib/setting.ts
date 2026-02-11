export type PetalSetting<T> =
  | T
  | {
      desktop: T;
      tablet?: T;
      mobileLandscape?: T;
      mobile?: T;
    };

// Breakpoint thresholds (max-width, inclusive)
export const BREAKPOINT_MOBILE = 479;
export const BREAKPOINT_MOBILE_LANDSCAPE = 767;
export const BREAKPOINT_TABLET = 991;

export type BREAKPOINT_SUFFIXES = "tablet" | "mobile-landscape" | "mobile";

/**
 * Reads an attribute across a single breakpoint and parses each value through the provided `parse` function.
 *
 * @param el          The element to read attributes from.
 * @param baseAttr    The desktop attribute name (e.g. "petal-anim-open").
 *                    Tablet/mobile variants are derived by appending suffixes.
 * @param parse       Converts the raw string (or null if missing) to the desired type.
 * @param suffix      An optional suffix to append to the attribute name (e.g. "open" for "petal-anim-delay-open").
 */
export function parseSetting<T>(el: Element, baseAttr: string, parse: (raw: string | null) => T, breakpoint?: BREAKPOINT_SUFFIXES, suffix?: string): T | undefined {
  const selector = `${baseAttr}${suffix ? `-${suffix}` : ""}${breakpoint ? `-${breakpoint}` : ""}`;
  const raw = el.getAttribute(selector);
  if (raw === null) return undefined; // Attribute not found at all
  return parse(raw);
}

/**
 * Reads an attribute across all breakpoints and returns an object with parsed values for each breakpoint.
 * @param el The element to read attributes from.
 * @param baseAttr The desktop attribute name (e.g. "petal-anim-open"). Tablet/mobile variants are derived by appending suffixes.
 * @param parse Converts the raw string to the desired type.
 * @param suffix      An optional suffix to append to the attribute name (e.g. "open" for "petal-anim-delay-open").
 * @returns
 */
export function parseSettingBreakpoint<T>(el: Element, baseAttr: string, parse: (raw: string | null) => T, suffix?: string): PetalSetting<T | undefined> {
  return {
    desktop: parseSetting(el, baseAttr, parse, undefined, suffix),
    tablet: parseSetting(el, baseAttr, parse, "tablet", suffix),
    mobileLandscape: parseSetting(el, baseAttr, parse, "mobile-landscape", suffix),
    mobile: parseSetting(el, baseAttr, parse, "mobile", suffix),
  };
}

/**
 * Returns a value set across breakpoints based on current window width.
 * Priority: mobile → mobileLandscape → tablet → desktop (narrowest match wins).
 *
 * @param values The breakpoint configuration values
 * @param parse Optional function to parse/transform the resolved value
 */
export function getCurrentSettingValue<T>(values: PetalSetting<T>): T | undefined {
  const width = window.innerWidth;
  let resolved: T;

  if (typeof values !== "object" || values === null || !("desktop" in values)) {
    // Single value for all breakpoints
    resolved = values as T;
  } else {
    if (width <= BREAKPOINT_MOBILE) resolved = values.mobile ?? values.mobileLandscape ?? values.tablet ?? values.desktop;
    else if (width <= BREAKPOINT_MOBILE_LANDSCAPE) resolved = values.mobileLandscape ?? values.tablet ?? values.desktop;
    else if (width <= BREAKPOINT_TABLET) resolved = values.tablet ?? values.desktop;
    else resolved = values.desktop;
  }

  return resolved;
}

/**
 * Returns the value for the current breakpoint with fallback logic.
 * Priority: mobile → mobileLandscape → tablet → desktop (narrowest match wins).
 *
 * @param el The element to read the attribute from
 * @param baseAttr The base attribute name
 * @param parse Function to convert the raw string to the desired type
 * @param suffix Optional suffix to append to the attribute name
 */
export function getSettingValueOnCurrentBreakpoint<T>(el: Element, baseAttr: string, parse: (raw: string | null) => T, suffix?: string): T | undefined {
  const setting = parseSettingBreakpoint(el, baseAttr, parse, suffix);
  return getCurrentSettingValue(setting);
}

/**
 * Gets an attribute value from an element, parsing it across all breakpoints
 * and resolving to the appropriate value for the current viewport width.
 *
 * @param el          The element to read the attribute from
 * @param baseAttr    The base attribute name (e.g. "petal-dropdown-close-delay")
 * @param parse       Function to convert the raw string to the desired type
 * @returns           The resolved value for the current breakpoint
 */
export function getSettingAttr<T>(el: Element, baseAttr: string, parse: (raw: string | null) => T): T {
  const setting = parseSetting(el, baseAttr, parse);
  return getCurrentSettingValue(setting) || (null as unknown as T); // Return null if setting is undefined, otherwise return the resolved value
}
