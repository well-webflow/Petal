// MEMORY
type MemoryItem = "modal" | "banner";

/**
 * Store Closed State in Session Storage
 * @param type The type of element (modal or banner)
 * @param name The name of the Petal Element to store
 */
export function storeClosedState(type: MemoryItem, name: string) {
  const now = new Date();
  sessionStorage.setItem(getMemoryKey(type, name), now.getTime().toString());
}

/**
 * Check Closed State in Session Storage
 * @param type The type of element (modal or banner)
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
 * @param type The type of element (modal or banner)
 * @param name The name of the Petal Element to clear
 */
export function clearClosedState(type: MemoryItem, name: string) {
  sessionStorage.removeItem(getMemoryKey(type, name));
}

function getMemoryKey(key: MemoryItem, name: string) {
  return `petal_memory_${key}_${name}`;
}
