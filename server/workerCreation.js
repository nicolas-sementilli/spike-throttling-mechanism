require('dotenv').config();
const express = require('express');
const Twilio = require('twilio');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize the express app
const app = express();

// Use cors and body-parser middleware to handle CORS and JSON request bodies
app.use(cors());
app.use(bodyParser.json());

// Initialize the Twilio client using the account SID and auth token stored in environment variables
const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Endpoint that handles POST requests to /createWorkers. It expects an array of worker objects in the request body.
app.post('/createWorkers', async (req, res) => {
  // Extract the array of workers from the request body
  const workers = req.body.workers;

  try {
    // Create a promise for each worker that calls the createWorkerWithBackoff function
    const workerPromises = workers.map((worker) =>
      createWorkerWithBackoff(worker, 0)
    );

    // Wait for all promises to settle and then send a success response
    await Promise.allSettled(workerPromises);
    res.header('Content-Type', 'application/json');
    res.send({ message: 'Workers created.' });
  } catch (err) {
    // If there was an error, send a 500 error response with the error message
    res.header('Content-Type', 'application/json');
    res.status(500).send({ message: err.message });
  }
});

// Function that creates a worker using the Twilio API, with exponential backoff in case of rate limit errors
async function createWorkerWithBackoff(worker, retryCount) {
  try {
    // Try to create the worker using the Twilio API
    const newWorker = await client.taskrouter
      .workspaces(process.env.TWILIO_WORKSPACE_SID)
      .workers.create({
        friendlyName: worker.friendlyName,
        attributes: JSON.stringify(worker.attributes),
      });

    // Log a message indicating that the worker was created successfully
    console.log(
      `Worker ${newWorker.friendlyName} created with SID ${newWorker.sid}`
    );
  } catch (err) {
    // If the error status code is 429 (rate limit exceeded), retry with exponential backoff up to 5 times
    if (err.status === 429 && retryCount < 5) {
      console.log(`Hit 429 Error, Retry Count: ${retryCount}`);
      // Calculate the retry delay using exponential backoff
      const retryDelay = Math.pow(2, retryCount) * 1000;
      // Call the function again after the retry delay has passed
      setTimeout(() => {
        createWorkerWithBackoff(worker, retryCount + 1);
      }, retryDelay);
    } else {
      // If the error is not a rate limit exceeded error or the retry count has reached the max number of retries, throw the error
      throw err;
    }
  }
}

// Start the Express server
app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
