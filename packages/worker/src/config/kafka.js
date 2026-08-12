import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "coldmailer-worker",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

export const createKafkaConsumer = async () => {
  const consumer = kafka.consumer({
    groupId: "email-dispatch-group",
  });
  await consumer.connect();
  console.log("Kafka consumer connected");
  return consumer;
};

export const createKafkaProducer = async () => {
  const producer = kafka.producer();
  await producer.connect();
  console.log("Kafka producer connected");
  return producer;
};
