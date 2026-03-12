import express from 'express';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.PORT) || 3000;

async function createServer() {
  const app = express();

  const distPath = path.resolve(import.meta.dirname, 'dist');
  const templatePath = path.join(distPath, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.error('Build not found. Run "pnpm build" first.');
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf-8');

  // Serve static assets with caching
  app.use(
    '/static',
    express.static(path.join(distPath, 'static'), {
      maxAge: '1y',
      immutable: true,
    }),
  );

  // Serve other dist files (mf-manifest.json, etc.)
  app.use(express.static(distPath, { index: false }));

  app.get('*', async (_req, res) => {
    try {
      // Import the server render function (tsx handles JSX)
      const { render } = await import('./src/entry.server');
      const appHtml = render();

      const html = template.replace(
        '<div id="root"></div>',
        `<div id="root">${appHtml}</div>`,
      );

      res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
    } catch (err) {
      console.error('SSR Error:', err);
      // Fallback to client-side rendering
      res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
    }
  });

  app.listen(PORT, () => {
    console.log(`SSR server running at http://localhost:${PORT}`);
  });
}

createServer();
