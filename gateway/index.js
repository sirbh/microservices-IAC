// server.js

// Import required modules
const amqp = require("amqplib");
const express = require("express");
const axios = require("axios");

// Create an Express application
const app = express();
const port = process.env.PORT || 3002;
const rabbit_mq_host = process.env.RABBIT_MQ_HOST || 'localhost';
const monitor_host = process.env.MONITOR_HOST || 'localhost';
const monitor_port = process.env.MONITOR_PORT || 3001;
const rabbit_mq_port = process.env.RABBIT_MQ_PORT || 3005;

// Initialize server and application state variables
let server = null;
let state = "RUNNING";
const state_logs = {
  logs: []
};

let channel;

// Function to connect to RabbitMQ and set up exchanges
async function consumeAndRespond() {
  const connection = await amqp.connect(`amqp://${rabbit_mq_host}`);
  channel = await connection.createChannel();

  await channel.assertExchange("The_Exchange", "direct", { durable: true });
  await channel.assertExchange("The_StateExchange", "fanout", { durable: true });
}

// Middleware to parse incoming requests as text
app.use(express.text());

// Define a route that responds to GET requests on the root path
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// Route to retrieve run logs
app.get("/run-log", (req, res) => {
  res.status(200);
  res.json(state_logs);
  res.end();
});

// Route to retrieve messages from a monitoring service
app.get("/messages", (req, res) => {
  axios.get(`http://${monitor_host}:${monitor_port}`).then((response) => {
    res.status(200);
    res.json(response.data);
    res.end();
  }).catch((error) => {
    console.log(error);
    res.status(500);
    res.end();
  });
});

// Route to retrieve the current state
app.get("/state", (req, res) => {
  res.status(200);
  res.send(state);
  res.end();
});

// Route to update the state based on a PUT request
app.put("/state", (req, res) => {
  channel.publish(
    "The_StateExchange",
    "",
    Buffer.from(`${req.body.toString()}`)
  );

  // Update state and log transitions
  if (req.body === "RUNNING") {
    state_logs.logs.push(new Date().toISOString() + " " + state + "->" + "RUNNING");
    state = req.body;
  } else if (req.body === "SHUTDOWN") {
    // Handle shutdown request, including stopping RabbitMQ and closing the server
    axios.get(`http://${rabbit_mq_host}:${rabbit_mq_port}/stop-mq`).then((response) => {
      res.status(200);
      res.end();
    }).catch((error) => {
      console.log(error);
      res.status(500);
      res.end();
    });

    server.close(err => {
      if (err) {
        console.log(err);
      }
      console.log('Server closed');
      process.exit(0);
    });
  } else if (req.body === "PAUSED") {
    state_logs.logs.push(new Date().toISOString() + " " + state + "->" + "PAUSED");
    state = req.body;
  } else if (req.body === "INIT") {
    // Handle initialization request
    console.log("Called");
    state_logs.logs.push(new Date().toISOString() + " " + state + "->" + "INIT");
    state_logs.logs.push(new Date().toISOString() + " " + "INIT" + "->" + "RUNNING");
    state = "RUNNING";
  } else {
    // Invalid state transition
    res.status(400);
    res.end();
    return;
  }

  res.status(200);
  res.end();
});

// Start the server on the specified port and initiate RabbitMQ connection
server = app.listen(port, () => {
  consumeAndRespond();
  console.log(`Server is running at http://localhost:${port}`);
});
