const amqp = require('amqplib');
const express = require("express");

const app = express();
const port = process.env.PORT || 3001;

const rabbit_mq_host = process.env.RABBIT_MQ_HOST || 'localhost';
const logs = {
  logs:[]
}

async function consumeAndRespond() {
  const connection = await amqp.connect(`amqp://${rabbit_mq_host}`);
  const channel = await connection.createChannel();

  await channel.assertExchange('The_Exchange', 'direct', { durable: true });

  const queue = 'log_queue';
  await channel.assertQueue(queue);
  channel.bindQueue(queue, 'The_Exchange', 'log'); // No routing key needed for fanout exchange

  channel.consume(queue, (msg) => {
    if(msg.fields.routingKey === 'log'){
      channel.ack(msg)
      console.log(`Log: ${msg.content.toString()}`);
      logs.logs.push(`${msg.content.toString()}`);
    }
  }, { noAck: false });
}

app.get("/", (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(200);
  res.json(logs);
  res.end();
});

app.listen(port, () => {
  console.log('Monitor listening on port 3001!');
});

consumeAndRespond();