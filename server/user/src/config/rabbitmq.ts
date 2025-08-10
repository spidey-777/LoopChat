// /Users/ankitdamolia/Documents/projects/LoopChat/server/user/src/config/rabbitmq.ts

import { connect,  Connection as AmqpConnection, Channel, Options } from 'amqplib';

let channel: Channel;
let connection: AmqpConnection;
export const connectRabbitMQ = async () => {
  try {
    const connOptions: Options.Connect = {
      protocol: process.env.Rabbitmq_Protocol as 'amqp' | 'amqps',
      hostname: process.env.Rabbitmq_Host,
      port: Number(process.env.Rabbitmq_Port),
      username: process.env.Rabbitmq_Username,
      password: process.env.Rabbitmq_Password,
      vhost: process.env.Rabbitmq_Vhost,
    };

        connection = (await connect(connOptions)) as unknown as AmqpConnection;


    connection.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err);
      setTimeout(connectRabbitMQ, 5000);
    });

    connection.on('close', () => {
      console.log('⚠️ RabbitMQ connection closed. Attempting to reconnect...');
      setTimeout(connectRabbitMQ, 5000);
    });


     channel = await connection.createChannel();

    channel.on('error', (err) => {
      console.error('❌ RabbitMQ channel error:', err);
    });

    channel.on('close', () => {
      console.log('⚠️ RabbitMQ channel closed');
    });

    console.log('✅ Connected to RabbitMQ');
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ:', error);
    setTimeout(connectRabbitMQ, 5000);
  }
};
// ... rest of the file
export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {

    console.error('❌ RabbitMQ channel is not initialized. Cannot publish message.');
    return;
  }

  try {

    await channel.assertQueue(queueName, { durable: true });


    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log(`📤 Message sent to queue: ${queueName}`);
  } catch (error) {
    console.error(`❌ Failed to send message to queue ${queueName}:`, error);

  }
};