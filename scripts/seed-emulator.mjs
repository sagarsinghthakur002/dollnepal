// Seeds the Firebase Local Emulator Suite with the admin account and dummy
// products, so the app is fully testable without a real Firebase project.
//
// Usage: npm run emulators   (in one terminal, leave it running)
//        npm run seed        (in another terminal, once)

process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= "127.0.0.1:9199";

import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "demo-dollnepal";
const adminEmail = process.env.ADMIN_EMAIL || "admin@dollnepal.com.np";
const adminPassword = process.env.ADMIN_SEED_PASSWORD || "DollNepal123!";

const app = initializeApp({ projectId });
const auth = getAuth(app);
const db = getFirestore(app);

async function seedAdminUser() {
  try {
    const existing = await auth.getUserByEmail(adminEmail);
    await auth.updateUser(existing.uid, { password: adminPassword });
    console.log(`Admin user already existed — password reset: ${adminEmail}`);
  } catch {
    await auth.createUser({ email: adminEmail, password: adminPassword, emailVerified: true });
    console.log(`Created admin user: ${adminEmail}`);
  }
}

const PRODUCTS = [
  { id: "sakura-blossom-doll", weight: 0.6, name: "Sakura Blossom Doll", category: "Doll", price: 1450, trending: true, description: "A soft-haired collectible doll in a blush pink dress, perfect for birthdays and shelf display." },
  { id: "cuddly-bear-buddy", weight: 0.8, name: "Cuddly Bear Buddy", category: "Doll", price: 1200, trending: false, description: "Extra-soft plush teddy bear, a cuddly companion for kids and doll lovers alike." },
  { id: "princess-aanya-doll", weight: 0.9, name: "Princess Aanya Doll", category: "Doll", price: 1850, trending: true, description: "A royal-gown doll with hand-painted details — a favourite pick for little princesses." },
  { id: "mini-cloud-plush-doll", weight: 0.3, name: "Mini Cloud Plush Doll", category: "Doll", price: 950, trending: false, description: "A pocket-sized plush doll, soft as a cloud — great as a small surprise gift." },
  { id: "forever-rose-bouquet", weight: 0.7, name: "Forever Rose Bouquet", category: "Bouquet", price: 1650, trending: true, description: "A hand-tied bouquet of premium roses wrapped in signature DollNepal pink and gold." },
  { id: "sunshine-tulip-bunch", weight: 0.6, name: "Sunshine Tulip Bunch", category: "Bouquet", price: 1350, trending: false, description: "Bright tulips bundled with rustic kraft wrap — a cheerful pick-me-up gift." },
  { id: "pastel-dream-bouquet", weight: 0.7, name: "Pastel Dream Bouquet", category: "Bouquet", price: 1750, trending: false, description: "A dreamy mix of pastel blooms finished with a satin ribbon bow." },
  { id: "golden-hour-gift-box", weight: 1.5, name: "Golden Hour Gift Box", category: "Gifts", price: 2200, trending: false, description: "A curated gift box with candles, a mug and a handwritten note card — pure warmth." },
  { id: "sweetheart-chocolate-hamper", weight: 1.0, name: "Sweetheart Chocolate Hamper", category: "Gifts", price: 1100, trending: true, description: "An assortment of premium chocolates in a ribboned hamper — sweet for any occasion." },
  { id: "starlight-jewellery-set", weight: 0.4, name: "Starlight Jewellery Set", category: "Gifts", price: 2850, trending: false, description: "An elegant necklace and earring set presented in a velvet gift box." },
  { id: "love-and-bloom-combo", weight: 1.6, name: "Love & Bloom Combo", category: "Combo", price: 2999, trending: true, description: "A doll and a rose bouquet together — our most-gifted combo for anniversaries." },
  { id: "celebration-combo-box", weight: 2.2, name: "Celebration Combo Box", category: "Combo", price: 3250, trending: false, description: "Gift hamper + fresh bouquet bundled for birthdays, graduations and big wins." },
];

async function seedProducts() {
  const batch = db.batch();
  for (const p of PRODUCTS) {
    const ref = db.collection("products").doc(p.id);
    batch.set(ref, {
      name: p.name,
      category: p.category,
      price: p.price,
      weight: p.weight,
      imageUrl: `/products/${p.id}.svg`,
      imagePath: null,
      description: p.description,
      trending: p.trending,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log(`Seeded ${PRODUCTS.length} products.`);
}

await seedAdminUser();
await seedProducts();
console.log("\nDone. Admin login:");
console.log(`  email:    ${adminEmail}`);
console.log(`  password: ${adminPassword}`);
process.exit(0);
