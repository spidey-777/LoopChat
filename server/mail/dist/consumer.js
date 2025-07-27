import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
export const startSendOtpConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.Rabbitmq_Host,
            port: 5672,
            username: process.env.Rabbitmq_Username,
            password: process.env.Rabbitmq_Password,
        });
        const channel = await connection.createChannel();
        const queueName = "send-otp";
        await channel.assertQueue(queueName, { durable: true });
        console.log("✅ Mail service consumer started");
        channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    const { to, subject, body } = JSON.parse(msg.content.toString());
                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.USER_MAIL,
                            pass: process.env.PASSWORD,
                        },
                    });
                    await transporter.verify();
                    console.log("✅ Email server is ready");
                    await transporter.sendMail({
                        from: `"LoopChat" <${process.env.USER}>`,
                        to,
                        subject,
                        text: body,
                    });
                    console.log(`📧 OTP sent to ${to}`);
                    channel.ack(msg);
                }
                catch (error) {
                    console.error("❌ Failed to send OTP:", error.message);
                }
            }
        });
    }
    catch (error) {
        console.error("❌ Failed to start RabbitMQ consumer:", error.message);
    }
};
