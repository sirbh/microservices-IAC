const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = process.env.PORT||3005;

app.get('/stop-mq', (req, res) => {
    exec('./scripts/stop_mq.sh', (error, stdout, stderr) => {
        if (error) {
        console.error(`Error executing script: ${error}`);
        return res.status(500).send('Error executing script');
        }
        console.log(`Script output: ${stdout}`);
        process.exit(0);
    });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  exec('./scripts/start_mq.sh', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
    }
    console.log(`Script output: ${stdout}`);
  });
});