import mongoose from "mongoose";

export default defineNitroPlugin(async (nitro) => {
  if (mongoose.connection.readyState !== 1) {
    const config = useRuntimeConfig();
    try {
      await mongoose.connect(config.mongodbUri, {
        dbName: config.dbName,
        authSource: "admin",
      });

      nitro.hooks.hookOnce('close', async () => {
        console.log('Disconnecting from MongoDb...')
        try {
          await mongoose.connection?.close()
          console.log('Successfully disconnected from mongodb')
        } catch(e) {
          console.error('Failed to disconnect to MongoDb.')
        }
      })
    } catch (error: any) {
      console.error("Failed to connect to MongoDB:", error);
      useBugsnag().notify(error);
      throw error;
    }
  }
});
