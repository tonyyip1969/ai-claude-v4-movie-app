import packageJson from '../../package.json';

/**
 * Get the application version from package.json
 * Tries environment variable first (build-time), then falls back to direct import
 * @returns The version string from package.json
 */
export const getAppVersion = (): string => {
  return process.env.APP_VERSION || packageJson.version;
};

/**
 * Get the application name from package.json
 * Tries environment variable first (build-time), then falls back to direct import
 * @returns The name string from package.json
 */
export const getAppName = (): string => {
  return process.env.APP_NAME || packageJson.name;
};
