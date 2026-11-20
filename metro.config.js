const { withNativeWind } = require("nativewind/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// SVG transformer
const { transformer, resolver } = config;
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...resolver.sourceExts, "svg"],
};

// Which app is being bundled: "customer" | "vendor". Keep the default in sync
// with app.config.ts.
const ROUTE = process.env.EXPO_PUBLIC_ROUTE ?? "customer";

// Metro's cache has no built-in notion that ROUTE changes what it should be
// bundling. Building both apps back to back on the same machine (or runner)
// would otherwise let the second build reuse the first one's cached bundle and
// ship the wrong app's screens. cacheVersion is Metro's own mechanism for this:
// a different value forces a separate cache, so switching route can never
// silently reuse another route's bundle.
config.cacheVersion = ROUTE;

module.exports = withNativeWind(config, {
  input: `./src/routes/${ROUTE}/global.css`,
});
