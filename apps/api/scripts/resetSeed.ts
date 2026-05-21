import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const SEED_DIR = path.resolve(process.cwd(), "..", "..", "data", "seed");

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

async function resetAndSeed() {
  try {
    console.log("Connecting to Database for Seeding...");
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected.");
    
    const files = fs.readdirSync(SEED_DIR).filter((f) => f.endsWith(".json"));
    const db = mongoose.connection.db;
    
    for (const file of files) {
      const collectionName = file.replace(".json", "");
      if (USER_FLOW_COLLECTIONS.includes(collectionName)) continue;
      
      console.log(`Dropping collection: ${collectionName}...`);
      try {
        await db.collection(collectionName).drop();
      } catch (e: any) {
        if (e.code !== 26) { // 26 is ns not found
          console.warn(`Failed to drop ${collectionName}: ${e.message}`);
        }
      }
    }

    mongoose.disconnect();
    console.log("Database collections dropped. You can now run the seed command.");
    process.exit(0);
  } catch (error) {
    console.error("Failed:", error);
    process.exit(1);
  }
}
resetAndSeed();
