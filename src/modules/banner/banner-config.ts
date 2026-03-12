import { ATTR_ALLOW_CLOSE, ATTR_PETAL_DEBUG, ATTR_PETAL_MEMORY, ATTR_PETAL_MEMORY_EXPIRES } from "../../lib/attributes";
import { parseTime, parseBoolean } from "../../lib/helpers";

export interface BannerConfig {
  allowClose: boolean;
  debug: boolean;
  memory: {
    enabled: boolean;
    expires: Date | undefined;
  };
}

export function parseBannerConfig(banner: Element): BannerConfig {
  const allowClose = parseBoolean(banner.getAttribute(ATTR_ALLOW_CLOSE)) ?? true;
  const debug = parseBoolean(banner.getAttribute(ATTR_PETAL_DEBUG)) ?? false;

  const memoryEnabled = parseBoolean(banner.getAttribute(ATTR_PETAL_MEMORY)) ?? false;
  const memoryExpires = parseTime(banner.getAttribute(ATTR_PETAL_MEMORY_EXPIRES));

  return {
    allowClose,
    debug,
    memory: {
      enabled: memoryEnabled,
      expires: memoryExpires,
    },
  };
}

export function logConfig(config: BannerConfig) {
  console.log("Banner - Configuration:", {
    allowClose: config.allowClose,
    memory: config.memory,
  });
}
