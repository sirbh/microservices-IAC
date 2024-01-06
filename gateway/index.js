// server.js
const amqp = require("amqplib");
const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3002;
const rabbit_mq_host = process.env.RABBIT_MQ_HOST || 'localhost';
const monitor_host = process.env.MONITOR_HOST || 'localhost';
const monitor_port = process.env.MONITOR_PORT || 3001;
const rabbit_mq_port = process.env.RABBIT_MQ_PORT || 3005;

let server = null;

let state = "RUNNING";

const state_logs = {
  logs:[]
}

let channel;

async function consumeAndRespond() {
  const connection = await amqp.connect(`amqp://${rabbit_mq_host}`);
  channel = await connection.createChannel();

  await channel.assertExchange("The_Exchange", "direct", { durable: true });
  await channel.assertExchange("The_StateExchange", "fanout", { durable: true });

}

app.use(express.text());

// Define a route that responds to GET requests on the root path
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.get("/run-log", (req, res) => {
  res.status(200);
  res.json(state_logs);
  res.end();
});

app.get("/messages", (req, res) => {
  axios.get(`http://${monitor_host}:${monitor_port}`).then((response) => {
    res.status(200);
    res.json(response.data);
    res.end()
  }).catch((error) => {
    console.log(error); 
    res.status(500);
    res.end();
  });
});

app.get("/state", (req, res) => {
  res.status(200);
  res.send(state);
  res.end();
});

app.put("/state", (req, res) => {
channel.publish(
  "The_StateExchange",
  "",
  Buffer.from(`${req.body.toString()}`)
); 
if(req.body === "RUNNING") {
  state_logs.logs.push(new Date().toISOString()+" "+state+"->"+"RUNNING");
  state = req.body;
}
else if(req.body === "SHUTDOWN") {
  axios.get(`http://${rabbit_mq_host}:${rabbit_mq_port}/stop-mq`).then((response) => {
    res.status(200);
    res.end()
  }).catch((error) => {
    console.log(error); 
    res.status(500);
    res.end();
  });

  server.close(err=>{
    if(err){
      console.log(err);
    }
    console.log('Server closed');
    process.exit(0);
  });

}
else if(req.body === "PAUSED") {
  state_logs.logs.push(new Date().toISOString()+" "+state+"->"+"PAUSED");
  state = req.body;
}

else if(req.body === "INIT") {
  console.log("CAlled");
  state_logs.logs.push(new Date().toISOString()+" "+state+"->"+"INIT");
  state_logs.logs.push(new Date().toISOString()+" "+"INIT"+"->"+"RUNNING");
  state = "RUNNING";
}

else {
  res.status(400);
  res.end();
  return;
}

  res.status(200);
  res.end();
});

// Start the server on the specified port
server = app.listen(port, () => {
    consumeAndRespond();
  console.log(`Server is running at http://localhost:${port}`);
});
