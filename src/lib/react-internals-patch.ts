import * as React from "react";

/**
 * React 19 renamed `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED` to
 * `__CLIENT_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED` / server variant.
 * Legacy libraries (e.g. react-three-fiber@8) still read the old pointer.
 * We alias whichever internal exists back to the legacy key before those
 * libraries execute.
 */
function ensureLegacyInternals() {
  // If the key exists, we might still need to patch the fields if they are missing.
  // So we capture it or create it.
  
  let internals = (React as Record<string, any>).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

  if (!internals) {
    // Try to find it via other names (React 19 style)
    const candidateKey = Object.getOwnPropertyNames(React).find(
      (key) =>
        key !== "__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED" &&
        key.toLowerCase().includes("internals"),
    );

    if (candidateKey) {
      internals = (React as Record<string, any>)[candidateKey];
    }
  }

  if (!internals) {
    // Try fetching from ReactDOM
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ReactDOM = require("react-dom") as Record<string, unknown>;
      const domInternals = ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      if (domInternals && typeof domInternals === "object") {
        internals = domInternals;
      }
    } catch {
      // ignore
    }
  }

  if (!internals) {
    // Fallback: Create a synthetic object
    internals = {};
  }

  // Ensure the legacy key points to our internals object
  if (!(React as Record<string, any>).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    Object.defineProperty(React, "__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED", {
      configurable: true,
      enumerable: false,
      value: internals,
      writable: false,
    });
  }

  // Now verify the critical fields exist on the internals object.
  // R3F accesses: 
  // - ReactCurrentBatchConfig.transition
  // - ReactCurrentDispatcher.current
  // - ReactCurrentOwner.current
  // - ReactCurrentActQueue.current (less critical usually)

  if (!internals.ReactCurrentBatchConfig) {
    internals.ReactCurrentBatchConfig = { transition: null };
  }

  if (!internals.ReactCurrentDispatcher) {
    internals.ReactCurrentDispatcher = { current: null };
  }

  if (!internals.ReactCurrentOwner) {
    internals.ReactCurrentOwner = { current: null };
  }
  
  // Double check fields
  if (internals.ReactCurrentBatchConfig && !("transition" in internals.ReactCurrentBatchConfig)) {
    internals.ReactCurrentBatchConfig.transition = null;
  }
  
  if (internals.ReactCurrentDispatcher && !("current" in internals.ReactCurrentDispatcher)) {
    internals.ReactCurrentDispatcher.current = null;
  }

  if (internals.ReactCurrentOwner && !("current" in internals.ReactCurrentOwner)) {
    internals.ReactCurrentOwner.current = null;
  }
}

ensureLegacyInternals();
