// 1 task to add documents to the database
import { MongoClient, ObjectId } from "mongodb";
import connect from "./connect.js";

async function upsertProduct() {
  const db = await connect();
  try {
    const productName = "Gaming Laptop";
    const supplierId = "64ba537c9fbcdb6d8938a831";
    const quantity = 10;

    const productTemplate = {
      name: productName,
      description: "High-performance laptop for gaming",
      tags: ["computer", "laptop", "electronics"],
      suppliers: [{
        supplierId: new ObjectId(supplierId),
        price: 8500,
        date: new Date()
      }]
    };

    const result = await db.collection("Products").updateOne(
      { name: productName },
      [
        {
          $set: {
            ...productTemplate,
            stock: {
              $ifNull: [  
                { $add: ["$stock", quantity] },  
                quantity  ]
            }
          }
        }
      ],
      { upsert: true }
    );

    if (result.upsertedId) {
      console.log(`✅ New Products "${productName}", ID: ${result.upsertedId}`);
    } else {
      console.log(`🔄 Update Products "${productName}" Inventory, current increment: ${quantity}`);
    }

  } catch (err) {
    console.error("Execution failed:", err);
  } finally {
    await db.client.close();
  }
}

upsertProduct();