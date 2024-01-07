const amqp = require('amqplib');
const express = require("express");

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Initialize server variable
let server = null;

// RabbitMQ connection details and log storage
const rabbit_mq_host = process.env.RABBIT_MQ_HOST || 'localhost';
const logs = {
  logs: []
};

// Function to consume log messages from RabbitMQ and respond accordingly
async function consumeAndRespond() {
  // Connect to RabbitMQ
  const connection = await amqp.connect(`amqp://${rabbit_mq_host}`);
  const channel = await connection.createChannel();

  // Declare exchanges and queues
  await channel.assertExchange('The_Exchange', 'direct', { durable: true });
  await channel.assertExchange("The_StateExchange", "fanout", { durable: true });

  const queue = 'log_queue';
  await channel.assertQueue(queue);
  const stateQueue = 'monitor_state_queue';
  await channel.assertQueue(stateQueue, { exclusive: true });

  // Bind queues to exchanges
  channel.bindQueue(queue, 'The_Exchange', 'log'); // No routing key needed for fanout exchange
  channel.bindQueue(stateQueue, 'The_StateExchange', '');

  // Consume log messages from the log queue
  channel.consume(queue, (msg) => {
    if (msg.fields.routingKey === 'log') {
      channel.ack(msg);
      console.log(`Log: ${msg.content.toString()}`);
      logs.logs.push(`${msg.content.toString()}`);
    }
  }, { noAck: false });

  // Consume state messages from the state queue
  channel.consume(stateQueue, async (msg) => {
    console.log(`Log: ${msg.content.toString()}`);
    if (msg.content.toString() === 'SHUTDOWN') {
      // Close the server gracefully on SHUTDOWN
      server.close(err => {
        if (err) {
          console.log(err);
          app.close();
        }
        console.log('Server closed');
        process.exit(0);
      });
      console.log(msg.content.toString());
    }
  }, { noAck: true });
}

// Route to handle HTTP requests and return logs
app.get("/", (req, res) => {
  res.status(200);
  res.json(logs);
  res.end();
});

// Start the server and initiate RabbitMQ connection
server = app.listen(port, () => {
  console.log(`Monitor listening on port ${port}!`);
});

consumeAndRespond();
