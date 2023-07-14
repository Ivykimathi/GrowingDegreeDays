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

function getStartOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getEndOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatDate(date) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

function generateTemperatureValues(startDate, endDate) {
  const temperatureValues = [];
  let currentDate = new Date(startDate);

  // Generate random temperature values for the given date range
  while (currentDate <= endDate) {
    const day = currentDate.getDate();
    const formattedDate = formatDate(currentDate);
    const minTemp = Math.floor(Math.random() * 26) + 10;
    const maxTemp = addRandomNumber(minTemp);

    temperatureValues.push([day, formattedDate, minTemp, maxTemp]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return temperatureValues;
}

function displayData(baseTemp, startDate, endDate) {
  const dataBody = document.getElementById("dataBody");
  dataBody.innerHTML = "";

  // Assuming the value for cropMin is already defined
  const cropMin = 10;

  // Initialize arrays to store min accumulated, positive GDD, and cumulative sum
  const minAccumulated = [];
  const positiveGDD = [];
  const cumulativeSumArray = []; // Array to store cumulative sum values

  // Generate temperature values for the selected date range
  temperatureValues = generateTemperatureValues(startDate, endDate);

  // Calculate the average temperature and other values for each day
  for (const temp of temperatureValues) {
    const day = temp[0];
    const date = temp[1];
    const minTemp = temp[2];
    const maxTemp = temp[3];

    // Calculate the average temperature
    const averageTemp = (minTemp + maxTemp) / 2;

    // Calculate the min accumulated and positive GDD
    const minAccum = averageTemp - baseTemp;
    minAccumulated.push(minAccum);
    positiveGDD.push(Math.max(0, minAccum));

    // Calculate the cumulative sum of positive GDD values up to the current day
    const cumulativeSum = calculateCumulativeSum(positiveGDD);
    cumulativeSumArray.push(cumulativeSum[cumulativeSum.length - 1]);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${day}</td>
      <td>${date}</td>
      <td>${minTemp}</td>
      <td>${maxTemp}</td>
      <td>${baseTemp}</td>
      <td>${minAccum}</td>
      <td>${Math.max(0, minAccum)}</td>
      <td>${cumulativeSumArray[cumulativeSumArray.length - 1]}</td>
    `;
    dataBody.appendChild(row);
  }

  // Display the line graph
  displayLineGraph(temperatureValues.map(temp => temp[1]), cumulativeSumArray);
}

function displayLineGraph(dates, cumulativeSum) {
  const ctx = document.getElementById("chart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Cumulative Sum of Positive GDD",
          data: cumulativeSum,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Cumulative Sum",
          },
        },
      },
    },
  });
}

// Add event listener to the baseTempForm submit event
document.getElementById("baseTempForm").addEventListener("submit", function (event) {
  event.preventDefault();

  // Get the base temperature and date range from the inputs
  const baseTempInput = document.getElementById("baseTempInput");
  const baseTemp = parseFloat(baseTempInput.value);

  const dateRangeSelect = document.getElementById("dateRange");
  const selectedRange = dateRangeSelect.value;
  const currentDate = new Date();
  let startDate, endDate;

  // Calculate the start and end dates based on the selected range
  if (selectedRange === "previous_month") {
    startDate = getStartOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    endDate = getEndOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  } else if (selectedRange === "current_month") {
    startDate = getStartOfMonth(currentDate);
    endDate = currentDate;
  } else if (selectedRange === "last_30_days") {
    startDate = new Date();
    startDate.setDate(currentDate.getDate() - 29);
    endDate = currentDate;
  }

  // Display the data on the table and line graph
  displayData(baseTemp, startDate, endDate);

  // Reset the base temperature input
  baseTempInput.value = "";
});
