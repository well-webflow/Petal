/**
 * Debug Helper Module
 *
 * Provides debug logging functionality with module prefixes.
 */

/**
 * Debug configuration interface
 */
export interface DebugConfig {
  debug: boolean;
}
export type PetalModule = "MODAL" | "DROPDOWN" | "BANNER" | "NAV" | string;

/**
 * Debug logging function
 * Logs a message with a flower emoji prefix and module name if debug mode is enabled
 *
 * @param debug - Configuration object with debug flag
 * @param module - Module name to display in brackets
 * @param log - Log message to display
 */
export function debug(debug: boolean, module: PetalModule, log: any): void {
  if (!debug) return;

  console.log(`🌸 [${module}] ${log}`);
}

export function debugElements(debug: boolean, module: PetalModule, name: string, elements: NodeListOf<Element> | Element | null) {
  if (!debug) return;
  const length = elements instanceof NodeList ? elements.length : elements ? 1 : 0;

  console.log(`🌸 [${module}] Found ${length} ${name}(s)`);
  if (length > 0) console.log(elements);
}
