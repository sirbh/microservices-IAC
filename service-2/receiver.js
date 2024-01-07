const amqp = require("amqplib");
const express = require("express");

// Initialize AMQP channel and Express app
let channel;
const app = express();
const port = process.env.PORT || 3000;
const rabbit_mq_host = process.env.RABBIT_MQ_HOST || "localhost";

let server = null;

// Function to consume messages from RabbitMQ and respond accordingly
async function consumeAndRespond() {
  // Connect to RabbitMQ
  const connection = await amqp.connect(`amqp://${rabbit_mq_host}`);
  channel = await connection.createChannel();

  // Declare exchanges and queues
  await channel.assertExchange("The_Exchange", "direct", { durable: true });
  await channel.assertExchange("The_StateExchange", "fanout", { durable: true });

  const queue = "res_queue";
  await channel.assertQueue(queue);
  const stateQueue = "service_2_state_queue";
  await channel.assertQueue(stateQueue, { exclusive: true });

  // Bind queues to exchanges
  channel.bindQueue(queue, "The_Exchange", "message");
  channel.bindQueue(stateQueue, 'The_StateExchange', '');

  // Consume messages from the message queue
  channel.consume(
    queue,
    (msg) => {
      if (msg.fields.routingKey === "message") {
        console.log("Text from message: ", msg.content.toString());
        channel.ack(msg);

        // Publish log message to the exchange
        channel.publish(
          "The_Exchange",
          "log",
          Buffer.from(`${msg.content.toString()} MSG`)
        );
      }
    },
    { noAck: false }
  );

  // Consume messages from the state queue
  channel.consume(stateQueue, async (msg) => {
    console.log(`Log: ${msg.content.toString()}`);

    // Handle SHUTDOWN message
    if (msg.content.toString() === 'SHUTDOWN') {
      console.log(msg.content.toString());

      // Close the server gracefully on SHUTDOWN
      server.close(err => {
        if (err) {
          console.log(err);
        }
        console.log('Server closed');
        process.exit(0);
      });
    }
  }, { noAck: true });
}

// Route to handle incoming HTTP requests
app.get("/", (req, res) => {
  const text = req.query.text;
  console.log("Text from HTTP: ", text);

  // Publish log message to the exchange
  channel.publish(
    "The_Exchange",
    "log",
    Buffer.from(`${text} ${req.socket.remoteAddress}:${req.socket.remotePort}`)
  );

  // Send HTTP response
  res.sendStatus(200);
});

// Start the server after a delay to ensure RabbitMQ connection is established
setTimeout(() => {
  server = app.listen(port, () => {
    consumeAndRespond();
  });
}, 2000);
