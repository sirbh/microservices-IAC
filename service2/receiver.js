const amqp = require("amqplib");
const express = require("express");

let channel;
const app = express();
const port = process.env.PORT || 3000;
const rabbit_mq_host = process.env.RABBIT_MQ_HOST || 'localhost';

async function consumeAndRespond() {
  const connection = await amqp.connect(`amqp://${rabbit_mq_host}`);
  channel = await connection.createChannel();

  await channel.assertExchange("The_Exchange", "direct", { durable: true });

  const queue = "res_queue";
  await channel.assertQueue(queue);
  channel.bindQueue(queue, "The_Exchange", "message"); 

  channel.consume(
    queue,
    (msg) => {
      if(msg.fields.routingKey === "message"){
        console.log("text from message ",msg.content.toString());
        channel.ack(msg)
        channel.publish("The_Exchange", "log", Buffer.from(`${msg.content.toString()} MSG`));
      }
    },
    { noAck: false }
  );

}
app.get("/", (req, res) => {
  const text = req.query.text;
  console.log("text from http ",text);
  channel.publish(
    "The_Exchange",
    "log",
    Buffer.from(`${text} ${req.socket.remoteAddress}:${req.socket.remotePort}`)
  );
  res.sendStatus(200);
});


setTimeout(() => {
  app.listen(port, () => {
    consumeAndRespond();
  });
}, 2000);
