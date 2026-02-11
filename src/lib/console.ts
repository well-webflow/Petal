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

export class MissingModalError extends PetalError {
  constructor(modalName: string, trigger: Element) {
    super(`Modal with name "${modalName}" not found`, trigger, modalName);
    this.name = "MissingModalError";
  }
}

export class MissingTriggerError extends PetalError {
  constructor(modalName: string, trigger: Element) {
    super(`Trigger error for "${modalName}"`, trigger, modalName);
    this.name = "MissingTriggerError";
  }
}

export class MissingMaskError extends PetalError {
  constructor(modalName: string, trigger: Element) {
    super(`Mask not found for "${modalName}"`, trigger, modalName);
    this.name = "MissingMaskError";
  }
}

export class MissingSlotError extends PetalError {
  constructor(modalName: string, trigger: Element) {
    super(`Slot not found for "${modalName}"`, trigger, modalName);
    this.name = "MissingSlotError";
  }
}

// Helper function to log errors (for backward compatibility or simple logging)
export function logPetalError(error: PetalError): void {
  console.error(`[${error.name}]:`, error.message, error.element);
}
