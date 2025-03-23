// task2-conditional-sale.js
import connect from "./connect.js";
import { ObjectId } from "mongodb";

async function processSale() {
  const db = await connect();
  try {
    const productId = "64af124220630af2d4db9ccd"; // product1 的 ID
    const quantity = 10;

    // 原子操作：条件更新库存
    const updateResult = await db.collection("Products").findOneAndUpdate(
      {
        _id: new ObjectId(productId),
        stock: { $gte: quantity } // 库存必须≥销售数量
      },
      { $inc: { stock: -quantity } },
      {
        returnDocument: "after", // 返回更新后的文档
        projection: { stock: 1 } // 仅返回库存字段
      }
    );

    // 验证更新结果
    if (!updateResult.value) {
      console.log("❌ Out of stock or product does not exist");
      return;
    }

    // 插入销售记录
    const saleRecord = {
      date: new Date(),
      productsSold: [{
        productId: new ObjectId(productId),
        quantity: quantity,
        price: 1000
      }]
    };
    await db.collection("Sales").insertOne(saleRecord);

    console.log("✅ Sales successful, remaining stock:", updateResult.value.stock);

  } catch (err) {
    console.error("Execution failed:", err.message);
  } finally {
    await db.client.close();
  }
}

processSale();