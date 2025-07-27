import amqp from 'amqplib';
let channel; // ✅ Correct type annotation
export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.Rabbitmq_Host,
            port: 5672,
            username: process.env.Rabbitmq_Username,
            password: process.env.Rabbitmq_Password,
        });
        channel = await connection.createChannel();
        console.log("✅ Connected to RabbitMQ");
    }
    catch (error) {
        console.error("❌ Failed to connect to RabbitMQ:", error);
    }
};
export const publishTOQueue = async (queueName, message) => {
    if (!channel) {
        console.error("❌ RabbitMQ channel is not initialized");
        return;
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
    console.log(`📤 Message sent to queue: ${queueName}`);
};
