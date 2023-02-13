export const convertToWorkerObjects = (data) => {
  // An array of headers from the CSV file
  const headers = [
    'friendlyName',
    'contact_uri',
    'full_name',
    'email',
    'roles',
    'skills',
    'language',
  ];

  // Maps the data from the CSV file into worker objects
  const workerObjects = data
    // Filters out the header row
    .filter((row, index) => index !== 0)
    .map((row) => {
      const worker = {};
      headers.forEach((header, index) => {
        // Adds the friendlyName to the worker object
        if (header === 'friendlyName') {
          worker[header] = row[index];
        }
        // Adds the roles and skills to the worker attributes object
        else if (header === 'roles' || header === 'skills') {
          worker.attributes = worker.attributes || {};
          // Converts the comma-separated string into an array
          worker.attributes[header] = row[index].split(',');
        }
        // Adds the remaining attributes to the worker attributes object
        else {
          worker.attributes = worker.attributes || {};
          worker.attributes[header] = row[index];
        }
      });
      return worker;
    });

  return workerObjects;
};
