// server.js
const amqp = require("amqplib");
const express = require("express");
const app = express();
const port = process.env.PORT || 3002;
const rabbit_mq_host = process.env.RABBIT_MQ_HOST || 'localhost';
let state = "RUNNING";

let channel;

async function consumeAndRespond() {
  const connection = await amqp.connect(`amqp://${rabbit_mq_host}`);
  channel = await connection.createChannel();

  await channel.assertExchange("The_Exchange", "direct", { durable: true });

  const queue = "state_queue";
  await channel.assertQueue(queue);
  channel.bindQueue(queue, "The_Exchange", "state");

  //   channel.consume(
  //     queue,
  //     (msg) => {
  //       if (msg.fields.routingKey === "message") {
  //         console.log("text from message ", msg.content.toString());
  //         channel.ack(msg);
  //         channel.publish(
  //           "The_Exchange",
  //           "log",
  //           Buffer.from(`${msg.content.toString()} MSG`)
  //         );
  //       }
  //     },
  //     { noAck: false }
  //   );
}

app.use(express.json());

// Define a route that responds to GET requests on the root path
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.put("/state", (req, res) => {
  console.log("state from http ", req.body.state);
  channel.publish(
    "The_Exchange",
    "state",
    Buffer.from(`${req.body.state.toString()}`)
  );

  state = req.body.state;
  res.send("OK");
});

// Start the server on the specified port
app.listen(port, () => {
    consumeAndRespond();
  console.log(`Server is running at http://localhost:${port}`);
});
