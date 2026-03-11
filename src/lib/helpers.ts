import { ATTR_PETAL_ELEMENT, ATTR_PETAL_NAME, ATTR_PETAL_TRIGGER } from "./attributes";

export function getAllPetalElementsOfType(el: string): NodeListOf<HTMLElement> {
  return document.querySelectorAll(`[${ATTR_PETAL_ELEMENT}='${el}']`);
}

export function getPetalElementInParent(parent: HTMLElement, el: string): HTMLElement | null {
  return parent.querySelector(`[${ATTR_PETAL_ELEMENT}='${el}']`);
}

export function getPetalElementsInParent(parent: HTMLElement, el: string): NodeListOf<HTMLElement> | null {
  return parent.querySelectorAll(`[${ATTR_PETAL_ELEMENT}='${el}']`);
}

/**
 * Find Petal Element by Name
 * @param name The Petal Name for the Element (Set with petal=['NAME']).
 * @param el The Attribute of the Element to get.
 * @returns An Element of the correct type with the matching name or null if none is found.
 */
export function findPetalElementByName(name: string | null, el: string): HTMLElement | null {
  return document.querySelector(`[${ATTR_PETAL_NAME}='${name}'][${ATTR_PETAL_ELEMENT}='${el}']`);
}

/**
 * Find Petal Elements by Name
 * @param name The Petal Name for the Elements (Set with petal=['NAME']).
 * @param el The Attribute of the Elements to get.
 * @returns Elements of the correct type with the matching name or null if none is found.
 */
export function findPetalElementsByName(name: string | null, el: string): NodeListOf<HTMLElement> | null {
  return document.querySelectorAll(`[${ATTR_PETAL_NAME}='${name}'][${ATTR_PETAL_ELEMENT}='${el}']`);
}

export function findPetalElementByNameOrInParent(parent: HTMLElement, name: string | null, el: string): HTMLElement | null {
  // First try to find by name globally
  const globalMatch = findPetalElementByName(name, el);
  if (globalMatch) return globalMatch;

  // If no name match, try to find within the parent
  return getPetalElementInParent(parent, el);
}

export function findPetalElementsByNameOrInParent(parent: HTMLElement, name: string | null, el: string): NodeListOf<HTMLElement> | null {
  // First try to find by name globally
  const globalMatch = findPetalElementsByName(name, el);
  if (globalMatch && globalMatch.length > 0) return globalMatch;

  // If no name match, try to find within the parent
  return getPetalElementsInParent(parent, el);
}

/**
 * Find the closest parent element with a specific petal-el attribute
 * @param element The starting element
 * @param petalElType The petal-el type to search for (e.g., 'modal', 'dropdown')
 * @returns The closest parent with the specified petal-el type, or null if none found
 */
export function findClosestPetalParent(element: HTMLElement, petalElType: string): HTMLElement | null {
  let current = element.parentElement;

  while (current) {
    if (current.getAttribute(ATTR_PETAL_ELEMENT) === petalElType) {
      return current as HTMLElement;
    }
    current = current.parentElement;
  }

  return null;
}

/**
 * Find all triggers with a specific trigger type (e.g., "open" or "close")
 * Optionally filter by name using the petal attribute
 * @param triggerType The type of trigger ("open" or "close")
 * @param name Optional name to filter triggers by
 * @returns NodeList of matching trigger elements
 */
export function findTriggersByType(triggerType: string, name?: string | null): NodeListOf<HTMLElement> {
  if (name) {
    return document.querySelectorAll<HTMLElement>(`[${ATTR_PETAL_TRIGGER}="${triggerType}"][${ATTR_PETAL_NAME}="${name}"]`);
  }
  return document.querySelectorAll<HTMLElement>(`[${ATTR_PETAL_TRIGGER}="${triggerType}"]`);
}

/**
 * Find triggers within a parent element or by name globally
 * @param parent The parent element to search within
 * @param name The name to match globally (optional)
 * @param triggerType The type of trigger ("open" or "close")
 * @returns NodeList of matching trigger elements
 */
export function findTriggersByNameOrInParent(parent: HTMLElement, name: string | null, triggerType: string): NodeListOf<HTMLElement> {
  // First try to find by name globally
  if (name) {
    const globalMatch = document.querySelectorAll<HTMLElement>(`[${ATTR_PETAL_TRIGGER}="${triggerType}"][${ATTR_PETAL_NAME}="${name}"]`);
    if (globalMatch && globalMatch.length > 0) return globalMatch;
  }

  // If no name match, try to find within the parent
  return parent.querySelectorAll<HTMLElement>(`[${ATTR_PETAL_TRIGGER}="${triggerType}"]`);
}

export function parseNumber(raw: string | null): number | undefined {
  if (raw === null) return undefined;
  const parsed = parseFloat(raw);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Parses a boolean attribute value.
 * Returns undefined if the raw value is null, otherwise returns true for "true" and false otherwise.
 */
export function parseBoolean(raw: string | null): boolean | undefined {
  if (raw === null) return undefined;
  return raw === "true";
}

/**
 * Parses an offset value.
 * Returns the string as-is if it contains "%", otherwise parses as an integer.
 * Returns 0 if the raw value is null.
 */
export function parseOffset(raw: string | null): number | string {
  if (raw === null) return 0;
  return raw.includes("%") ? raw : parseInt(raw);
}

export function parseString(raw: string | null): string | undefined {
  return raw ?? undefined;
}

/**
 * Identity parser that returns the value as-is, typed as the provided generic.
 * Useful when you need to satisfy a parser function signature but don't want to transform the value.
 */
export function parseAsIs<T>(raw: T): T {
  return raw;
}

/**
 * Checks if an object contains only null or undefined values
 * @param obj The object to check
 * @returns true if all values are null or undefined, false otherwise
 */
export function isAllNullish(obj: any): boolean {
  return Object.keys(obj).every((key) => obj[key] == null);
}
