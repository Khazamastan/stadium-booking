import { Router } from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SPEC_PATH = path.resolve(__dirname, '../../docs/openapi.yaml');

router.get('/openapi.yaml', async (req, res, next) => {
  try {
    const file = await readFile(SPEC_PATH, 'utf8');
    res.type('application/yaml').send(file);
  } catch (error) {
    next(error);
  }
});

router.get('/', (req, res) => {
  const specUrl = `${req.baseUrl}/openapi.yaml`;
  res.type('text/html').send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Venue Booking API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background-color: #f6f8fa; }
      #swagger-ui { margin: 0 auto; max-width: 1200px; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.addEventListener('load', () => {
        SwaggerUIBundle({
          url: '${specUrl}',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis],
          layout: 'BaseLayout',
        });
      });
    </script>
  </body>
</html>`);
});

export default router;
