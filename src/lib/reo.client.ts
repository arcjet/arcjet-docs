import {
  isHubSpotAnalyticsAllowed,
  subscribeToHubSpotConsent,
} from "@/lib/hubspot";
import { REO_CLIENT_ID, REO_SCRIPT_SRC } from "@/lib/reo";

type ReoClient = {
  init: (config: { clientID: string }) => void;
};

const REO_SYMBOL = Symbol.for("arcjet:reo");
const REO_SCRIPT_ID = "reo-script";

declare global {
  interface Window {
    Reo?: ReoClient;
    [REO_SYMBOL]: ReoClient | undefined;
  }
}

let hubSpotConsentListenerRegistered = false;

/**
 * Initialize Reo after HubSpot analytics consent and `static.reo.dev` load.
 *
 * Reo's SDK fetches `api.reo.dev` directly (no configurable host). Safari
 * content blockers and tracker lists may block those calls; that is acceptable
 * because Reo is optional analytics behind consent, not required functionality.
 *
 * @see https://docs.reo.dev/reo.dev-javascript-cookies-and-consent-guide
 */
export function initializeReo(): void {
  if (typeof window === "undefined") {
    throw new Error("Reo can only be initialized in the browser");
  }

  if (window[REO_SYMBOL]) {
    return;
  }

  const Reo = window.Reo;
  if (!Reo) {
    console.error("Error loading Reo: window.Reo is missing");
    return;
  }

  window[REO_SYMBOL] = Reo;
  Reo.init({ clientID: REO_CLIENT_ID });
}

function loadReoScript(): void {
  const existingScript = document.getElementById(REO_SCRIPT_ID);
  if (existingScript) {
    if (window.Reo) initializeReo();
    return;
  }

  const script = document.createElement("script");
  script.id = REO_SCRIPT_ID;
  script.src = REO_SCRIPT_SRC;
  script.async = true;
  script.addEventListener("load", initializeReo, { once: true });
  script.addEventListener(
    "error",
    () => {
      console.error("Error loading Reo");
    },
    { once: true },
  );
  document.head.append(script);
}

/** Load and initialize Reo only after HubSpot analytics consent. */
export function initializeConsentGatedReo(): void {
  if (typeof window === "undefined") {
    throw new Error("Reo can only be initialized in the browser");
  }

  if (hubSpotConsentListenerRegistered) {
    return;
  }
  hubSpotConsentListenerRegistered = true;

  let wasAnalyticsAllowed = false;

  subscribeToHubSpotConsent((consent) => {
    const analyticsAllowed = isHubSpotAnalyticsAllowed(consent);
    if (wasAnalyticsAllowed && !analyticsAllowed) {
      // Reo has no documented runtime opt-out. Reload so its script is absent
      // under the newly persisted HubSpot consent state.
      window.location.reload();
      return;
    }

    wasAnalyticsAllowed = analyticsAllowed;
    if (analyticsAllowed) {
      loadReoScript();
    }
  });
}
