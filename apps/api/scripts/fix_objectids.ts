import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

async function fixRelations() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected to MongoDB.");
  
  const db = mongoose.connection.db;
  if(!db) throw new Error("db not resolved");
  
  const collections = ["products", "categories", "brands", "blogs", "coupons"];
  let totalFixed = 0;
  
  for (const collName of collections) {
    const coll = db.collection(collName);
    const docs = await coll.find({}).toArray();
    
    for (const doc of docs) {
      const updates: any = {};
      
      const fieldsToCheck = ["category", "brand", "productBase", "productType", "subcategory", "author"];
      for (const field of fieldsToCheck) {
        if (doc[field] && typeof doc[field] === "string" && mongoose.Types.ObjectId.isValid(doc[field])) {
          updates[field] = new mongoose.Types.ObjectId(doc[field]);
        }
      }
      
      if (doc.type && typeof doc.type === "string" && mongoose.Types.ObjectId.isValid(doc.type)) {
        updates.type = new mongoose.Types.ObjectId(doc.type);
      }
      if (doc.base && typeof doc.base === "string" && mongoose.Types.ObjectId.isValid(doc.base)) {
        updates.base = new mongoose.Types.ObjectId(doc.base);
      }
      
      // Fix categories array if it exists
      if (doc.categories && Array.isArray(doc.categories)) {
        const newCats = doc.categories.map((c: any) => {
          if (typeof c === "string" && mongoose.Types.ObjectId.isValid(c)) {
            return new mongoose.Types.ObjectId(c);
          }
          return c;
        });
        // Check if different
        if (JSON.stringify(doc.categories) !== JSON.stringify(newCats)) {
          updates.categories = newCats;
        }
      }
      
      if (Object.keys(updates).length > 0) {
        await coll.updateOne({ _id: doc._id }, { $set: updates });
        totalFixed++;
      }
    }
  }
  
  console.log(`Fixed ${totalFixed} documents to use ObjectIds instead of Strings.`);
  mongoose.disconnect();
}
fixRelations();
