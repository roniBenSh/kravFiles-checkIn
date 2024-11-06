let data;

let speedValues = [];
let pitchConvertedValues = [];
let rollConvertedValues = [];
let headingConvertedValues = [];
let convertedPitch = [];
let convertedLong = [];

let northValues = [];
let eastValues = [];
let downValues = [];
let startNorth;
let startEast;

const arrOfHeaders = ["Pitch", "Roll", "AltitudeSea" ,"Heading" ,"AltitudeGround", "CAS", "RecordingTime", "Latitude", "Longitude" ,"East", "North", "Down", "EntityType"];


let radius = [];
let colorsOf2D = [];
let colorOf3D = [];
let PitchChart;
let RollChart;
let HeadingChart;
let SeaAndGroundChart;
let SpeedChart;
let EastAndNorthChart;
let prvPointColor = "#808080";
let startIndexOfLatitude, endIndexOfLatitude;
let fileInput;

const planeImageUrl = "pics/planePicWhite.png";
const planeWidth = 50;
const planeHeight = 50;
let getPointStyle = [];
let indexOfPlane = [];
let imageOfPlane;
let nameOfStudent;

window.addEventListener("load", (event) => {
  let x = Math.floor(Math.random() * 6 + 1);
  if (x === 3) {
    nameOfStudent = "מאיה המושלמת";
  } else if (x === 2) {
    nameOfStudent = "רוני פפרוני";
  } else if (x === 4) {
    nameOfStudent = "גיל תרגיל";
  } else if (x === 5) {
    nameOfStudent = "אלון בלון";
  } else if (x === 6) {
    nameOfStudent = "עדי עבאדי";
  } else {
    nameOfStudent = "טל פורטל"
  }
  document.getElementById("studentName").innerText =' שם החניך:';
  document.getElementById("studentName").innerText += ` ${nameOfStudent}`;
});

document.getElementById("file-input").addEventListener("change", (event) => {
  fileInput = event.target.files[0];
  parseCsv(fileInput).then((csvData) => {
    const rows = csvData.split("\n");
    const headers = rows[0].split(",");
    data = rows.slice(1).map((row) => {
      const values = row.split(",");
      return headers.reduce((obj, header, index) => {
        // if ((header === '"OwnPlatform.StateVector.PresentPos.Pitch"' || header === '"OwnPlatform.StateVector.PresentPos.Roll"' || header === '"OwnPlatform.StateVector.PresentPos.AltitudeSea"' || header === '"OwnPlatform.StateVector.PresentPos.Heading"' || header === '"OwnPlatform.StateVector.PresentPos.AltitudeGround"' || header === '"OwnPlatform.StateVector.Velocity.CAS"' || header === '"EntityMetadata.RecordingTime"' || header === '"OwnPlatform.StateVector.PresentPos.Latitude"' || header === '"OwnPlatform.StateVector.PresentPos.Longitude"')) {
        if (header !== undefined) {
          if (checkHeader(header)) {
            if (
              values[index] !== undefined &&
              values[index] !== "" &&
              values[index] !== " " &&
              values[index] != NaN &&
              values[index] !== null &&
              values[index] !== "0" &&
              values[index] !== 0

            ) {
              if (header.charAt(0) === '"') {
                header = header.substring(1, header.length - 1);
                if (header !== "EntityMetadata.EntityType") {
                  values[index] = Number(
                    values[index].substring(1, values[index].length - 1)
                  );
                }
              }
              obj[header] = values[index];
            } else {
              header = header.substring(1, header.length - 1);
              obj[header] = undefined;
            }
          }
        }
        return obj;
      }, {});
    });//end of data conversion

    // latitude must be called first
    addMissingValues("OwnPlatform.StateVector.PresentPos.Latitude");
    addMissingValues("OwnPlatform.StateVector.PresentPos.Longitude");
    addMissingValues("OwnPlatform.StateVector.PresentPos.AltitudeSea");
    addMissingValues("OwnPlatform.StateVector.PresentPos.AltitudeGround");
    addMissingValues("OwnPlatform.StateVector.PresentPos.Pitch");
    addMissingValues("OwnPlatform.StateVector.PresentPos.Roll");
    addMissingValues("OwnPlatform.StateVector.PresentPos.Heading");
    addMissingValues("OwnPlatform.StateVector.Velocity.CAS");
    addMissingValues("OwnPlatform.StateVector.Velocity.North");
    addMissingValues("OwnPlatform.StateVector.Velocity.East");
    addMissingValues("OwnPlatform.StateVector.Velocity.Down");
    addMissingValues("EntityMetadata.RecordingTime");

    // createLocation();

    add10Rows("OwnPlatform.StateVector.PresentPos.AltitudeSea");
    add10Rows("OwnPlatform.StateVector.PresentPos.Longitude");
    add10Rows("OwnPlatform.StateVector.PresentPos.Latitude");
    add10Rows("OwnPlatform.StateVector.PresentPos.AltitudeGround");
    add10Rows("OwnPlatform.StateVector.PresentPos.Pitch");
    add10Rows("OwnPlatform.StateVector.PresentPos.Roll");
    add10Rows("OwnPlatform.StateVector.PresentPos.Heading");
    add10Rows("OwnPlatform.StateVector.Velocity.CAS");
    add10Rows("EntityMetadata.RecordingTime");

    downloadCSV();
    convertData();

    console.log(data);

    colorsOf2D = Array(data.length).fill("#808080"); // Default color is gray
    colorOf3D = Array(data.length).fill("#808080"); // Default color is gray
    radius = Array(data.length).fill(1);
    getPointStyle.length = data.length;
    getPointStyle.fill("triangle");

    PitchChart = creating2Dgraphs("PitchChart", "OwnPlatform.StateVector.PresentPos.Pitch");
    findExercise();
    RollChart = creating2Dgraphs("RollChart", "OwnPlatform.StateVector.PresentPos.Roll");
    HeadingChart = creating2Dgraphs("HeadingChart", "OwnPlatform.StateVector.PresentPos.Heading");
    SpeedChart = creating2Dgraphs("SpeedChart", "OwnPlatform.StateVector.Velocity.CAS");

    const chartDataSeaAndGround = {
      datasets: [
        {
          pointRadius: radius,
          showLine: true,
          mode: "line",
          borderWidth: 1,
          borderColor: colorsOf2D,
          data: data.map((item, index) => ({
            x: index,
            y:
              item["OwnPlatform.StateVector.PresentPos.AltitudeSea"] -
              item["OwnPlatform.StateVector.PresentPos.AltitudeGround"],
          })),
        },
        {
          pointRadius: radius,
          backgroundColor: "rgba(0, 0, 0, 0)",
          showLine: true,
          mode: "line",
          borderWidth: 1,
          borderColor: colorsOf2D,
          data: data.map((item, index) => ({
            x: index,
            y: item["OwnPlatform.StateVector.PresentPos.AltitudeSea"],
          })),
        },
      ],
    };

    SeaAndGroundChart = new Chart("SeaAndGroundChart", {
      type: "scatter",
      data: chartDataSeaAndGround,
      options: {
        legend: { display: false },
        scales: {
          type: "linear",
          position: "bottom",
          ticks: {
            stepSize: 1,
          },
        },
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: "x",
            },
            zoom: {
              enabled: true,
              mode: "x",
            },
          },
        },
        onClick: function (evt) {
          let elementIndex = SeaAndGroundChart.getElementsAtEvent(evt)[0]._index;
          handleChartClick2D(elementIndex, false);
        },
      },
    });

    const EastAndNorthData = {
      datasets: [
        {
          pointRadius: radius,
          backgroundColor: "rgba(0, 0, 0, 0)",
          showLine: true,
          mode: "line",
          borderWidth: 1,
          borderColor: colorsOf2D,
          data: data.map(item=> ({
            x: item['OwnPlatform.StateVector.PresentPos.Latitude'],
            y: item['OwnPlatform.StateVector.PresentPos.Longitude'],
          })),
        },
      ],
    };
    

    EastAndNorthChart = new Chart("EastAndNorthChart", {
      type: "scatter",
      plugins: {
        afterDraw: function (chart) {
          const meta = chart.getDatasetMeta(0);
          const ctx = chart.ctx;
          if (indexOfPlane[0] !== undefined) {
            const model = meta.data[indexOfPlane[0]]._model;
            // let angle = data[indexOfPlane[0]]["OwnPlatform.StateVector.PresentPos.Heading"];
            let angle = -headingConvertedValues[indexOfPlane[0]];
            ctx.save();
            ctx.translate(model.x, model.y);
            ctx.rotate((angle * Math.PI) / 180); // Rotate the canvas
            ctx.drawImage(imageOfPlane, -30 / 2, -30 / 2, 30, 30); // Draw the image
            ctx.restore();
          }
        },
      },
      data: EastAndNorthData,
      options: {
        legend: { display: false },
        scales: {
          type: "linear",
          position: "bottom",
          ticks: {
            stepSize: 1,
          },
        },
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: "x",
            },
            zoom: {
              enabled: true,
              mode: "x",
            },
          },
        },

        onClick: function (evt) {
          let elements = EastAndNorthChart.getElementsAtEvent(evt);
          const index = elements[0]._index;
          PlaneOnChart(EastAndNorthChart, index);
        },
      },
    });

    //create the 3d chart
    d3.csv(fileInput, function (array) {
      array =  data;

      // data.slice(5200, 6200);


      // let x = eastValues.map(parseFloat);
      // let y = northValues.map(parseFloat);
      // let z = downValues.map(parseFloat).map((value) => value * -1);
      let x = array.map((item) => parseFloat(item["OwnPlatform.StateVector.PresentPos.Latitude"]));
      let y = array.map((item) => parseFloat(item["OwnPlatform.StateVector.PresentPos.Longitude"]));
      let z = array.map((item) => parseFloat(item["OwnPlatform.StateVector.PresentPos.AltitudeSea"]));

      // Create an array to store traces for each loop
      let loopTraces = [];
      let findWO = findWingOverExerecise(array);
      if (findWO !== null) {
        loopTraces.push(createExercisesTracksIn3D(findWO, "orange", "WO"));
      }

      let findLoop370 = findLoop370Exercise(array);
      if (findLoop370 !== null) {
        loopTraces.push(
          createExercisesTracksIn3D(findLoop370, "red", "Loop370")
        );
      }
      let findST = findSTExercise(array);
      if (findST !== null) {
        loopTraces.push(createExercisesTracksIn3D(findST, "blue", "ST"));
      }

      // Plot all traces on the 3D graph
      Plotly.newPlot(
        "threeDGraph",
        [
          {
            type: "scatter3d",
            mode: "lines",
            x: x,
            y: y,
            z: z,
            opacity: 1,
            line: {
              width: 3,
              reversescale: false,
              color: colorOf3D,
            },

            name: "Graph",
          },
          {
            type: "scatter3d",
            mode: "markers",
            x: [null],
            y: [null],
            z: [null],
            opacity: 1,
            marker: {
              size: 10,
              reversescale: false,
              color: "pink",
            },
            name: "Marker",
          },
          ...loopTraces, // Spread the loop traces array to include all loop traces and 'WO' traces
        ],
        {
          height: 640,
        }
      );
      let isClickedYet = false;

      document .getElementById("threeDGraph") .on("plotly_click", async function (eventData) {
          if (isClickedYet) return;
          isClickedYet = true;

          let point = eventData.points[0];
          let clickedX = point.x;
          let clickedY = point.y;
          let clickedZ = point.z;
          
          for (let i = 0; i < data.length; i++) {
            if (data[i]["OwnPlatform.StateVector.PresentPos.Latitude"] ===clickedX && data[i]["OwnPlatform.StateVector.PresentPos.Longitude"] === clickedY && (data[i]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) === clickedZ ) {
              console.log("AltitudeSea" + data[i]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]);
              console.log("pitch" + pitchConvertedValues[i]);
              console.log("speed" + speedValues[i]);
              console.log("heading" + headingConvertedValues[i]);
              console.log('index' + i);
              console.log('timee' + data[i]["EntityMetadata.RecordingTime"]);
              handleChartClick2D(i, true);
              break;
            }
          }


          // Update only the clicked marker's position
          await Plotly.restyle(
            "threeDGraph",
            {
              "x[1]": [clickedX],
              "y[1]": [clickedY],
              "z[1]": [clickedZ],
            },
            [1]
          );

          isClickedYet = false;
        });
    });
  });
  //end of reading files
});

function findSTExercise(items, TimeOfStart = 0) {

  let startST, endST, timeLength = 0, foundStartOfST = false, startHeading , exerciseTimeLength = 0;

  for (let j = 1; j < items.length - 1; j++) {
    if (parseFloat(items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= 18590 &&
      parseFloat(items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= 22700 &&  
      speedValues[j] >= 100 && speedValues[j] <= 155 && TimeOfStart <= parseFloat(items[j]["EntityMetadata.RecordingTime"])) {
      console.log("enter max " + j + ' heading ' + headingConvertedValues[j]);
      exerciseTimeLength = 0;
      for (let h = j; h > 1; h--) {
        exerciseTimeLength +=  (items[h]["EntityMetadata.RecordingTime"] - items[h - 1]["EntityMetadata.RecordingTime"]) / 1000;
        // console.log("pich in time : " + timeLength +' pich ' + pitchConvertedValues[h] + ' exLength ' + exerciseTimeLength);
        if ( Math.abs(pitchConvertedValues[h]) <= 105 && Math.abs(pitchConvertedValues[h]) >= 70 && Math.abs(exerciseTimeLength) < 10) {
          timeLength += (items[h]["EntityMetadata.RecordingTime"] - items[h - 9]["EntityMetadata.RecordingTime"]) / 1000;
          if (timeLength >= 3) {
            console.log("pich in the time");
            for (let l = h; l > 1; l--) {
              exerciseTimeLength +=  (items[l]["EntityMetadata.RecordingTime"] - items[l - 1]["EntityMetadata.RecordingTime"]) / 1000;
              if ( parseFloat( items[l]["OwnPlatform.StateVector.PresentPos.AltitudeSea"] ) <= 13905 &&
                parseFloat( items[l]["OwnPlatform.StateVector.PresentPos.AltitudeSea"] ) >= 11900 &&
                speedValues[l] <= 370 && speedValues[l] >= 340 && TimeOfStart <= parseFloat(items[l]["EntityMetadata.RecordingTime"]) && ((Math.abs((360 - headingConvertedValues[l]) + headingConvertedValues[j]) >= 40 && Math.abs((360 - headingConvertedValues[l]) + headingConvertedValues[j]) <= 140) ||
                (Math.abs(headingConvertedValues[j] - headingConvertedValues[l]) >= 40 && Math.abs(headingConvertedValues[j] - headingConvertedValues[l]) <= 140)) && Math.abs(exerciseTimeLength) < 10) {
                    while(parseFloat( items[l]["OwnPlatform.StateVector.PresentPos.AltitudeSea"] ) <= 13905 &&
                    parseFloat( items[l]["OwnPlatform.StateVector.PresentPos.AltitudeSea"] ) >= 11900 &&
                    speedValues[l] <= 370 && speedValues[l] >= 340 && TimeOfStart <= parseFloat(items[l]["EntityMetadata.RecordingTime"]) && ((Math.abs((360 - headingConvertedValues[l]) + headingConvertedValues[j]) >= 40 && Math.abs((360 - headingConvertedValues[l]) + headingConvertedValues[j]) <= 140) ||
                    (Math.abs(headingConvertedValues[j] - headingConvertedValues[l]) >= 40 && Math.abs(headingConvertedValues[j] - headingConvertedValues[l]) <= 140)) && Math.abs(exerciseTimeLength) < 10 &&  Math.abs(pitchConvertedValues[l]) <= Math.abs(pitchConvertedValues[l + 1])) {
                      console.log ('find heding of stat' + headingConvertedValues[l] + ' TIMElENGTH ' + exerciseTimeLength);
                      startHeading = headingConvertedValues[l];
                      startST = l;
                      foundStartOfST = true;
                      exerciseTimeLength +=  (items[l]["EntityMetadata.RecordingTime"] - items[l - 1]["EntityMetadata.RecordingTime"]) / 1000;
                      l++;
                    }
                    h = 0;
                    l = 1;
                    exerciseTimeLength = 0;
                    timeLength = 0;
                    break; 
              } else if(Math.abs(exerciseTimeLength) > 10) {
                h = 1;
                break;
              }
            }
          }
        } else if(Math.abs(exerciseTimeLength) > 10) {
          break;
        } else if(Math.abs(pitchConvertedValues[h]) >= 105 || Math.abs(pitchConvertedValues[h]) <= 75){
          timeLength = 0;
        }
      }
      if (foundStartOfST) {
        for (let t = j; t < items.length - 1; t++) {
          exerciseTimeLength +=  (items[t]["EntityMetadata.RecordingTime"] - items[t - 1]["EntityMetadata.RecordingTime"]) / 1000;
          console.log("pich in time 2 : " + timeLength +' pich ' + pitchConvertedValues[t] + ' exLength ' + exerciseTimeLength);
          if ( Math.abs(pitchConvertedValues[t]) <= 105 && Math.abs(pitchConvertedValues[t]) >= 70  && Math.abs(exerciseTimeLength) < 10) {
            timeLength += (items[t]["EntityMetadata.RecordingTime"] - items[t - 9]["EntityMetadata.RecordingTime"]) /1000;
            if (timeLength >= 3) {
              console.log('fing timeLength ' + t);
              for (let m = t; m < items.length - 1; m++) {
                exerciseTimeLength +=  (items[m]["EntityMetadata.RecordingTime"] - items[m - 1]["EntityMetadata.RecordingTime"]) / 1000;
                if (parseFloat(items[m]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= 15000 &&
                  parseFloat(items[m]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= 11700 &&
                  ((360 - startHeading + headingConvertedValues[m] >= 90 && 360 - startHeading + headingConvertedValues[m] <= 270) ||
                  (headingConvertedValues[m] - startHeading >= 90 && headingConvertedValues[m] - startHeading <= 270))  && Math.abs(exerciseTimeLength) < 10) {
                    while(parseFloat(items[m]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= 15000 &&
                    parseFloat(items[m]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= 11700 &&
                    ((360 - startHeading + headingConvertedValues[m] >= 90 && 360 - startHeading + headingConvertedValues[m] <= 270) ||
                    (headingConvertedValues[m] - startHeading >= 90 && headingConvertedValues[m] - startHeading <= 270))  && Math.abs(exerciseTimeLength) < 10  && Math.abs(pitchConvertedValues[m]) >= Math.abs(pitchConvertedValues[m + 1])) {
                        console.log('end ' + m + ' timeLength ' + exerciseTimeLength);
                        endST = m;
                        exerciseTimeLength +=  (items[m]["EntityMetadata.RecordingTime"] - items[m - 1]["EntityMetadata.RecordingTime"]) / 1000;
                        m++;
                    }
                    let ST = [];
                    for (let a = startST; a <= endST; a++) {
                      ST.push(items[a]);
                    }
                    return ST;
                  } else if(Math.abs(exerciseTimeLength) > 10) {
                    t = items.length;
                    break;
                  }
              }
            }
          } else if(Math.abs(exerciseTimeLength) > 10) {
            break;
          } else if( Math.abs(pitchConvertedValues[t]) >= 105 || Math.abs(pitchConvertedValues[t]) <= 75){
            timeLength = 0;
          }
        }
      }
    }
  }
  return null;
}

function findLoop370Exercise(items, TimeOfStart = 0) {
  let startLoop370, endLoop370;

  for (let j = 1; j < items.length - 1; j++) {
    if (
      parseFloat(items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <=
      21200 &&
      parseFloat(items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >=
      20800 &&
      speedValues[j] >= 115 &&
      speedValues[j] <= 145
    ) {
      for (let h = j; h > 1; h--) {
        if (
          parseFloat(
            items[h]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
          ) >= 12800 &&
          parseFloat(
            items[h]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
          ) <= 13200 &&
          speedValues[h] <= 385 &&
          speedValues[h] >= 355 &&
          TimeOfStart <= parseFloat(items[h]["EntityMetadata.RecordingTime"])
        ) {
          if (
            (360 - headingConvertedValues[h] + headingConvertedValues[j] >=
              160 &&
              360 - headingConvertedValues[h] + headingConvertedValues[j] <=
              200) ||
            (headingConvertedValues[j] - headingConvertedValues[h] >= 160 &&
              headingConvertedValues[j] - headingConvertedValues[h] <= 200)
          ) {
            startLoop370 = h;
            break;
          }
        }
      }
      for (let t = j; t < items.length - 1; t++) {
        if (
          parseFloat(
            items[t]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
          ) >= 12800 &&
          parseFloat(
            items[t]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
          ) <= 13200
        ) {
          endLoop370 = t;
          break;
        }
        if (
          parseFloat(
            items[t]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
          ) <= 13200 &&
          speedValues[t] > 355
        ) {
          for (let h = t; h > 1; h--) {
            if (
              parseFloat(
                items[h]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
              ) >= 12800 &&
              parseFloat(
                items[h]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
              ) <= 13200 &&
              speedValues[h] >= 385 &&
              speedValues[h] <= 355
            ) {
              startLoop370 = h;
              break;
            }
          }
        }
      }
      if (startLoop370 !== undefined && endLoop370 !== undefined) {
        let result = [];
        for (let a = startLoop370; a <= endLoop370; a++) {
          result.push(items[a]);
        }
        return result;
      } else {
        return null;
      }
    }
  }
  return null;
}

function findWingOverExerecise(items, startHight = 13000, TimeOfStart = 0) {
  let timeDifference = 0,
    startTime;
  let startWO, endWO;

  for (let i = 1; i < items.length - 1; i++) {
    if (
      parseFloat(items[i]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >=
        startHight - 200 &&
      parseFloat(items[i]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <=
        startHight + 200 &&
      speedValues[i] >= 235 &&
      speedValues[i] <= 265 &&
      Math.abs(rollConvertedValues[i]) <= 10 &&
      TimeOfStart <= parseFloat(items[i]["EntityMetadata.RecordingTime"])
    ) {
      startWO = i;
      startTime = parseFloat(items[i]["EntityMetadata.RecordingTime"]);
      for (let j = i; j < items.length - 1; j++) {
        timeDifference = timeDifference + (items[j]["EntityMetadata.RecordingTime"] - items[j - 1]["EntityMetadata.RecordingTime"]) / 1000;
        if (timeDifference > 30) {
          j = items.length;
        }

        if (timeDifference <= 30 && pitchConvertedValues[j] >= 30 && pitchConvertedValues[j] <= 70) {

          if (pitchConvertedValues[j + 1] < pitchConvertedValues[j]) {
            timeDifference = 0;
            for (let t = j; t > 1; t--) {
              if (pitchConvertedValues[t] < 6) {
                startWO = t;
                startTime = parseFloat(items[t]["EntityMetadata.RecordingTime"]);
                break;
              }
            }
            for (let h = j + 1; h < items.length - 1; h++) {
              timeDifference = timeDifference + (items[h]["EntityMetadata.RecordingTime"] - items[h - 1]["EntityMetadata.RecordingTime"]) / 1000;
              if (timeDifference > 15) {
                j = items.length;
                break;
              }
              if (Math.abs(rollConvertedValues[h]) >= 80 && timeDifference <= 15) {
                for (let l = h + 1; l < items.length - 1; l++) {
                  if (Math.abs(rollConvertedValues[l]) <= 10 && Math.abs(pitchConvertedValues[l]) <= 10 && (parseFloat(items[l]["EntityMetadata.RecordingTime"]) -
                    startTime) / 1000 <= 50 && speedValues[l] >= 350 && speedValues[l] <= 390) {
                    endWO = l;
                    if (startWO !== undefined && endWO !== undefined) {
                      let result = [];
                      for (let a = startWO; a <= endWO; a++) {
                        result.push(items[a]);
                      }
                      return result;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return null;
}

function findLoop320Exercise(items, TimeOfStart = 0) {
  let startLoop320Index, endLoop320Index;

  for (let i = 1; i < items.length; i++) {
    if (
      parseFloat(items[i]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >=
      12800 &&
      parseFloat(items[i]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <=
      13200 &&
      speedValues[i] >= 305 &&
      speedValues[i] <= 335 &&
      TimeOfStart <= parseFloat(items[i]["EntityMetadata.RecordingTime"])
    ) {
      startLoop320Index = i;
      for (let j = startLoop320Index; j < items.length; j++) {
        let headingDifference1option =
          headingConvertedValues[j] - headingConvertedValues[startLoop320Index];
        let headingDifference2option =
          360 -
          headingConvertedValues[startLoop320Index] +
          headingConvertedValues[j];
        if (
          parseFloat(
            items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
          ) >= 18300 &&
          parseFloat(
            items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
          ) <= 18800 &&
          speedValues[j] >= 115 &&
          speedValues[j] <= 145 &&
          ((headingDifference1option >= 160 &&
            headingDifference1option <= 200) ||
            (headingDifference2option >= 160 &&
              headingDifference2option >= 200))
        ) {
          for (let k = j; k < items.length; k++) {
            if (
              parseFloat(
                items[k]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
              ) >= 12800 &&
              parseFloat(
                items[k]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
              ) <= 13200
            ) {
              endLoop320Index = k;
              let loops320 = [];
              for (let a = startLoop320Index; a <= endLoop320Index; a++) {
                loops320.push(items[a]);
              }
              return loops320;
            }
          }
        }
      }
    }
  }
  if (
    firstPoint320 !== undefined &&
    secondPoint320 !== undefined &&
    thirdPoint320 !== undefined
  ) {
    for (let a = firstPoint320; a <= thirdPoint320; a++) {
      loops320.push(items[a]);
    }
    return loops320;
  } else {
    return null;
  }
}

function findBarellRollExercise(items, TimeOfStart = 0) {
  let seconds = 0;
  let indexOfStartBR = 0;
  let indexOfEndBR = 0;

  for (let i = 0; i < items.length; i++) {
    if (parseFloat(items[i]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= 12800 &&
      parseFloat(items[i]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= 13200 &&
      speedValues[i] >= 275 && speedValues[i] <= 315 && Math.abs(rollConvertedValues[i]) <= 10 &&
      TimeOfStart <= parseFloat(items[i]["EntityMetadata.RecordingTime"])) {
      indexOfStartBR = i;
      seconds = parseFloat(items[i]["EntityMetadata.RecordingTime"]);
      for (let j = i; j < items.length; j++) {
        let headingDifferenceOption1 = headingConvertedValues[j] - headingConvertedValues[indexOfStartBR];
        let headingDifferenceOption2 = 360 - indexOfStartBR[indexOfStartBR] + headingConvertedValues[j];
        if (parseFloat(items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= 18300 &&
          parseFloat(items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= 18700 &&
          speedValues[j] >= 115 && speedValues[j] <= 145 && Math.abs(rollConvertedValues[j]) <= 10 &&
          (headingDifferenceOption1 === 90 || headingDifferenceOption2 === 90) && parseFloat(items[j]["EntityMetadata.RecordingTime"]) - seconds >= 6 && parseFloat(items[j]["EntityMetadata.RecordingTime"]) - seconds <= 30) {
          for (let k = j; k < items.length; k++) {
            if (parseFloat(items[k]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= 12800 &&
              parseFloat(items[k]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= 13200 &&
              speedValues[k] >= 275 && speedValues[k] <= 315) {
              indexOfEndBR = k;
              let arrayOfBR = [];
              for (let a = indexOfStartBR; a <= indexOfEndBR; a++) {
                arrayOfBR.push(items[a]);
              }
              return arrayOfBR;
            }
          }
        }
      }
    }
  }
}

function creating2Dgraphs(graphName, relevantData) {
  const graphData = {
    datasets: [
      {
        pointRadius: radius,
        backgroundColor: "rgba(0, 0, 0, 0)",
        showLine: true,
        mode: "line",
        borderWidth: 1,
        borderColor: colorsOf2D,
        data: data.map((item, index) => ({ x: index, y: item[relevantData] })),
      },
    ],
  };

  return new Chart(graphName, {
    type: "scatter",
    data: graphData,
    options: {
      legend: { display: false },
      scales: {
        type: "linear",
        position: "bottom",
        ticks: {
          stepSize: 1,
        },
      },
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: "x",
          },
          zoom: {
            enabled: true,
            mode: "x",
          },
        },
      },
      onClick: function (evt) {
        let element = this.getElementsAtEvent(evt);
        handleChartClick2D(element[0]._index, false);
      },
    },
  });
}

function createExercisesTracksIn3D(exerciseData, exerciseColor, exerciseName) {
  if (exerciseData !== null && exerciseData !== undefined) {
    let exerciseX = [];
    let exerciseY = [];
    let exerciseZ = [];

    exerciseData.forEach((item) => {
      exerciseX.push(parseFloat(item["OwnPlatform.StateVector.PresentPos.Latitude"]));
      exerciseY.push(parseFloat(item["OwnPlatform.StateVector.PresentPos.Longitude"]));
      exerciseZ.push(parseFloat(item["OwnPlatform.StateVector.PresentPos.AltitudeSea"]));
    });


    let exerciseTrace = {
      type: "scatter3d",
      mode: "lines",
      x: exerciseX,
      y: exerciseY,
      z: exerciseZ,
      opacity: 1,
      line: {
        width: 3,
        reversescale: false,
        color: exerciseColor,
      },
      name: exerciseName,
    };
    return exerciseTrace;
  }
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function findExercise() {
  let currentPitchMax, previousPitchMax, nextPitchMax;
  let currentPitchMin, previousPitchMin, nextPitchMin;
  let maxPitch, minPitch;

  for (let i = 1; i < data.length - 1; i++) {
    currentPitchMax = Number( data[i]["OwnPlatform.StateVector.PresentPos.Pitch"] );
    previousPitchMax = Number( data[i - 1]["OwnPlatform.StateVector.PresentPos.Pitch"] );
    nextPitchMax = Number( data[i + 1]["OwnPlatform.StateVector.PresentPos.Pitch"] );
    // changing the range from 1.5 to 1.4

    if ( currentPitchMax >= previousPitchMax && currentPitchMax >= nextPitchMax && currentPitchMax >= 1.4 ) {
      for (let j = i + 1; j < data.length - 1; j++) {
        currentPitchMin = Number( data[j]["OwnPlatform.StateVector.PresentPos.Pitch"] );
        previousPitchMin = Number( data[j - 1]["OwnPlatform.StateVector.PresentPos.Pitch"] );
        nextPitchMin = Number( data[j + 1]["OwnPlatform.StateVector.PresentPos.Pitch"] );

        // changing the range from 1.5 to 1.4
        if ( currentPitchMin <= previousPitchMin && currentPitchMin <= nextPitchMin && currentPitchMin <= -1.4 ) {
          for (let t = j; t < data.length - 1; t++) {
            if (data[t]["OwnPlatform.StateVector.PresentPos.Pitch"] >= -0.02) {
              minPitch = t;
              break;
            }
          }

          for (let t = i; t > 1; t--) {
            if (data[t]["OwnPlatform.StateVector.PresentPos.Pitch"] <= 0.02) {
              maxPitch = t;
              break;
            }
          }

          const segmentColor = getRandomColor();
          for (let k = maxPitch; k <= minPitch; k++) {
            colorsOf2D[k] = segmentColor;
          }

          PitchChart.update();
          j = data.length;
        } else if (
          currentPitchMin >= previousPitchMin &&
          currentPitchMin >= nextPitchMin
        ) {
          j = data.length;
        }
      }
    }
  }
}

function handleChartClick2D(clickedIndex , sendFrom3D) {

  // Reset color of previously clicked points
  for (let i = 0; i < colorsOf2D.length - 1; i++) {
    if (colorsOf2D[i] === "red") {
      colorsOf2D[i] = prvPointColor;
      radius[i] = 1;
    }
  }

  // Highlight the clicked point in red
  prvPointColor = colorsOf2D[clickedIndex];
  // Update pointColor for the clicked point in all charts
  colorsOf2D[clickedIndex] = "red";
  // Update pointRadius for the clicked point in all charts
  radius[clickedIndex] = 5;

  // Update all charts
  PitchChart.update();
  RollChart.update();
  HeadingChart.update();
  SeaAndGroundChart.update();
  EastAndNorthChart.update();
  SpeedChart.update();


  if (!sendFrom3D) {
    let clickedX = data[clickedIndex]["OwnPlatform.StateVector.PresentPos.Latitude"];
    let clickedY = data[clickedIndex]["OwnPlatform.StateVector.PresentPos.Longitude"];
    let clickedZ = data[clickedIndex]["OwnPlatform.StateVector.PresentPos.AltitudeSea"];
  
    // Update only the clicked marker's position
    Plotly.restyle(
      "threeDGraph",
      {
        "x[1]": [clickedX],
        "y[1]": [clickedY],
        "z[1]": [clickedZ],
      },
      [1]
    );
  }
}

function PlaneOnChart(chart, indexOfClickedPoint) {
  const meta = chart.getDatasetMeta(0);
  const ctx = chart.ctx;
  if (indexOfPlane[0] !== undefined) {
    meta.data[indexOfPlane[0]]._model.pointStyle = "circle";
    indexOfPlane.pop();
  }
  indexOfPlane.push(indexOfClickedPoint);
  imageOfPlane = new Image(20, 20);
  imageOfPlane.src = "pics/planePicWhite.png";
  let angle = -headingConvertedValues[indexOfClickedPoint];
  const model = meta.data[indexOfClickedPoint]._model;
  ctx.save();
  ctx.translate(model.x, model.y);
  ctx.rotate((angle * Math.PI) / 180); // Rotate the canvas
  ctx.drawImage(imageOfPlane, -30 / 2, -30 / 2, 30, 30); // Draw the image
  ctx.restore();
  chart.update();
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file);
  });
}

function checkHeader(header) {
  for (let i = 0; i < arrOfHeaders.length; i++) {
    if (header.includes(arrOfHeaders[i])) return true;
  }
  return false;
}
function checkData(index, title) {
  return (
    data[index][title] !== undefined &&
    data[index][title] !== null &&
    data[index][title] !== "" &&
    data[index][title] !== NaN &&
    data[index][title] !== " "
  );
}

//increaseResolution
function add10Rows(header) {
  let arr = [];
  let index;
  let currVal;
  let nextVal;
  let isFoundVal = false;
  let newVal;

  for (let j = 0; j < data.length; j++) {
    if (data[j][header] !== undefined && data[j][header] !== null && data[j]["EntityMetadata.EntityType"] === "Own") {
      currVal = data[j][header];
      for (let k = j + 1; k < data.length; k++) {
        if (data[k][header] !== undefined && data[k][header] !== null && data[k]["EntityMetadata.EntityType"] === "Own") {
          nextVal = data[k][header];
          index = 0;
          arr.push(currVal);
          while (index < 8) {
            index++;
            newVal = currVal + ((nextVal - currVal) / 9) * index;
            arr.push(newVal);
          }
          j = k - 1;
          break;
        }
      }
    }
  }

  let dataIndex = 0;
  for (let i = 0; i < arr.length; i++) {
    if (data[dataIndex + 1] === undefined || data[dataIndex + 1] === null) {
      data.push({ [header]: arr[i] });
    } else {
      data[dataIndex + 1][header] = arr[i];
    }
    dataIndex++;
  }
}

function addMissingValues(header) {
  let counter = 0;
  let ifFoundRBS = false ;


  if (header === "OwnPlatform.StateVector.PresentPos.Latitude") {
    for (let i = 0; i < data.length; i++) {
      if (data[i][header] !== undefined) {
        counter++
        if(counter === 30) {
          startIndexOfLatitude = i - 29;
          for (let m = startIndexOfLatitude - 1; m > 0; m--) {
            data[m][header] = undefined;
          }
          for (let j = i; j < data.length; j++) {
            if (data[j][header] == undefined) {
              counter++;
              if (counter === 40) {
                endIndexOfLatitude = j - 40;
                lastIndex =  endIndexOfLatitude;
                for (let k = endIndexOfLatitude + 1; k < data.length; k++) {
                  data[k][header] = undefined;
                }
                break;
              }
              // if(data[j]["EntityMetadata.EntityType"] !== "Own" && ifFoundRBS === false) {
              //   ifFoundRBS = true;
              // }
            } else {
              counter = 0;
            }
          }
          break;
        }
      } else {
        counter = 0;
      }
    }
  } else {
    for (let m = startIndexOfLatitude - 1; m > 0; m--) {
      data[m][header] = undefined;
    }
    for (let k = endIndexOfLatitude + 1; k < data.length; k++) {
      data[k][header] = undefined;
    }
  }
 
  if (startIndexOfLatitude !== undefined && endIndexOfLatitude !== undefined) {
    for (let i = startIndexOfLatitude; i < endIndexOfLatitude; i++) {
      if (data[i][header] === undefined && data[i]["EntityMetadata.EntityType"] == "Own") {
        let firstValue = data[i - 1][header];
        let counterEmptyValue = 0;
        let lastValue;
        for (let j = i; j < endIndexOfLatitude; j++) {
          if (data[j][header] == undefined && data[j]["EntityMetadata.EntityType"] == "Own") {
            counterEmptyValue++;
          } else {
            lastValue = data[j][header];
            break;
          }
        }

        let numberOfEmptySpot = 0;
        while (numberOfEmptySpot < counterEmptyValue) {
          numberOfEmptySpot++;
          let newValue = firstValue + ((lastValue - firstValue) / (counterEmptyValue + 1)) * numberOfEmptySpot;
          data[i - 1 + numberOfEmptySpot][header] = newValue;
        }
      } 
    }
  }
}  

function createLocation() {
  let firstIndexToUse;
  for (let j = startIndexOfLatitude; j < data.length; j++) {
    if ( data[j]["OwnPlatform.StateVector.PresentPos.Latitude"] !== undefined &&
      data[j]["OwnPlatform.StateVector.PresentPos.Longitude"] !== undefined &&
      data[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"] !== undefined ) {
      northValues.push( parseFloat(data[j]["OwnPlatform.StateVector.PresentPos.Longitude"]) );
      eastValues.push( parseFloat(data[j]["OwnPlatform.StateVector.PresentPos.Latitude"]) );
      downValues.push( parseFloat( data[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"] ));
      firstIndexToUse = j + 1;
      break;
    }
  }

  for (let i = firstIndexToUse; i < data.length; i++) {
    if (data[i]["OwnPlatform.StateVector.Velocity.East"] !== undefined &&
      data[i]["OwnPlatform.StateVector.Velocity.North"] !== undefined &&
      data[i]["OwnPlatform.StateVector.Velocity.Down"] !== undefined ) {
      let timeDifferenceRecording = parseFloat( data[i]["EntityMetadata.RecordingTime"] - data[i - 1]["EntityMetadata.RecordingTime"]);
      if (timeDifferenceRecording < 0) {  
        timeDifferenceRecording = (data[i - 1]["EntityMetadata.RecordingTime"] - data[i - 2]["EntityMetadata.RecordingTime"] +(data[i + 1]["EntityMetadata.RecordingTime"] - data[i]["EntityMetadata.RecordingTime"])) / 2;
      }
      let newNorthValue = northValues[i - firstIndexToUse] + (data[i - 1]["OwnPlatform.StateVector.Velocity.North"] * timeDifferenceRecording) /3.2808;
      northValues.push(newNorthValue);

      let newEastValue = eastValues[i - firstIndexToUse] + (data[i - 1]["OwnPlatform.StateVector.Velocity.East"] * timeDifferenceRecording) /3.2808;
      eastValues.push(newEastValue);

      let newDownValue = downValues[i - firstIndexToUse] + (data[i - 1]["OwnPlatform.StateVector.Velocity.Down"] * timeDifferenceRecording) / 3.2808;
      downValues.push(newDownValue);
    }
  }

  // for (let i = 0; i < northValues.length; i++) {
  //   data[i]["North"] = northValues[i];
  //   data[i]["East"] = eastValues[i];
  //   data[i]["Down"] = downValues[i];
  // }
}

function downloadCSV() {

const headers2 = Object.keys(data[0]);
const slicedData = data.slice(740, 19674);

const csvContent = [ headers2.join(","), 
...slicedData.map((obj) => headers2.map((header) => obj[header]).join(",")), ].join("\n");

const blob = new Blob([csvContent], { type: "text/csv" });

const downloadLink = document.createElement("a");
downloadLink.href = URL.createObjectURL(blob);
downloadLink.download = "data.csv";
downloadLink.textContent = "Download CSV";

// Append the download link to the body
document.body.appendChild(downloadLink);
}

function convertData() {
  for (let i = 1; i < data.length; i++) {
    if (checkData(i, "OwnPlatform.StateVector.Velocity.CAS")) {
      let convertedSpeed = (parseFloat(data[i]["OwnPlatform.StateVector.Velocity.CAS"]) * 3600) / 6076.1;
      speedValues.push(convertedSpeed);
    }
    if (checkData(i, "OwnPlatform.StateVector.PresentPos.Pitch")) {
      let convertedPitchDeg = (data[i]["OwnPlatform.StateVector.PresentPos.Pitch"] * 180) / Math.PI;
      pitchConvertedValues.push(convertedPitchDeg);
    }
    if (checkData(i, "OwnPlatform.StateVector.PresentPos.Roll")) {
      let convertedRollDeg = (data[i]["OwnPlatform.StateVector.PresentPos.Roll"] * 180) / Math.PI;
      rollConvertedValues.push(convertedRollDeg);
    }
    if (checkData(i, "OwnPlatform.StateVector.PresentPos.Heading")) {
      let convertedHeadingDeg = (data[i]["OwnPlatform.StateVector.PresentPos.Heading"] * 180) / Math.PI;
      headingConvertedValues.push(convertedHeadingDeg);
    }
  }
}