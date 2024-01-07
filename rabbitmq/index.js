// Import necessary modules
const express = require('express');
const { exec } = require('child_process');

// Create an Express app
const app = express();
const port = process.env.PORT || 3005;

// Define a route to stop the message queue
app.get('/stop-mq', (req, res) => {
    // Execute the stop_mq.sh script
    exec('./scripts/stop_mq.sh', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error}`);
            return res.status(500).send('Error executing script');
        }
        console.log(`Script output: ${stdout}`);
        // Exit the server process after stopping the message queue
        process.exit(0);
    });
});

// Start the Express app on the specified port
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    
    // Execute the start_mq.sh script when the server starts
    exec('./scripts/start_mq.sh', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error}`);
        }
        console.log(`Script output: ${stdout}`);
    });
});
