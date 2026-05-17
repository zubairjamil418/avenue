import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Read the snapshot from the repository root (../../data/seed relative to apps/api).
const SEED_DIR = path.resolve(process.cwd(), "..", "..", "data", "seed");

// PRODUCTION SAFETY: never reseed user-flow collections, even if a stale
// JSON for them happens to exist in data/seed/. Keep in sync with exportSeed.ts.
const USER_FLOW_COLLECTIONS = [
  "users",
  "orders",
  "carts",
  "abandonedcarts",
  "addresses",
  "reviews",
  "customerreviews",
  "notifications",
  "vendors",
];

async function importSeedData() {
  try {
    console.log("Connecting to Database for Seeding...");
    if (!process.env.MONGO_URI) {
      console.error("ERROR: MONGO_URI is not defined in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected.");

    if (!fs.existsSync(SEED_DIR)) {
      console.error("ERROR: Seed directory not found at " + SEED_DIR);
      process.exit(1);
    }

    const files = fs.readdirSync(SEED_DIR).filter((f) => f.endsWith(".json"));
    if (files.length === 0) {
      console.log("No seed files found.");
      process.exit(0);
    }

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database not resolved.");

    for (const file of files) {
      const collectionName = file.replace(".json", "");

      if (USER_FLOW_COLLECTIONS.includes(collectionName)) {
        console.log(`Skipping user-flow collection: ${collectionName}`);
        continue;
      }

      console.log(`Importing to collection: ${collectionName}...`);

      const filePath = path.join(SEED_DIR, file);
      const rawData = fs.readFileSync(filePath, "utf-8");
      let data: any[] = JSON.parse(rawData);

      // Cast string _id back to ObjectId so upsert filters match correctly.
      data = data.map((doc: any) => {
        if (doc && doc._id && typeof doc._id === "string") {
          doc._id = new mongoose.Types.ObjectId(doc._id);
        }
        return doc;
      });

      if (data.length > 0) {
        const bulkOps = data.map((doc: any) => ({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: doc },
            upsert: true,
          },
        }));

        const result = await db.collection(collectionName).bulkWrite(bulkOps);
        console.log(
          `Successfully synced ${data.length} records into ${collectionName} ` +
            `(Matched: ${result.matchedCount}, Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount})`,
        );
      }
    }

    console.log("Database seeded successfully! Your demo store is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
}

importSeedData();
