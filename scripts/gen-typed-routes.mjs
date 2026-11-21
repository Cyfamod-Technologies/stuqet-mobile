// Regenerates .expo/types/router.d.ts for one app without starting a server.
//   node scripts/gen-typed-routes.mjs vendor   (or: customer)
// Typed routes are normally written by `expo start`; this is the same generator
// the CLI uses, so route paths type-check after adding or moving route files.
import { createRequire } from "node:module";
import path from "node:path";

const route = process.argv[2] === "customer" ? "customer" : "vendor";
const require = createRequire(import.meta.url);
process.env.EXPO_PUBLIC_ROUTE = route;
process.env.EXPO_ROUTER_APP_ROOT = path.resolve(`src/routes/${route}`);

const typedRoutes = require(
  require.resolve("@expo/router-server/build/typed-routes", {
    paths: [require.resolve("@expo/cli/package.json")],
  }),
);
typedRoutes.regenerateDeclarations(path.resolve(".expo/types"), {});
console.log(`typed routes regenerated for ${route}`);
