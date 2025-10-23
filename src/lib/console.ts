// Custom Error classes for Petal
export class PetalError extends Error {
  constructor(
    message: string,
    public readonly element?: Element,
    public readonly petalName?: string
  ) {
    super(message);
    this.name = "PetalError";
  }
}

export class MissingNameError extends PetalError {
  constructor(trigger: Element) {
    super('Trigger is missing the "petal" attribute', trigger);
    this.name = "MissingNameError";
  }
}

export class MissingPopupError extends PetalError {
  constructor(popupName: string, trigger: Element) {
    super(`Popup with name "${popupName}" not found`, trigger, popupName);
    this.name = "MissingPopupError";
  }
}

export class MissingTriggerError extends PetalError {
  constructor(popupName: string, trigger: Element) {
    super(`Trigger error for "${popupName}"`, trigger, popupName);
    this.name = "MissingTriggerError";
  }
}

export class MissingMaskError extends PetalError {
  constructor(popupName: string, trigger: Element) {
    super(`Mask not found for "${popupName}"`, trigger, popupName);
    this.name = "MissingMaskError";
  }
}

export class MissingSlotError extends PetalError {
  constructor(popupName: string, trigger: Element) {
    super(`Slot not found for "${popupName}"`, trigger, popupName);
    this.name = "MissingSlotError";
  }
}

// Helper function to log errors (for backward compatibility or simple logging)
export function logPetalError(error: PetalError): void {
  console.error(`[${error.name}]:`, error.message, error.element);
}
