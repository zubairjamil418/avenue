import mongoose from "mongoose";

const MONGO_URI =
  "mongodb+srv://root:4zi7Jr5vHCykgO@avanue.sr0kgj.mongodb.net/?appName=avanue";

async function main() {
  await mongoose.connect(MONGO_URI);
  const Product = mongoose.model(
    "Product",
    new mongoose.Schema({}, { strict: false }),
    "products"
  );
  const Brand = mongoose.model(
    "Brand",
    new mongoose.Schema({}, { strict: false }),
    "brands"
  );

  const brands: any[] = await Brand.find({}, "_id name").lean();
  const brandIds = new Set(brands.map((b) => b._id.toString()));
  console.log("Brands in DB:", brands.length);
  brands.forEach((b) => console.log(" ", b._id.toString(), "=", b.name));

  const products: any[] = await Product.find({}, "_id name brand").lean();
  const orphans = products.filter((p) => {
    const bid = p.brand ? p.brand.toString() : null;
    return !bid || !brandIds.has(bid);
  });

  console.log("\nOrphaned products (brand ref not in brands collection):", orphans.length);
  orphans.forEach((p) => console.log(" ", p.name, "| brand:", p.brand?.toString()));

  if (orphans.length === 0) {
    console.log("Nothing to fix.");
    await mongoose.disconnect();
    return;
  }

  // Pick a fallback brand (first brand in DB)
  const fallbackBrand = brands[0];
  console.log("\nAssigning fallback brand:", fallbackBrand.name, "(", fallbackBrand._id.toString(), ")");

  const orphanIds = orphans.map((p) => p._id);
  const result = await (Product as any).updateMany(
    { _id: { $in: orphanIds } },
    { $set: { brand: new mongoose.Types.ObjectId(fallbackBrand._id.toString()) } }
  );
  console.log("Updated:", result.modifiedCount, "products");

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
