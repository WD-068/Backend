import { Command } from "commander";
import { db } from "#db";
import { ObjectId } from "mongodb";

// 🔗 Define the collection once at the top
const products = db("blog").collection("products");

const program = new Command();
program
  .name("ecommerce-cli")
  .description("Simple product CRUD CLI")
  .version("1.0.0");

// LIST ALL
program
  .command("list")
  .description("List all products")
  .action(async () => {
    const all = await products.find().toArray();
    console.log(all);
  });

// GET BY ID
program
  .command("get")
  .description("Get product by ID")
  .argument("<id>", "Product ID")
  .action(async (id) => {
    const product = await products.findOne({ _id: new ObjectId(id) });
    console.log(product || "Product not found");
  });

// SEARCH BY TAG
program
  .command("search")
  .description("Search products by tag")
  .argument("<tag>", "Tag to search by")
  .action(async (tag) => {
    const matches = await products.find({ tags: tag }).toArray();
    console.log(matches);
  });

// ADD
program
  .command("add")
  .description("Add a new product")
  .argument("<name>", "Product name")
  .argument("<price>", "Price")
  .argument("<stock>", "Stock")
  .argument("<tags>", "Comma-separated tags")
  .action(async (name, priceStr, stockStr, tagsStr) => {
    const price = parseFloat(priceStr);
    const stock = parseInt(stockStr);
    const tags = tagsStr.split(",");
    const created_at = new Date();

    const result = await products.insertOne({
      name,
      price,
      stock,
      tags,
      created_at,
    });
    console.log("Inserted with ID:", result.insertedId);
  });

// UPDATE
program
  .command("update")
  .description("Update a product by ID")
  .argument("<id>", "Product ID")
  .argument("<name>", "New name")
  .argument("<price>", "New price")
  .argument("<stock>", "New stock")
  .argument("<tags>", "Comma-separated tags")
  .action(async (id, name, priceStr, stockStr, tagsStr) => {
    const price = parseFloat(priceStr);
    const stock = parseInt(stockStr);
    const tags = tagsStr.split(",");

    const result = await products.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, price, stock, tags } }
    );
    console.log(result.matchedCount ? "Product updated" : "Product not found");
  });

// DELETE
program
  .command("delete")
  .description("Delete a product by ID")
  .argument("<id>", "Product ID")
  .action(async (id) => {
    const result = await products.deleteOne({ _id: new ObjectId(id) });
    console.log(result.deletedCount ? "Product deleted" : "Product not found");
  });

// Exit cleanly
program.hook("postAction", () => process.exit(0));
program.parse();
