import mongoose from "mongoose";

export default defineNitroPlugin(async (nitro) => {
  if (mongoose.connection.readyState !== 1) {
    const config = useRuntimeConfig();
    try {
      await mongoose.connect(config.mongodbUri, {
        dbName: config.dbName,
        authSource: "admin",
      });

      nitro.hooks.hook('close', async () => {
        console.log('Disconnecting from mongodb...')
        await mongoose.connection?.close()
      })
    } catch (error: any) {
      console.error("Failed to connect to MongoDB:", error);
      useBugsnag().notify(error); // Notify Bugsnag about the error when connecting to MongoDB
      throw error;
    }
  }
});
