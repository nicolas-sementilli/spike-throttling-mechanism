import React, { useState } from 'react';
import CSVReader from 'react-csv-reader';
import { convertToWorkerObjects } from '../utils/convertToWorkerObjects';

const CreateWorkers = () => {
  // State to store the workers information
  const [workers, setWorkers] = useState([]);
  // State to store the response status from the server after creating the workers
  const [responseStatus, setResponseStatus] = useState('');

  // This function will be called when the CSV file has been loaded
  const handleFileLoad = (data) => {
    // Converts the loaded data into worker objects
    const workerObjects = convertToWorkerObjects(data);
    // Updates the state with the worker objects
    setWorkers(workerObjects);
  };

  // This function will be called when the "Create Workers" button is clicked
  const handleCreateWorkers = async () => {
    console.log(workers);
    // Sends a POST request to the server to create the workers
    const response = await fetch('http://localhost:4000/createWorkers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workers: workers }),
    });
    // Parses the JSON response from the server
    const json = await response.json();
    console.log(json.message);
    // Updates the response status with the message from the server
    setResponseStatus(json.message);
  };

  return (
    <div>
      {/* Renders the CSVReader component */}
      <CSVReader onFileLoaded={handleFileLoad} />
      {/* Renders the "Create Workers" button */}
      <button onClick={handleCreateWorkers}>Create Workers</button>
      {/* Renders the response status if it exists */}
      {responseStatus && <div>{responseStatus}</div>}
    </div>
  );
};

export default CreateWorkers;
