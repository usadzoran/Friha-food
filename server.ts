import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  dispatchOrderToWhatsAppDepartments,
  getPublicConfigStatus,
  saveLocalConfig,
  sendWhatsAppCloudMessage,
  getAllWhatsappMessages,
  getCategoryWhatsAppNumbers,
  saveCategoryWhatsAppNumbers,
  saveSingleCategoryWhatsAppNumber,
  createOrderAndDispatchWhatsAppServer
} from './server/whatsapp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // WhatsApp Configuration Status (Public safe status, no secrets exposed)
  app.get('/api/whatsapp-status', (req, res) => {
    try {
      const status = getPublicConfigStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  // Save WhatsApp Configuration (Server-Side only)
  app.post('/api/whatsapp-config', (req, res) => {
    try {
      const { phoneNumberId, wabaId, accessToken } = req.body;
      const updated = saveLocalConfig({ phoneNumberId, wabaId, accessToken });
      res.json({
        success: true,
        message: 'تم حفظ إعدادات WhatsApp Cloud API بنجاح على الخادم.',
        config: getPublicConfigStatus()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Get all Category WhatsApp Numbers
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

  // Test WhatsApp Cloud Message Send
  app.post('/api/whatsapp-test', async (req, res) => {
    try {
      const { toPhone, message } = req.body;
      if (!toPhone) {
        return res.status(400).json({ success: false, error: 'رقم هاتف الواتساب مطلوب.' });
      }

      const testMsg = message || `🔔 رسالة تجريبية من متجر (اشري من دارك)\nتم التحقق من ربط WhatsApp Cloud API بنجاح! 🚀\nالوقت: ${new Date().toLocaleTimeString('ar-DZ')}`;
      const result = await sendWhatsAppCloudMessage(toPhone, testMsg);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Create Order and Auto-Dispatch to WhatsApp Departments (Server-Side)
  app.post('/api/orders', async (req, res) => {
    try {
      const { customer, items, total_price } = req.body;
      if (!customer || !customer.name || !customer.phone || !customer.address) {
        return res.status(400).json({ success: false, error: 'بيانات الزبون (الاسم، الهاتف، العنوان) مطلوبة.' });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'سلة المشتريات فارغة.' });
      }

      const result = await createOrderAndDispatchWhatsAppServer({
        customer,
        items,
        total_price
      });

      res.json(result);
    } catch (err: any) {
      console.error('Error in POST /api/orders:', err);
      res.status(500).json({ success: false, error: err?.message || 'فشل إنشاء الطلب وإرساله' });
    }
  });

  // Auto-Dispatch Order to Departments via WhatsApp
  app.post('/api/send-order-whatsapp', async (req, res) => {
    try {
      const { order_id, category_id, force_retry } = req.body;
      if (!order_id) {
        return res.status(400).json({ success: false, error: 'order_id is required' });
      }

      const result = await dispatchOrderToWhatsAppDepartments(order_id, {
        targetCategoryId: category_id,
        forceRetry: Boolean(force_retry)
      });

      res.json(result);
    } catch (err: any) {
      console.error('Error in /api/send-order-whatsapp:', err);
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Get WhatsApp Messages for orders (Logs)
  app.get('/api/whatsapp-messages', (req, res) => {
    try {
      const orderId = req.query.order_id as string | undefined;
      const messages = getAllWhatsappMessages(orderId);
      res.json(messages);
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
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
        const indexPath = path.resolve(__dirname, 'index.html');
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
