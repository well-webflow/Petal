// MEMORY
type MemoryItem = "popup" | "banner";

/**
 * Store Closed State in Session Storage
 * @param type The type of element (popup or banner)
 * @param name The name of the Petal Element to store
 */
export function storeClosedState(type: MemoryItem, name: string) {
  const now = new Date();
  sessionStorage.setItem(getMemoryKey(type, name), now.getTime().toString());
}

/**
 * Check Closed State in Session Storage
 * @param type The type of element (popup or banner)
 * @param name The name of the Petal Element to check
 * @param sessionTTLMinutes The length that the session is valid for (in minutes)
 * @returns True if the element has been closed in this session and the session is still valid, false otherwise
 */
export function checkClosedState(type: MemoryItem, name: string, sessionTTLMinutes: number): boolean {
  const timestampStr = sessionStorage.getItem(getMemoryKey(type, name));
  if (!timestampStr) return false;

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    sessionStorage.removeItem(getMemoryKey(type, name));
    return false;
  }

  const now = new Date();
  const itemTime = new Date(timestamp);
  const diffMinutes = (now.getTime() - itemTime.getTime()) / (1000 * 60);

  if (diffMinutes > sessionTTLMinutes) {
    // Session expired
    sessionStorage.removeItem(getMemoryKey(type, name));
    return false;
  }

  return true;
}

/**
 * Clear Closed State from Session Storage
 * @param type The type of element (popup or banner)
 * @param name The name of the Petal Element to clear
 */
export function clearClosedState(type: MemoryItem, name: string) {
  sessionStorage.removeItem(getMemoryKey(type, name));
}

/**
 * Store Closed State in Local Storage with expiration Date
 * @param type The type of element (popup or banner)
 * @param name The name of the Petal Element to store
 * @param expiresAt The Date when this memory expires
 */
export function storeMemoryWithExpiration(type: MemoryItem, name: string, expiresAt: Date) {
  localStorage.setItem(getMemoryKey(type, name), expiresAt.getTime().toString());
}

/**
 * Check if element is in memory (was closed and not yet expired)
 * @param type The type of element (popup or banner)
 * @param name The name of the Petal Element to check
 * @returns True if the element is in memory and not expired, false if expired or not found
 */
export function checkMemory(type: MemoryItem, name: string): boolean {
  const expiresAtStr = localStorage.getItem(getMemoryKey(type, name));
  if (!expiresAtStr) return false;

  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt)) {
    localStorage.removeItem(getMemoryKey(type, name));
    return false;
  }

  const now = Date.now();

  if (now >= expiresAt) {
    // Memory expired, clear it
    localStorage.removeItem(getMemoryKey(type, name));
    return false;
  }

  // Still in memory (not expired)
  return true;
}

/**
 * Clear Memory from Local Storage
 * @param type The type of element (popup or banner)
 * @param name The name of the Petal Element to clear
 */
export function clearMemory(type: MemoryItem, name: string) {
  localStorage.removeItem(getMemoryKey(type, name));
}

function getMemoryKey(key: MemoryItem, name: string) {
  return `petal_memory_${key}_${name}`;
}
