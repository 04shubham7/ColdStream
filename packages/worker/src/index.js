import "dotenv/config";
import mongoose from "mongoose";
import { Kafka } from "kafkajs";
import Redis from "ioredis";
import { sendEmail, compileTemplate, compileSubject } from "./services/email.service.js";
import { isDuplicateJob, markJobProcessed } from "./services/idempotency.service.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/coldmailer";
const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || "email-dispatch-topic";
const KAFKA_DLQ_TOPIC = process.env.KAFKA_DLQ_TOPIC || "email-dispatch-dlq";
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || "email-dispatch-group";
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES) || 3;

const kafka = new Kafka({
  clientId: "coldmailer-worker",
  brokers: [KAFKA_BROKER],
});

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
});

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Worker: MongoDB connected");
  } catch (error) {
    console.error("Worker: MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const Template = mongoose.model("Template", new mongoose.Schema({
  name: String,
  subject: String,
  body: String,
  variables: [String],
}, { strict: false }));

const Resume = mongoose.model("Resume", new mongoose.Schema({
  name: String,
  fileUrl: String,
  fileName: String,
}, { strict: false }));

const EmailJob = mongoose.model("EmailJob", new mongoose.Schema({
  jobId: String,
  status: String,
  retryCount: Number,
  maxRetries: Number,
  lastError: String,
  sentAt: Date,
}, { strict: false, timestamps: true }));

const processEmailJob = async (job) => {
  console.log(`Processing job: ${job.jobId}`);

  const isDuplicate = await isDuplicateJob(job.jobId);
  if (isDuplicate) {
    console.log(`Job ${job.jobId} already processed, skipping`);
    return;
  }

  await EmailJob.findOneAndUpdate(
    { jobId: job.jobId },
    { $set: { status: "processing" } }
  );

  try {
    const template = await Template.findById(job.templateId);
    if (!template) {
      throw new Error(`Template ${job.templateId} not found`);
    }

    const resume = await Resume.findById(job.resumeId);
    if (!resume) {
      throw new Error(`Resume ${job.resumeId} not found`);
    }

    const compiledBody = compileTemplate(template, job.variables);
    const compiledSubject = compileSubject(template.subject, job.variables);

    const attachments = [];
    if (resume.fileUrl) {
      attachments.push({
        filename: resume.fileName || "resume.pdf",
        url: resume.fileUrl,
      });
    }

    await sendEmail({
      to: job.recruiterEmail,
      subject: compiledSubject,
      html: compiledBody,
      attachments,
    });

    await markJobProcessed(job.jobId);

    await EmailJob.findOneAndUpdate(
      { jobId: job.jobId },
      { $set: { status: "sent", sentAt: new Date() } }
    );

    console.log(`Job ${job.jobId} sent successfully`);
  } catch (error) {
    console.error(`Job ${job.jobId} failed:`, error.message);

    const emailJob = await EmailJob.findOne({ jobId: job.jobId });
    if (!emailJob) return;

    const newRetryCount = (emailJob.retryCount || 0) + 1;

    if (newRetryCount >= MAX_RETRIES) {
      await EmailJob.findOneAndUpdate(
        { jobId: job.jobId },
        { $set: { status: "dlq", lastError: error.message } }
      );

      const producer = kafka.producer();
      await producer.connect();
      await producer.send({
        topic: KAFKA_DLQ_TOPIC,
        messages: [{ key: job.jobId, value: JSON.stringify({ ...job, error: error.message }) }],
      });
      await producer.disconnect();

      console.log(`Job ${job.jobId} moved to DLQ after ${MAX_RETRIES} retries`);
    } else {
      await EmailJob.findOneAndUpdate(
        { jobId: job.jobId },
        { $set: { status: "queued", lastError: error.message }, $inc: { retryCount: 1 } }
      );

      const producer = kafka.producer();
      await producer.connect();
      await producer.send({
        topic: KAFKA_TOPIC,
        messages: [{ key: job.jobId, value: JSON.stringify(job) }],
      });
      await producer.disconnect();

      console.log(`Job ${job.jobId} requeued (retry ${newRetryCount}/${MAX_RETRIES})`);
    }
  }
};

const startWorker = async () => {
  console.log("Starting Email Dispatcher Worker...");

  await connectDB();

  const consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID });
  await consumer.connect();
  console.log("Kafka consumer connected");

  await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const job = JSON.parse(message.value.toString());
      await processEmailJob(job);
    },
  });

  console.log(`Worker listening on topic: ${KAFKA_TOPIC}`);
};

startWorker().catch((err) => {
  console.error("Worker failed to start:", err);
  process.exit(1);
});
