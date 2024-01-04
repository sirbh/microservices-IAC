const amqp = require('amqplib');
const express = require("express");

const app = express();
const port = process.env.PORT || 3001;

let server = null;

const rabbit_mq_host = process.env.RABBIT_MQ_HOST || 'localhost';
const logs = {
  logs:[]
}

async function consumeAndRespond() {
  const connection = await amqp.connect(`amqp://${rabbit_mq_host}`);
  const channel = await connection.createChannel();

  await channel.assertExchange('The_Exchange', 'direct', { durable: true });
  await channel.assertExchange("The_StateExchange", "fanout", { durable: true });

  const queue = 'log_queue';
  await channel.assertQueue(queue);
  const stateQueue = 'monitor_state_queue';
  await channel.assertQueue(stateQueue,{exclusive: true});

  channel.bindQueue(queue, 'The_Exchange', 'log'); // No routing key needed for fanout exchange
  channel.bindQueue(stateQueue, 'The_StateExchange', '');

  channel.consume(queue, (msg) => {
    if(msg.fields.routingKey === 'log'){
      channel.ack(msg)
      console.log(`Log: ${msg.content.toString()}`);
      logs.logs.push(`${msg.content.toString()}`);
    }
  }, { noAck: false });

  channel.consume(stateQueue,async (msg) => {
      console.log(`Log: ${msg.content.toString()}`);
      if(msg.content.toString() === 'SHUTDOWN'){
        server.close(err=>{
          if(err){
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

app.get("/", (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(200);
  res.json(logs);
  res.end();
});

server = app.listen(port, () => {
  console.log('Monitor listening on port 3001!');
});

consumeAndRespond();