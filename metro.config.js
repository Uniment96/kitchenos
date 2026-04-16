const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

/**
 * Firebase dual-instance fix.
 *
 * Expo SDK 54 enables `unstable_enablePackageExports: true`. The `firebase`
 * package's exports for `./app`, `./auth`, and `./firestore` have no
 * `react-native` condition, so Metro falls back to `default`, which resolves
 * to ESM shims (`export * from '@firebase/app'`, etc.).
 *
 * Those ESM shims load `@firebase/app` in an *ESM import context*, while the
 * Firebase Auth React Native build (`dist/rn/index.js`) loads `@firebase/app`
 * via CJS `require`. Metro can assign different module IDs to the same file
 * when it's reached from ESM vs CJS contexts — creating two separate
 * `@firebase/app` instances with separate component registries. This causes
 * `initializeAuth` to throw "Component auth has not been registered yet"
 * because `registerAuth` ran in one registry while `initializeApp` created
 * an app in the other.
 *
 * Solution: redirect all `firebase/*` imports to their CJS builds so the
 * entire Firebase SDK runs in a single CJS context and shares one
 * `@firebase/app` instance. For `firebase/auth` we use the React Native
 * build specifically because it calls `registerAuth("ReactNative")`.
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  switch (moduleName) {
    case 'firebase/app':
      return {
        filePath: path.resolve(__dirname, 'node_modules/firebase/app/dist/index.cjs.js'),
        type: 'sourceFile',
      };
    case 'firebase/auth':
      return {
        filePath: path.resolve(
          __dirname,
          'node_modules/firebase/node_modules/@firebase/auth/dist/rn/index.js'
        ),
        type: 'sourceFile',
      };
    case 'firebase/firestore':
      // Point directly to the self-contained CJS build of @firebase/firestore,
      // not the firebase/firestore shim which re-requires @firebase/firestore
      // via an ESM RN build, creating a separate @firebase/app module instance.
      return {
        filePath: path.resolve(
          __dirname,
          'node_modules/@firebase/firestore/dist/index.cjs.js'
        ),
        type: 'sourceFile',
      };
    default:
      return context.resolveRequest(context, moduleName, platform);
  }
};

module.exports = config;
