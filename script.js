// Global variable to store temperature values
let temperatureValues = [];

function fetchTemperatureData(region, startDate, endDate) {
  const apiKey = "2124e4e8b2266ed9dc09f5386f2d5605"; // Replace with your OpenWeatherAPI key
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${region}&appid=${apiKey}&units=metric`;

  // Show the progress bar
  const progressBar = document.getElementById("progressBar");
  progressBar.classList.remove("hidden");

  // Fetch the temperature data for the specified region
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // Extract the temperature values from the API response
      const minTemp = data.main.temp_min;
      const maxTemp = data.main.temp_max;

      // Generate temperature values for the selected date range
      temperatureValues = generateTemperatureValues(startDate, endDate, minTemp, maxTemp);

      // Display the data on the table and line graph
      displayData(minTemp, temperatureValues, region);

      // Hide the progress bar
      progressBar.classList.add("hidden");

      // Reset the base temperature input
      document.getElementById("baseTempInput").value = "";
    })
    .catch(error => {
      console.log("Error fetching temperature data:", error);
      // Hide the progress bar
      progressBar.classList.add("hidden");
    });
}

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

function generateTemperatureValues(startDate, endDate, minTemp, maxTemp) {
  const temperatureValues = [];
  let currentDate = new Date(startDate);

  // Generate temperature values for the given date range
  while (currentDate <= endDate) {
    const day = currentDate.getDate();
    const formattedDate = formatDate(currentDate);
    const randomMinTemp = Math.floor(Math.random() * (maxTemp - minTemp + 1)) + minTemp;
    const randomMaxTemp = addRandomNumber(randomMinTemp);

    temperatureValues.push([day, formattedDate, randomMinTemp, randomMaxTemp]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return temperatureValues;
}

function displayData(baseTemp, temperatureValues, region) {
  const dataBody = document.getElementById("dataBody");
  dataBody.innerHTML = "";

  // Assuming the value for cropMin is already defined
  const cropMin = 10;

  // Initialize arrays to store min accumulated, positive GDD, and cumulative sum
  const minAccumulated = [];
  const positiveGDD = [];
  const cumulativeSumArray = [];

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

  // Update the table caption with the region and period
  const dateRangeSelect = document.getElementById("dateRange");
  const selectedRange = dateRangeSelect.value;
  let period = "";

  if (selectedRange === "previous_month") {
    period = "Previous Month";
  } else if (selectedRange === "current_month") {
    period = "Current Month";
  } else if (selectedRange === "last_30_days") {
    period = "Last 30 Days";
  }

  const tableCaption = document.getElementById("tableCaption");
  tableCaption.innerHTML = `<h3>Growing Degree Days for ${region}, Period: ${period}</h3>`;
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
          borderColor: "rgba(0, 128, 0, 1)",
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
            color:"black",
            borderColor:"rgba(0,0,0,1)",
          },
          ticks: {
            color: "black", // Set x-axis values color to black
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Cumulative GDD",
            color:"black",
            borderColor:"rgba(0,0,0,1)",
          },
          ticks: {
            color: "black", // Set x-axis values color to black
          },
        },
      },
    },
  });
}

// Add event listener to the baseTempForm submit event
document.getElementById("baseTempForm").addEventListener("submit", function (event) {
  event.preventDefault();

  // Get the base temperature, date range, and region from the inputs
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

  // Get the region input
  const regionInput = document.getElementById("regionInput");
  const region = regionInput.value;

  // Fetch temperature data for the specified region and display it
  fetchTemperatureData(region, startDate, endDate);
});
