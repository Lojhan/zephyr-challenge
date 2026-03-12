import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { withZephyr } from 'zephyr-rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'md_viewer',
      exposes: {
        './MarkdownViewer': './src/components/MarkdownViewer.tsx',
      },
      filename: 'remoteEntry.js',
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
      },
    }),
    withZephyr(),
  ],
  server: {
    port: 3002,
  },
  output: {
    assetPrefix: 'auto',
  },
});
