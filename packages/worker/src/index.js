import "dotenv/config";
import { connectDB } from "./config/database.js";
import { createKafkaConsumer } from "./config/kafka.js";

const startWorker = async () => {
  console.log("Starting Email Dispatcher Worker...");

  await connectDB();

  const consumer = await createKafkaConsumer();
  await consumer.subscribe({ topic: "email-dispatch-topic", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const job = JSON.parse(message.value.toString());
      console.log(`Processing email job:`, job);

      try {
        // TODO: Phase 3 - Implement actual email dispatch logic
        // 1. Fetch template from MongoDB
        // 2. Fetch resume URL from MongoDB
        // 3. Compile template with variables
        // 4. Check idempotency key in Redis
        // 5. Send email via SMTP provider
        console.log(`Email dispatched successfully for job: ${job.jobId}`);
      } catch (error) {
        console.error(`Failed to dispatch email:`, error);
        // TODO: Push to Dead Letter Queue (DLQ)
      }
    },
  });
};

startWorker().catch((err) => {
  console.error("Worker failed to start:", err);
  process.exit(1);
});
