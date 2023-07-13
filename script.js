// Global variable to store temperature values
let temperatureValues = [];

function addRandomNumber(minTemp) {
  // Generate a random number between 1 and 10
  const randomNumber = Math.floor(Math.random() * 10) + 1;

  // Add the random number to the cell value
  const result = minTemp + randomNumber;

  return result;
}

function getMinGDD(minTemp, cropMin) {
  if (minTemp < cropMin) {
    return cropMin;
  } else {
    return minTemp;
  }
}

function getMaxGDD(maxTemp, cropMax) {
  if (maxTemp > cropMax) {
    return cropMax;
  } else {
    return maxTemp;
  }
}

function calculateCumulativeSum(values) {
  let cumulativeSum = 0;
  const cumulativeSumArray = [];

  for (const value of values) {
    if (value > 0) {
      cumulativeSum += value;
    }
    cumulativeSumArray.push(cumulativeSum);
  }

  return cumulativeSumArray;
}

function generateTemperatureValues() {
  const temperatureValues = [];

  // Generate random temperature values for 10 days
  for (let day = 1; day <= 10; day++) {
    // Generate a random number between 10 and 35 for minimum temperature
    const minTemp = Math.floor(Math.random() * 26) + 10;

    // Call the function with the value in B6
    const maxTemp = addRandomNumber(minTemp);

    // Store the day, min, and max temperatures in the array
    temperatureValues.push([day, minTemp, maxTemp]);
  }

  return temperatureValues;
}

function displayData(baseTemp) {
  const dataBody = document.getElementById("dataBody");
  dataBody.innerHTML = "";

  // Assuming the value for cropMin is already defined
  const cropMin = 10;

  // Initialize arrays to store min accumulated, positive GDD, and cumulative sum
  const minAccumulated = [];
  const positiveGDD = [];

  // Calculate the average temperature and other values for each day
  for (const temp of temperatureValues) {
    const day = temp[0];
    const minTemp = temp[1];
    const maxTemp = temp[2];

    // Calculate the average temperature
    const averageTemp = (minTemp + maxTemp) / 2;

    // Calculate the min accumulated and positive GDD
    const minAccum = averageTemp - baseTemp;
    minAccumulated.push(minAccum);
    positiveGDD.push(Math.max(0, minAccum));

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${day}</td>
      <td>${minTemp}</td>
      <td>${maxTemp}</td>
      <td>${baseTemp}</td>
      <td>${minAccum}</td>
      <td>${Math.max(0, minAccum)}</td>
    `;
    dataBody.appendChild(row);
  }

  // Calculate the cumulative sum of positive GDD values
  const cumulativeSum = calculateCumulativeSum(positiveGDD);

  const cumulativeSumRow = document.createElement("tr");
  cumulativeSumRow.innerHTML = `
    <td colspan="5"><strong>Cumulative Sum of Positive GDD</strong></td>
    <td>${cumulativeSum}</td>
  `;
  dataBody.appendChild(cumulativeSumRow);
}

// Add event listener to the baseTempForm submit event
document.getElementById("baseTempForm").addEventListener("submit", function(event) {
  event.preventDefault();

  // Get the base temperature from the input
  const baseTempInput = document.getElementById("baseTempInput");
  const baseTemp = parseFloat(baseTempInput.value);

  // Generate random temperature values for 10 days
  temperatureValues = generateTemperatureValues();

  // Display the data on the table
  displayData(baseTemp);

  // Reset the base temperature input
  baseTempInput.value = "";
});
