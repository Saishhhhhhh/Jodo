const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb+srv://dvinternal_db_user:AyyDv3VXaXiZzGQ7@jodoadmin.cc8vtnj.mongodb.net/jodo_commerce?appName=jodoadmin";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("jodo_commerce");
    const products = await db.collection("products").find({}).sort({createdAt: -1}).limit(10).toArray();
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
