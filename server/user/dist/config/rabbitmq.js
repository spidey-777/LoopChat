import ampq from 'amqplib';
let channel = ampq.Channel;
export const connectRabbitMQ = async () => {
    try {
        const connection = await ampq.connect({
            protocol: "amqp",
            hostname: process.env.Rabbitmq_Host,
            port: 5672,
            username: process.env.Rabbitmq_Username,
            password: process.env.Rabbitmq_Password,
        });
        channel = await connection.createChannel();
        console.log("connected to rabbitmq");
    }
    catch (error) {
        console.log("failed to connect to RabbitMq", error);
    }
};
export const publishTOQueue = async (queueName, message) => {
    if (!channel) {
        console.log("RabbitMq channel is not initalized");
        return;
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
};
