const amqp = require("amqplib");
const express = require("express");

let channel;
const app = express();
const port = process.env.PORT || 3000;
const rabbit_mq_host = process.env.RABBIT_MQ_HOST || "localhost";

let server = null;

async function consumeAndRespond() {
  const connection = await amqp.connect(`amqp://${rabbit_mq_host}`);
  channel = await connection.createChannel();

  await channel.assertExchange("The_Exchange", "direct", { durable: true });
  await channel.assertExchange("The_StateExchange", "fanout", { durable: true });

  const queue = "res_queue";
  await channel.assertQueue(queue);
  const stateQueue = "service_2_state_queue";
  await channel.assertQueue(stateQueue,{exclusive: true});
  
  channel.bindQueue(queue, "The_Exchange", "message");
  channel.bindQueue(stateQueue, 'The_StateExchange', '');

  channel.consume(
    queue,
    (msg) => {
      if (msg.fields.routingKey === "message") {
        console.log("text from message ", msg.content.toString());
        channel.ack(msg);
        channel.publish(
          "The_Exchange",
          "log",
          Buffer.from(`${msg.content.toString()} MSG`)
        );
      }
    },
    { noAck: false }
  );
  channel.consume(stateQueue,async (msg) => {

      console.log(`Log: ${msg.content.toString()}`);
      if(msg.content.toString() === 'SHUTDOWN'){
        console.log(msg.content.toString());
        server.close(err=>{
          if(err){
            console.log(err);
          }
          console.log('Server closed');
          process.exit(0);
        });
      }
  }, { noAck: true });

}
app.get("/", (req, res) => {
  const text = req.query.text;
  console.log("text from http ", text);
  channel.publish(
    "The_Exchange",
    "log",
    Buffer.from(`${text} ${req.socket.remoteAddress}:${req.socket.remotePort}`)
  );
  res.sendStatus(200);
});

setTimeout(() => {
  server = app.listen(port, () => {
    consumeAndRespond();
  });
}, 2000);
