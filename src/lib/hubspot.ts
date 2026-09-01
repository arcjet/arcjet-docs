export type HubSpotConsent = {
  allowed?: boolean;
  categories?: {
    analytics?: boolean;
    advertisement?: boolean;
    functionality?: boolean;
  };
};

type HubSpotPrivacyCmd = [
  "addPrivacyConsentListener",
  (consent: HubSpotConsent) => void,
];

type HubSpotWindow = Window & {
  _hsp?: HubSpotPrivacyCmd[];
};

/**
 * HubSpot reports either per-category flags or a single `allowed` boolean
 * when categories are not present.
 */
export function isHubSpotAnalyticsAllowed(consent: HubSpotConsent): boolean {
  return (
    consent.categories?.analytics === true ||
    (consent.allowed === true && consent.categories === undefined)
  );
}

/**
 * Queue a HubSpot cookie-banner listener. Commands are buffered on `_hsp`
 * before the banner script loads.
 */
export function subscribeToHubSpotConsent(
  listener: (consent: HubSpotConsent) => void,
): void {
  if (typeof window === "undefined") return;
  const w = window as HubSpotWindow;
  (w._hsp ??= []).push(["addPrivacyConsentListener", listener]);
}
