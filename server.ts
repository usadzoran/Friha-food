import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  getCategoryWhatsAppNumbers,
  saveCategoryWhatsAppNumbers,
  saveSingleCategoryWhatsAppNumber
} from './server/whatsapp';

const rootDir = process.cwd();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get all Category WhatsApp Numbers (local persistence map)
  app.get('/api/category-whatsapp', (req, res) => {
    try {
      const numbers = getCategoryWhatsAppNumbers();
      res.json({ success: true, numbers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message, numbers: {} });
    }
  });

  // Save/Update Category WhatsApp Numbers
  app.post('/api/category-whatsapp', (req, res) => {
    try {
      const { categoryId, whatsappNumber, numbers } = req.body;
      let updated: Record<string, string> = {};

      if (numbers && typeof numbers === 'object') {
        updated = saveCategoryWhatsAppNumbers(numbers);
      } else if (categoryId) {
        updated = saveSingleCategoryWhatsAppNumber(categoryId, whatsappNumber || '');
      }

      res.json({
        success: true,
        message: 'تم حفظ وتحديث رقم WhatsApp الخاص بالقسم بنجاح.',
        numbers: updated
      });
    } catch (err: any) {
      console.error('Error saving category WhatsApp number:', err);
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Vite middleware in development or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Handle SPA fallback for client routes (like /admin) in dev mode
    app.get('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(rootDir, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
