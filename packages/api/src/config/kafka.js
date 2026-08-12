import { Kafka } from "kafkajs";
import { env } from "./env.js";

const kafka = new Kafka({
  clientId: "coldmailer-api",
  brokers: [env.KAFKA_BROKER],
});

const producer = kafka.producer();

let isConnected = false;

export const connectProducer = async () => {
  if (isConnected) return;
  await producer.connect();
  isConnected = true;
  console.log("Kafka producer connected");
};

export const produceMessage = async (topic, message) => {
  if (!isConnected) {
    await connectProducer();
  }

  await producer.send({
    topic,
    messages: [
      {
        value: JSON.stringify(message),
        key: message.jobId,
      },
    ],
  });
};

export const disconnectProducer = async () => {
  if (isConnected) {
    await producer.disconnect();
    isConnected = false;
  }
};
