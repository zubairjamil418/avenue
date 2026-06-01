/**
 * Migration: convert string ObjectId references in the products collection
 * to actual BSON ObjectIds so that Mongoose populate / $in queries work.
 *
 * Affected fields: category, brand, productType, productBase
 *
 * Run once:
 *   cd apps/api && npx tsx scripts/fixProductRefs.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const REF_FIELDS = ["category", "brand", "productType", "productBase"];
const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("ERROR: MONGO_URI is not defined in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db!;
  const col = db.collection("products");

  const products = await col.find({}).project({ _id: 1, ...Object.fromEntries(REF_FIELDS.map(f => [f, 1])) }).toArray();
  console.log(`Found ${products.length} products to process.`);

  let updated = 0;

  for (const product of products) {
    const patch: Record<string, mongoose.Types.ObjectId> = {};

    for (const field of REF_FIELDS) {
      const val = product[field];
      if (typeof val === "string" && OBJECT_ID_RE.test(val)) {
        patch[field] = new mongoose.Types.ObjectId(val);
      }
    }

    if (Object.keys(patch).length > 0) {
      await col.updateOne({ _id: product._id }, { $set: patch });
      updated++;
    }
  }

  console.log(`Migration complete. Updated ${updated} / ${products.length} products.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
