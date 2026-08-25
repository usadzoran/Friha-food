import * as fs from 'fs';
import * as path from 'path';

// Category WhatsApp Numbers Store (Local & persistent Map for section numbers)
const LOCAL_CATEGORY_WHATSAPP_FILE = path.join(process.cwd(), 'category_whatsapp_store.json');

export function getCategoryWhatsAppNumbers(): Record<string, string> {
  try {
    if (fs.existsSync(LOCAL_CATEGORY_WHATSAPP_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_CATEGORY_WHATSAPP_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading category WhatsApp store:', err);
  }
  return {};
}

export function saveCategoryWhatsAppNumbers(map: Record<string, string>): Record<string, string> {
  const current = getCategoryWhatsAppNumbers();
  const merged = { ...current, ...map };
  try {
    fs.writeFileSync(LOCAL_CATEGORY_WHATSAPP_FILE, JSON.stringify(merged, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving category WhatsApp store:', err);
  }
  return merged;
}

export function saveSingleCategoryWhatsAppNumber(categoryId: string, phone: string): Record<string, string> {
  const current = getCategoryWhatsAppNumbers();
  current[categoryId] = (phone || '').trim();
  try {
    fs.writeFileSync(LOCAL_CATEGORY_WHATSAPP_FILE, JSON.stringify(current, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving single category WhatsApp number:', err);
  }
  return current;
}
