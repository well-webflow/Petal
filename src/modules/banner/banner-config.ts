import { ATTR_ALLOW_CLOSE, ATTR_PETAL_DEBUG, ATTR_PETAL_SESSION_TTL } from "../../lib/attributes";

export interface BannerConfig {
  allowClose: boolean;
  debug: boolean;
  sessionTTLMinutes: number;
}

export function parseBannerConfig(banner: Element): BannerConfig {
  const allowClose = banner.getAttribute(ATTR_ALLOW_CLOSE) !== "false";
  const debug = banner.getAttribute(ATTR_PETAL_DEBUG) === "true";
  const sessionTTLMinutes = parseFloat(banner.getAttribute(ATTR_PETAL_SESSION_TTL) || "30");

  return {
    allowClose,
    debug,
    sessionTTLMinutes,
  };
}

export function logConfig(config: BannerConfig) {
  console.log("Banner - Configuration:", {
    allowClose: config.allowClose,
    sessionTTLMinutes: config.sessionTTLMinutes,
  });
}
