import amqp from 'amqplib';
let channel;
let connection;
export const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.Rabbitmq_Host,
            port: 5672,
            username: process.env.Rabbitmq_Username,
            password: process.env.Rabbitmq_Password,
        });
        // Handle connection events
        connection.on('error', (err) => {
            console.error('❌ RabbitMQ connection error:', err);
            setTimeout(connectRabbitMQ, 5000); // Reconnect after 5 seconds
        });
        connection.on('close', () => {
            console.log('⚠️ RabbitMQ connection closed. Attempting to reconnect...');
            setTimeout(connectRabbitMQ, 5000);
        });
        channel = await connection.createChannel();
        // Handle channel events
        channel.on('error', (err) => {
            console.error('❌ RabbitMQ channel error:', err);
        });
        channel.on('close', () => {
            console.log('⚠️ RabbitMQ channel closed');
        });
        console.log("✅ Connected to RabbitMQ");
    }
    catch (error) {
        console.error("❌ Failed to connect to RabbitMQ:", error);
        // Retry connection after 5 seconds
        setTimeout(connectRabbitMQ, 5000);
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
