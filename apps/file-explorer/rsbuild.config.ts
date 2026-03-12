import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { withZephyr } from 'zephyr-rsbuild-plugin';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'file_explorer',
      exposes: {
        './FileExplorer': './src/components/FileExplorer.tsx',
      },
      filename: 'remoteEntry.js',
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
      },
      dts: false,
    }),
    isProd && withZephyr(),
  ].filter(Boolean),
  server: {
    port: 3001,
  },
  output: {
    assetPrefix: 'auto',
  },
});
