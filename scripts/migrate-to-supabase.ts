import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load Supabase credentials from process.env or .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Error: Missing Supabase credentials!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  console.error('Example:');
  console.error('  VITE_SUPABASE_URL="https://your-project.supabase.co" VITE_SUPABASE_ANON_KEY="your-anon-key" npx tsx scripts/migrate-to-supabase.ts\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting Firestore -> Supabase Migration...');

  const backupFile = path.join(process.cwd(), 'firestore-backup.json');
  if (!fs.existsSync(backupFile)) {
    console.error(`❌ Backup file not found at ${backupFile}`);
    process.exit(1);
  }

  const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  const categories = backupData.categories || [];
  const products = backupData.products || [];
  const orders = backupData.orders || [];
  const orderItems = backupData.order_items || [];

  console.log(`\n📦 Found Backup Records:`);
  console.log(`  - Categories: ${categories.length}`);
  console.log(`  - Products: ${products.length}`);
  console.log(`  - Orders: ${orders.length}`);
  console.log(`  - Order Items: ${orderItems.length}`);

  // 1. Migrate Categories
  if (categories.length > 0) {
    console.log(`\n1️⃣ Migrating Categories (${categories.length} records)...`);
    const catPayload = categories.map((c: any) => ({
      id: c._id,
      name: c.name || 'قسم غير معنون',
      icon: c.icon || 'Folder',
      image_url: c.image_url || '',
      created_at: c.created_at || new Date().toISOString()
    }));

    const { error: catErr } = await supabase.from('categories').upsert(catPayload, { onConflict: 'id' });
    if (catErr) {
      console.error('❌ Error migrating categories:', catErr.message);
    } else {
      console.log('✅ Categories migration successful!');
    }
  }

  // 2. Migrate Products
  if (products.length > 0) {
    console.log(`\n2️⃣ Migrating Products (${products.length} records)...`);
    const prodPayload = products.map((p: any) => ({
      id: p._id,
      name: p.name || 'منتج غير معنون',
      description: p.description || '',
      price: Number(p.price) || 0,
      image_url: p.image_url || '',
      active: p.active !== false,
      category_id: p.category_id || '',
      created_at: p.created_at || new Date().toISOString()
    }));

    const { error: prodErr } = await supabase.from('products').upsert(prodPayload, { onConflict: 'id' });
    if (prodErr) {
      console.error('❌ Error migrating products:', prodErr.message);
    } else {
      console.log('✅ Products migration successful!');
    }
  }

  // 3. Migrate Orders
  if (orders.length > 0) {
    console.log(`\n3️⃣ Migrating Orders (${orders.length} records)...`);
    const ordPayload = orders.map((o: any) => ({
      id: o._id,
      customer_name: o.customer_name || 'عميل',
      customer_phone: o.customer_phone || '',
      customer_address: o.customer_address || '',
      notes: o.notes || '',
      status: o.status || 'pending',
      total_price: Number(o.total_price) || 0,
      created_at: o.created_at || new Date().toISOString(),
      updated_at: o.updated_at || new Date().toISOString()
    }));

    const { error: ordErr } = await supabase.from('orders').upsert(ordPayload, { onConflict: 'id' });
    if (ordErr) {
      console.error('❌ Error migrating orders:', ordErr.message);
    } else {
      console.log('✅ Orders migration successful!');
    }
  }

  // 4. Migrate Order Items
  if (orderItems.length > 0) {
    console.log(`\n4️⃣ Migrating Order Items (${orderItems.length} records)...`);
    const itemPayload = orderItems.map((i: any) => ({
      id: i._id,
      order_id: i.order_id,
      product_id: i.product_id || '',
      product_name: i.product_name || 'منتج',
      price: Number(i.price) || 0,
      quantity: Number(i.quantity) || 1,
      subtotal: Number(i.subtotal) || 0
    }));

    const { error: itemErr } = await supabase.from('order_items').upsert(itemPayload, { onConflict: 'id' });
    if (itemErr) {
      console.error('❌ Error migrating order items:', itemErr.message);
    } else {
      console.log('✅ Order Items migration successful!');
    }
  }

  // Verification step
  console.log('\n📊 Verifying Supabase record counts...');
  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: ordCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  const { count: itemCount } = await supabase.from('order_items').select('*', { count: 'exact', head: true });

  console.log(`  - Categories: Firestore=${categories.length} vs Supabase=${catCount}`);
  console.log(`  - Products:   Firestore=${products.length} vs Supabase=${prodCount}`);
  console.log(`  - Orders:     Firestore=${orders.length} vs Supabase=${ordCount}`);
  console.log(`  - OrderItems: Firestore=${orderItems.length} vs Supabase=${itemCount}`);

  console.log('\n🎉 Migration process completed!');
}

runMigration().catch((e) => console.error('Migration failed:', e));
