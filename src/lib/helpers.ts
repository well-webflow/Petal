import { MissingMaskError, MissingNameError, MissingPopupError, MissingSlotError, PetalError } from "./console";
import { ATTR_PETAL_NAME, ATTR_PETAL_ELEMENT, ATTR_PETAL_POPUP, PetalElements } from "./elements";

export function getAllPetalElementsOfType(el: string) {
  return document.querySelectorAll(`[${ATTR_PETAL_ELEMENT}='${el}']`);
}

export function getAllPopups(): NodeListOf<HTMLElement> {
  return document.querySelectorAll(`[${ATTR_PETAL_ELEMENT}='${ATTR_PETAL_POPUP}']`);
}

export function findPetal(el: Element): HTMLElement {
  const popupName = el.getAttribute(ATTR_PETAL_NAME);
  if (!popupName) throw new MissingNameError(el);

  const popup = document.querySelector(`[${ATTR_PETAL_NAME}='${popupName}'][${ATTR_PETAL_ELEMENT}='${ATTR_PETAL_POPUP}']`) as HTMLElement | null;
  if (!popup) throw new MissingPopupError(popupName, el);

  return popup;
}

export function findPopupElement(popup: HTMLElement, attr: string): Element | null {
  return popup.querySelector(`[${ATTR_PETAL_ELEMENT}='${attr}']`);
}

// Helper to iterate over triggers with error handling
export function forEachPetalTrigger(triggers: NodeListOf<Element>, callback: (petal: PetalElements) => void): void {
  triggers.forEach((trigger) => {
    try {
      const popup = findPetal(trigger);
      const name = trigger.getAttribute(ATTR_PETAL_NAME) || "unknown";

      const mask = popup.querySelector(`[${ATTR_PETAL_ELEMENT}='mask']`);
      if (!mask) throw new MissingMaskError(name, trigger);

      const slot = popup.querySelector(`[${ATTR_PETAL_ELEMENT}='slot']`);
      if (!slot) throw new MissingSlotError(name, trigger);

      callback({ name, trigger, popup, mask, slot });
    } catch (error) {
      if (error instanceof PetalError) {
        // Log and skip invalid triggers
        console.error(`[${error.name}]:`, error.message, error.element);
      } else {
        throw error; // Re-throw unexpected errors
      }
    }
  });
}
