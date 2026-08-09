import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('firestore-backup.json', 'utf8'));

console.log('--- SUMMARY OF FIRESTORE DATA ---');
for (const [colName, docs] of Object.entries(data)) {
  console.log(`\nCollection: "${colName}" (Total: ${(docs as any[]).length} docs)`);
  if ((docs as any[]).length > 0) {
    const keys = new Set<string>();
    (docs as any[]).forEach((d) => {
      Object.keys(d).forEach((k) => keys.add(k));
    });
    console.log(`  Fields:`, Array.from(keys));
    console.log(`  Sample doc:`, JSON.stringify((docs as any[])[0], null, 2).substring(0, 300));
  }
}
