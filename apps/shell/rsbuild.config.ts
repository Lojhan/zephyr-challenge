import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { withZephyr } from 'zephyr-rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'shell',
      remotes: {
        file_explorer:
          'file_explorer@http://localhost:3001/mf-manifest.json',
        md_viewer: 'md_viewer@http://localhost:3002/mf-manifest.json',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
      },
    }),
    withZephyr(),
  ],
  server: {
    port: 3000,
  },
  html: {
    title: 'Zephyr Docs Viewer',
    template: './src/index.html',
  },
});
