let data;

let speedValues = [];
let pitchConvertedValues = [];
let rollConvertedValues = [];
let headingConvertedValues = [];
let convertedPitch = [];
let northValues = [];
let eastValues = [];
let downValues = [];


const arrOfHeaders = [
  "Pitch",
  "Roll",
  "AltitudeSea",
  "Heading",
  "AltitudeGround",
  "CAS",
  "RecordingTime",
  "Latitude",
  "Longitude",
  "East",
  "North",
  "Down",
  "EntityType",
];

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
    nameOfStudent = "מאיה פפאיה";
  } else if (x === 2) {
    nameOfStudent = "רוני פפרוני";
  } else if (x === 4) {
    nameOfStudent = "גיל תרגיל";
  } else if (x === 5) {
    nameOfStudent = "אלון בלון";
  } else if (x === 6) {
    nameOfStudent = "עדי עבאדי";
  } else {
    nameOfStudent = "טל פורטל";
  }
  document.getElementById("studentName").innerText = `שם החניך:`;
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
    }); //end of data conversion

    const dataHeaders = ["OwnPlatform.StateVector.PresentPos.Latitude", "OwnPlatform.StateVector.PresentPos.Longitude", "OwnPlatform.StateVector.PresentPos.AltitudeSea" ,"OwnPlatform.StateVector.PresentPos.AltitudeGround" ,"OwnPlatform.StateVector.PresentPos.Pitch", "OwnPlatform.StateVector.PresentPos.Roll", "OwnPlatform.StateVector.PresentPos.Heading", "OwnPlatform.StateVector.Velocity.CAS", "OwnPlatform.StateVector.Velocity.North" ,"OwnPlatform.StateVector.Velocity.East", "OwnPlatform.StateVector.Velocity.Down", "EntityMetadata.RecordingTime"];
    for (let i = 0; i < dataHeaders.length; i++) {
      addMissingValues(dataHeaders[i]);
      add10Rows(dataHeaders[i]);
    }
    
    // convertData2()
    createLocation();
    convertData();
    downloadCSV();

    colorsOf2D = Array(data.length).fill("#808080"); // Default color is gray
    colorOf3D = Array(data.length).fill("#808080"); // Default color is gray
    radius = Array(data.length).fill(1);
    getPointStyle.length = data.length;
    getPointStyle.fill("triangle");

    PitchChart = creating2Dgraphs(
      "PitchChart",
      "OwnPlatform.StateVector.PresentPos.Pitch"
    );
    findExercise();
    RollChart = creating2Dgraphs(
      "RollChart",
      "OwnPlatform.StateVector.PresentPos.Roll"
    );
    HeadingChart = creating2Dgraphs(
      "HeadingChart",
      "OwnPlatform.StateVector.PresentPos.Heading"
    );
    SpeedChart = creating2Dgraphs(
      "SpeedChart",
      "OwnPlatform.StateVector.Velocity.CAS"
    );

    const chartDataSeaAndGround = {
      datasets: [
        {
          pointRadius: radius,
          showLine: true,
          mode: "line",
          borderWidth: 1,
          borderColor: colorsOf2D,
          data: data.slice(startIndexOfLatitude).map((item, index) => ({
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
          data: data.slice(startIndexOfLatitude).map((item, index) => ({
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
          let elementIndex =
            SeaAndGroundChart.getElementsAtEvent(evt)[0]._index;
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
          data: data.map((item) => ({
            x: item["East"],
            y: item["North"],
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
      array = data;
      let x = array.map((item) => parseFloat(item["East"]));
      let y = array.map((item) => parseFloat(item["North"]));
      let z = array.map((item) => parseFloat(item["Down"]));

      // let x = array.slice(13000, 15000).map((item) => parseFloat(item["East"]));
      // let y = array.slice(13000, 15000).map((item) => parseFloat(item["North"]));
      // let z = array.slice(13000, 15000).map((item) => parseFloat(item["Down"]));

      // Create an array to store traces for each loop
      let loopTraces = [];
      let endIndexOfFirstLoop;


      let findLoop370 = findLoop370Exercise(array, 0);
      while ((findLoop370[0] !== undefined) && loopCount < 2) {                
        if (loopCount === 1) {
          endIndexOfFirstLoop = findLoop370[1];
        }
        loopTraces.push(createExercisesTracksIn3D(findLoop370[0], "red", "Loop370"));
        findLoop370 = findLoop370Exercise(array, findLoop370[1]);
      }
      if (loopCount === 2) {
        loopTraces.push(createExercisesTracksIn3D(findLoop370[0], "red", "Loop370"));
        startLoop320Function(findLoop370[1]);
      } else if (findLoop370[0] === undefined && loopCount === 1) {
        startLoop320Function(endIndexOfFirstLoop);
      } else if (findLoop370[0] === undefined && loopCount === 0) {
        startLoop320Function(0);
      } 

      function startLoop320Function (indexOfStart320) {
        let findLoop320 = findLoop320Exercise(array, indexOfStart320);
        if (findLoop320[0] !== undefined) {
          loopTraces.push(createExercisesTracksIn3D(findLoop320[0], "green", "Loop320"));
        }
      }


      // let findWO = findWingOverExerecise(array);
      // if (findWO !== null) {
      //   loopTraces.push(createExercisesTracksIn3D(findWO, "orange", "WO"));
      // }

      // let findBR = findBarellRollExercise(data, 0);
      // while (findBR[1] !== -1) {
      //   if (findBR[0] !== undefined)
      //     loopTraces.push(createExercisesTracksIn3D(findBR[0], "pink", "BR"));


      let findST = findSTExercise(array, 0); 
      while (findST !== null) {
        loopTraces.push(createExercisesTracksIn3D(findST[0], "blue", "ST"));
        findST = findSTExercise(array, findST[1]);
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

      document
        .getElementById("threeDGraph")
        .on("plotly_click", async function (eventData) {
          if (isClickedYet) return;
          isClickedYet = true;

          let point = eventData.points[0];
          let clickedX = point.x;
          let clickedY = point.y;
          let clickedZ = point.z;

          for (let i = 0; i < data.length; i++) {
            if (data[i]["East"] === clickedX && data[i]["North"] === clickedY && data[i]["Down"] === clickedZ) {
              console.log(i);
              console.log("hight", data[i+startIndexOfLatitude]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]);
              console.log("speed", speedValues[i+startIndexOfLatitude]);
              // console.log("x:", data[i]["East"], "y:", data[i]["North"], "z:", data[i]["Down"]);
              // console.log('pich ' + pitchConvertedValues[i + startIndexOfLatitude]);
              // console.log("RecordingTime " + data[i + startIndexOfLatitude]["EntityMetadata.RecordingTime"]);
              console.log('heading:', headingConvertedValues[i + startIndexOfLatitude]);
              console.log('pitch:', pitchConvertedValues[i+startIndexOfLatitude]);
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

//standard deviation calculation
let differencePitch, numOfIndexesPitch = 0, numOfIndexesRoll = 0;
let pitchDifferenceSum = 0, speedDifferenceSum = 0, rollDifferenceSum = 0;
let maxRoll = 0;
        
function findParameters (startPitchFor, endPitchFor) {
  for(let e = startPitchFor+1+startIndexOfLatitude; e < endPitchFor+startIndexOfLatitude; e++){
      differencePitch = Math.abs(pitchConvertedValues[e] - pitchConvertedValues[e-1]);
      pitchDifferenceSum += differencePitch;
      
      speedDifferenceSum += speedValues[e];
      
      numOfIndexesPitch++;
  }
  let standardDeviation = (pitchDifferenceSum/numOfIndexesPitch);
  let averageSpeed = speedDifferenceSum/numOfIndexesPitch;

  for (let f = startPitchFor+startIndexOfLatitude; f < endPitchFor+startIndexOfLatitude; f++) {
  if (Math.abs(pitchConvertedValues[f]) > 60) {
    break;
  }
  rollDifferenceSum += rollConvertedValues[f];
  numOfIndexesRoll++;
  if (Math.abs(rollConvertedValues[f]) > maxRoll) {
    maxRoll = Math.abs(rollConvertedValues[f]);
  }
  }
  let averageRoll = (rollDifferenceSum/numOfIndexesRoll);

  let secondsOfSegment = (endPitchFor - startPitchFor)/10;
  console.log(secondsOfSegment);
  return [standardDeviation, averageSpeed, averageRoll, maxRoll];
}


function findSTExercise(items, indexOfStart ) {

  let startST, endST, timeLength = 0, foundStartOfST = false, startHeading , exerciseTimeLength = 0;

  for (let j = indexOfStart; j < items.length - 1; j++) {
    if (parseFloat(items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= 17270 &&
      parseFloat(items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= 22700 &&  
      speedValues[j] >= 100 && speedValues[j] <= 197 && indexOfStart <= j ) {
      if(pitchConvertedValues[j] > 0 ) {
        while(pitchConvertedValues[j] > 0) {
          exerciseTimeLength +=  (items[j]["EntityMetadata.RecordingTime"] - items[j - 1]["EntityMetadata.RecordingTime"]) / 1000;
          j++;
        }
      }

      // console.log ( j + ' max ex. heading- ' + headingConvertedValues[j] + ' hight- ' + items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"] + ' csv- ' + speedValues[j]);

      exerciseTimeLength = 0;
      for (let h = j; h > 1; h--) {
        exerciseTimeLength +=  (items[h]["EntityMetadata.RecordingTime"] - items[h - 1]["EntityMetadata.RecordingTime"]) / 1000;
        // console.log("pich in time 1: "  +' pich ' + pitchConvertedValues[h] + ' exLength ' + exerciseTimeLength);
        if ( Math.abs(pitchConvertedValues[h]) <= 105 && Math.abs(pitchConvertedValues[h]) >= 65 && Math.abs(exerciseTimeLength) < 10) {
          timeLength += (items[h]["EntityMetadata.RecordingTime"] - items[h - 9]["EntityMetadata.RecordingTime"]) / 1000;
          if (timeLength >= 3) {

            while(Math.abs(pitchConvertedValues[h]) <= 105 && Math.abs(pitchConvertedValues[h]) >= 65 && Math.abs(exerciseTimeLength) < 10) {
              timeLength += (items[h]["EntityMetadata.RecordingTime"] - items[h - 9]["EntityMetadata.RecordingTime"]) / 1000;
              h++;
            }
            // console.log('fing timeLength of pich' + timeLength);

            for (let l = h; l > 1; l--) {
              exerciseTimeLength +=  (items[l]["EntityMetadata.RecordingTime"] - items[l - 1]["EntityMetadata.RecordingTime"]) / 1000;
              if ( parseFloat( items[l]["OwnPlatform.StateVector.PresentPos.AltitudeSea"] ) <= 14155 &&
                parseFloat( items[l]["OwnPlatform.StateVector.PresentPos.AltitudeSea"] ) >= 11900 &&
                speedValues[l] <= 370 && speedValues[l] >= 330 && indexOfStart <= l && (((360 - headingConvertedValues[l]) + headingConvertedValues[j] >= 40 && (360 - headingConvertedValues[l]) + headingConvertedValues[j] <= 160) ||
                (headingConvertedValues[j] - headingConvertedValues[l] >= 40 && headingConvertedValues[j] - headingConvertedValues[l] <= 160) || ((360 - headingConvertedValues[j]) + headingConvertedValues[l] >= 40 && (360 - headingConvertedValues[j]) + headingConvertedValues[l] <= 160) ||
                (headingConvertedValues[l] - headingConvertedValues[j] >= 40 && headingConvertedValues[l] - headingConvertedValues[j] <= 160)) && Math.abs(exerciseTimeLength) < 10) {
                  if(pitchConvertedValues[l] > 2) {
                  while( pitchConvertedValues[l] > 2 && Math.abs(exerciseTimeLength) < 10 ) {
                      startHeading = headingConvertedValues[l];
                      startST = l - startIndexOfLatitude;
                      exerciseTimeLength +=  (items[l]["EntityMetadata.RecordingTime"] - items[l - 1]["EntityMetadata.RecordingTime"]) / 1000;
                      l--;
                      foundStartOfST = true;
                    }
                  } else {
                     startHeading = headingConvertedValues[l];
                      startST = l - startIndexOfLatitude;
                      foundStartOfST = true;
                  }
                      // startHeading = headingConvertedValues[l];
                      // startST = l - startIndexOfLatitude;
                      // foundStartOfST = true;
                    // console.log ( l + ' start ex. heading- ' + headingConvertedValues[l] + ' hight- ' + items[l]["OwnPlatform.StateVector.PresentPos.AltitudeSea"] + ' csv- ' + speedValues[l]);
                    h = 0;
                    l = 1;
                    exerciseTimeLength = 0;
                    timeLength = 0;

                    break; 
              } else if(Math.abs(exerciseTimeLength) > 10) {
                indexOfStart = j + 1;
                h = 1;
                break;
              }
            }
          }
        } else if(Math.abs(exerciseTimeLength) > 10) {
          timeLength = 0;  
          indexOfStart = j + 1;
          break;
        } else if(Math.abs(pitchConvertedValues[h]) >= 105 || Math.abs(pitchConvertedValues[h]) <= 65) {
          timeLength = 0;  
        }
      }
      if (foundStartOfST) {
        if(pitchConvertedValues[j] < 0) {
          while(pitchConvertedValues[j] < 0) {
            j--;
          }
        }
        for (let t = j; t < items.length - 1; t++) {
          exerciseTimeLength +=  (items[t]["EntityMetadata.RecordingTime"] - items[t - 1]["EntityMetadata.RecordingTime"]) / 1000;
          // console.log("pich in time 2: " + timeLength +' pich ' + pitchConvertedValues[t] + ' exLength ' + exerciseTimeLength);
          if ( Math.abs(pitchConvertedValues[t]) <= 105 && Math.abs(pitchConvertedValues[t]) >= 60  && Math.abs(exerciseTimeLength) < 10) {
            timeLength += (items[t]["EntityMetadata.RecordingTime"] - items[t - 9]["EntityMetadata.RecordingTime"]) /1000;
            // console.log("pich in time 2: " + timeLength +' pich ' + pitchConvertedValues[t] + ' exLength ' + exerciseTimeLength);
            if (timeLength >= 3) {
              while(Math.abs(pitchConvertedValues[t]) <= 105 && Math.abs(pitchConvertedValues[t]) >= 60  && Math.abs(exerciseTimeLength) < 10) {
                t++;
                timeLength += (items[t]["EntityMetadata.RecordingTime"] - items[t - 9]["EntityMetadata.RecordingTime"]) /1000;
              }
              // console.log('fing timeLength of pich' + timeLength);
              for (let m = t ; m < items.length - 1; m++) {
                exerciseTimeLength +=  (items[m]["EntityMetadata.RecordingTime"] - items[m - 1]["EntityMetadata.RecordingTime"]) / 1000;
              if (parseFloat(items[m]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= 15000 &&
                  parseFloat(items[m]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= 11700 &&
                  ((360 - startHeading + headingConvertedValues[m] >= 85 && 360 - startHeading + headingConvertedValues[m] <= 270) ||
                  (headingConvertedValues[m] - startHeading >= 85 && headingConvertedValues[m] - startHeading <= 270) || (360 - headingConvertedValues[m] + startHeading >= 85 && 360 - headingConvertedValues[m] + startHeading <= 270) ||
                  (startHeading - headingConvertedValues[m] >= 85 && startHeading - headingConvertedValues[m] <= 270))  && Math.abs(exerciseTimeLength) < 10) {
                    if(pitchConvertedValues[m] < 2) {
                    while(pitchConvertedValues[m] < 2  && Math.abs(exerciseTimeLength) < 10) {
                        endST = m - startIndexOfLatitude;
                        exerciseTimeLength +=  (items[m]["EntityMetadata.RecordingTime"] - items[m - 1]["EntityMetadata.RecordingTime"]) / 1000;
                        m++;
                    }
                    } else {
                      endST = m - startIndexOfLatitude;
                    }
                    // endST = m - startIndexOfLatitude;
                    console.log ( m + ' end ex. heading- ' + headingConvertedValues[m] + ' hight- ' + items[m]["OwnPlatform.StateVector.PresentPos.AltitudeSea"] + ' csv- ' + speedValues[m]);
                    // console.log("start " + startST + ' end ' + endST);
                    let ST = [];
                    for (let a = startST; a <= endST; a++) {
                      ST.push(items[a]);
                    }
                    return [ST , (endST + startIndexOfLatitude)];
                  } else if(Math.abs(exerciseTimeLength) > 10) {
                    t = items.length;
                    indexOfStart = m + 1;
                    // console.log("enter to break");
                    break;
                  }
              }
            }
          } else if(Math.abs(exerciseTimeLength) > 10) {
            timeLength = 0;
            indexOfStart =  j + 1;
            while(pitchConvertedValues[j] > 0)
            {
              j++;
              while(pitchConvertedValues[j] < 0) {
                j++; 
              }
            }
            break;
          } else if( Math.abs(pitchConvertedValues[t]) >= 105 || Math.abs(pitchConvertedValues[t]) <= 60) {
            timeLength = 0;
          }
        }
      }
    }
  }
  return null;
}

  
let loopCount = 0;
function findLoop370Exercise(items, indexOfStart) {
  let startLoop370, endLoop370, middlePoint370;
  let result = [];
  for (let j = indexOfStart; j < items.length - 1; j++) {
    if (parseFloat(items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= 23500 &&
      parseFloat(items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= 17400 && speedValues[j] >= 105 
      && speedValues[j] <= 200) {
        for (let h = j; h > indexOfStart; h--) {         
        if (parseFloat(items[h]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= 12000 &&
          parseFloat(items[h]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= 14900 && speedValues[h] <= 400 &&
          speedValues[h] >= 320 && pitchConvertedValues[h] >= 0 && pitchConvertedValues[h] < 8) {
            if ((360 - headingConvertedValues[h] + headingConvertedValues[j] >= 150 &&
              360 - headingConvertedValues[h] + headingConvertedValues[j] <= 270) ||
              (headingConvertedValues[j] - headingConvertedValues[h] >= 150 && headingConvertedValues[j] - headingConvertedValues[h] <= 270) ) {
                    startLoop370 = h-startIndexOfLatitude;
                for (let t = j; t < items.length - 1; t++) {
                  if (parseFloat(items[t]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= 9000 &&
                    parseFloat(items[t]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= 16600 
                    && pitchConvertedValues[t] >= -2 && pitchConvertedValues[t] < 5) {
                      for (let f = t; f < items.length; f++) {
                        if ((f-startIndexOfLatitude-startLoop370) < 400) {
                          if (pitchConvertedValues[f] > 12) {
                            break;
                          }
                          endLoop370 = f-startIndexOfLatitude;
                        } else {
                          endLoop370 = t-startIndexOfLatitude;
                        }
                      }
                    for(let r = startLoop370+startIndexOfLatitude; r < endLoop370+startIndexOfLatitude; r++) {
                      if ((parseFloat(items[r]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) > 
                      parseFloat(items[r+1]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]))
                      && parseFloat(items[r]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >
                      parseFloat(items[r-1]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) ) {
                        middlePoint370 = r-startIndexOfLatitude;
                        break;
                        // console.log(middlePoint370+startIndexOfLatitude);
                      }
                    }
                    break;
                  }
                }
              }  
              break;
          }   
        }
      if (startLoop370 !== undefined && endLoop370 !== undefined && middlePoint370 !== undefined && (endLoop370-startLoop370) <= 500) {
        for (let a = startLoop370; a <= endLoop370; a++) {
          result.push(items[a]);
        }
        j = h = t = items.length;
        loopCount++;
      
        console.log("first segment:"   , "speed:", speedValues[startLoop370+startIndexOfLatitude], Math.abs(370-speedValues[startLoop370+startIndexOfLatitude]),
        "hight:", items[startLoop370+startIndexOfLatitude]["OwnPlatform.StateVector.PresentPos.AltitudeSea"], Math.abs(13000-items[startLoop370+startIndexOfLatitude]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]));
        let firstSegmentData = findParameters(startLoop370, middlePoint370);
        console.log("סטיית תקן", firstSegmentData[0]); 
        console.log("average roll:", firstSegmentData[1], "max:", firstSegmentData[2]); 
        console.log("middle:", "speed:", speedValues[middlePoint370+startIndexOfLatitude], Math.abs(130-speedValues[middlePoint370+startIndexOfLatitude]),
        "hight:", items[middlePoint370+startIndexOfLatitude]["OwnPlatform.StateVector.PresentPos.AltitudeSea"], Math.abs(21000-items[middlePoint370+startIndexOfLatitude]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]));
      
        let secondSegmentData = findParameters(middlePoint370, endLoop370);
        console.log("second segment:", "speed:", speedValues[endLoop370+startIndexOfLatitude], Math.abs(370-speedValues[endLoop370+startIndexOfLatitude]),
        "hight:", items[endLoop370+startIndexOfLatitude]["OwnPlatform.StateVector.PresentPos.AltitudeSea"], Math.abs(13000-items[endLoop370+startIndexOfLatitude]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]))
        console.log("סטיית תקן:", secondSegmentData[0]);
        console.log("average roll:", secondSegmentData[1], "max:", secondSegmentData[2]); 
      }
    }
  }
  if (((loopCount === 2) || (loopCount === 1)) && result.length !== 0) {
    return [result, endLoop370+startIndexOfLatitude];
  } else {
    return [undefined, 0];
  }
}


function findLoop320Exercise(items, indexOfStart) {
  let startLoop320, endLoop320, middlePoint320;
  let result = [];
  for (let i = indexOfStart; i < items.length; i++) {
    if (parseFloat(items[i]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= 16300 &&
      parseFloat(items[i]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= 20200 && speedValues[i] >= 115 
      && speedValues[i] <= 165) {
      for (let j = i; j >= indexOfStart; j--) {
        if (parseFloat(items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= 12000 &&
          parseFloat(items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= 15200 && 
          speedValues[j] >= 300 && speedValues[j] <= 350 && pitchConvertedValues[j] >= 0 && pitchConvertedValues[j] < 10) {
            if ((360 - headingConvertedValues[j] + headingConvertedValues[i] >= 150 &&
              360 - headingConvertedValues[j] + headingConvertedValues[i] <= 210) ||
              (headingConvertedValues[i] - headingConvertedValues[j] >= 150 && headingConvertedValues[i] - headingConvertedValues[j] <= 210)) {
                startLoop320 = j-startIndexOfLatitude;
              for (let k = i; k < items.length; k++) {
                if (parseFloat(items[k]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= 10000 && 
                parseFloat(items[k]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= 15200
                && pitchConvertedValues[k] >= -2 && pitchConvertedValues[k] < 10) {
                  endLoop320 = k-startIndexOfLatitude;
                  for(let r = startLoop320+startIndexOfLatitude; r < endLoop320+startIndexOfLatitude; r++) {
                    if ((parseFloat(items[r]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) > 
                    parseFloat(items[r+1]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]))
                    && parseFloat(items[r]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >
                    parseFloat(items[r-1]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) && speedValues[r] >= 115 
                    && speedValues[r] <= 165 && pitchConvertedValues[r] < 10) {
                      middlePoint320 = i-startIndexOfLatitude;
                    }             
                  }
                  break;
                }
              }    
            }
        break;
        }
      }
      if (startLoop320 !== undefined && endLoop320 !== undefined && middlePoint320 !== undefined && (endLoop320-startLoop320) <= 500 
      && ((headingConvertedValues[endLoop320+startIndexOfLatitude] - headingConvertedValues[startLoop320+startIndexOfLatitude]) > -100 || (headingConvertedValues[endLoop320+startIndexOfLatitude] - headingConvertedValues[startLoop320+startIndexOfLatitude]) < -300)) {
        for (let a = startLoop320; a <= endLoop320; a++) {
          result.push(items[a]);
        }
        i = items.length;
        j = items.length;
        k = items.length;
        console.log(startLoop320, endLoop320);
      }    
    }
  }
  if (result[0] === undefined) {
    return [undefined, 0];
  } 
  return [result, endLoop320+startIndexOfLatitude];
}


function findWingOverExerecise(items, startHight = 13000, TimeOfStart = 0) {
  let timeDifference = 0, startTime;
  let startWO, endWO;

  for (let i = 1; i < items.length - 1; i++) {
    if (parseFloat(items[i]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >= startHight - 200 &&
      parseFloat(items[i]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <= startHight + 200 && speedValues[i] >= 235 && speedValues[i] <= 265 
      && Math.abs(rollConvertedValues[i]) <= 10 && TimeOfStart <= parseFloat(items[i]["EntityMetadata.RecordingTime"])) {
      startWO = i;
      startTime = parseFloat(items[i]["EntityMetadata.RecordingTime"]);
      for (let j = i; j < items.length - 1; j++) {
        timeDifference = timeDifference + (items[j]["EntityMetadata.RecordingTime"] -
         items[j - 1]["EntityMetadata.RecordingTime"]) / 1000;
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
              timeDifference =
                timeDifference +
                (items[h]["EntityMetadata.RecordingTime"] -
                  items[h - 1]["EntityMetadata.RecordingTime"]) /
                  1000;
              if (timeDifference > 15) {
                j = items.length;
                break;
              }
              if (Math.abs(rollConvertedValues[h]) >= 80 && timeDifference <= 15) {
                for (let l = h + 1; l < items.length - 1; l++) {
                  if (Math.abs(rollConvertedValues[l]) <= 10 && Math.abs(pitchConvertedValues[l]) <= 10 &&
                    (parseFloat(items[l]["EntityMetadata.RecordingTime"]) -startTime) / 1000 <= 50 && speedValues[l] >= 350 &&
                    speedValues[l] <= 390) {
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


function findBarellRollExercise(items, TimeOfStart) {
  let seconds = 0;
  let indexOfStartBR = 0;
  let indexOfEndBR = 0;
  let arrayOfBR = [];
  let amountOfBR = 0;
  let isPitch90 = false;
  let seconds2;
  for (let i = 0; i < items.length; i++) {
    if (
      parseFloat(items[i]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) >=
        12300 &&
      parseFloat(items[i]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]) <=
        14700 &&
      Math.abs(rollConvertedValues[i]) <= 10 &&
      Math.abs(rollConvertedValues[i]) >= 0 &&
      TimeOfStart <= parseFloat(items[i]["EntityMetadata.RecordingTime"])
    ) {
      if (speedValues[i] >= 275 && speedValues[i] <= 350) {
        indexOfStartBR = i - startIndexOfLatitude;
        let firstHeading = headingConvertedValues[indexOfStartBR];
        seconds = parseFloat(items[i]["EntityMetadata.RecordingTime"]); // seconds of the barellRoll start index

        for (let j = i + 1; j < items.length; j++) {
          let headingDifferenceOption1 =
            headingConvertedValues[j] - headingConvertedValues[indexOfStartBR];
          let headingDifferenceOption2 =
            360 -
            headingConvertedValues[indexOfStartBR] +
            headingConvertedValues[j];
          let currSeconds = Math.abs(
            Math.round(
              (items[j]["EntityMetadata.RecordingTime"] - seconds) / 1000
            )
          );
          if (
            ((Math.round(Math.abs(headingDifferenceOption1)) >= 20 &&
              Math.round(Math.abs(headingDifferenceOption1)) <= 170) ||
              (Math.round(headingDifferenceOption2) >= 20 &&
                Math.round(headingDifferenceOption2) <= 170)) &&
            currSeconds >= 1 &&
            currSeconds <= 30 &&
            parseFloat(
              items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
            ) >= 17000 &&
            parseFloat(
              items[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
            ) <= 19000 &&
            speedValues[j] >= 100 &&
            speedValues[j] <= 400 &&
            Math.round(Math.abs(rollConvertedValues[j])) >= 110 &&
            Math.round(Math.abs(rollConvertedValues[j])) <= 185 &&
            ((Math.round(Math.abs(headingConvertedValues[j])) >= 20 &&
              Math.round(Math.abs(headingConvertedValues[j])) <= 75) ||
              (Math.round(Math.abs(headingConvertedValues[j])) > 250 &&
                Math.round(Math.abs(headingConvertedValues[j])) < 320))
          ) {
            let indexOfSecondPoint = j;
            if (indexOfSecondPoint - indexOfStartBR < 1000) {
              for (let m = indexOfSecondPoint; m > indexOfStartBR; m--) {
                if (
                  parseFloat(
                    items[m]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
                  ) >= 12300 &&
                  parseFloat(
                    items[m]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
                  ) <= 14200 &&
                  speedValues[m] >= 275 &&
                  speedValues[m] <= 315 &&
                  Math.abs(rollConvertedValues[m]) <= 10 &&
                  Math.abs(rollConvertedValues[m]) >= 0
                ) {
                  indexOfStartBR = m - startIndexOfLatitude;
                }
              }

              for (let k = indexOfSecondPoint; k < items.length; k++) {
                headingDifferenceOption1 =
                  headingConvertedValues[k] -
                  headingConvertedValues[indexOfStartBR];
                headingDifferenceOption2 =
                  360 -
                  (headingConvertedValues[indexOfStartBR] +
                    headingConvertedValues[k]);
                if (
                  parseFloat(
                    items[k]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
                  ) >= 12800 &&
                  parseFloat(
                    items[k]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]
                  ) <= 14200 &&
                  speedValues[k] >= 200 &&
                  speedValues[k] <= 400
                  // ((headingDifferenceOption1 >= 39 && headingDifferenceOption1 <=41) || (headingDifferenceOption2 >= 39 && headingDifferenceOption2 <= 41 ))
                ) {
                  seconds2 =
                    items[indexOfEndBR]["EntityMetadata.RecordingTime"];
                  indexOfEndBR = k - startIndexOfLatitude;
                  let lastHeading =
                    headingConvertedValues[indexOfEndBR + startIndexOfLatitude];
                  let secondHeading =
                    headingConvertedValues[indexOfSecondPoint];
                  let calcHeading = Math.abs(lastHeading - secondHeading);
                  for (
                    let d = indexOfStartBR + startIndexOfLatitude;
                    i < indexOfSecondPoint;
                    i++
                  ) {
                    if (
                      Math.abs(Math.round(items[d][pitchConvertedValues])) >=
                        85 &&
                      Math.abs(Math.round(items[d][pitchConvertedValues])) <= 95
                    )
                      isPitch90 = true;
                    break;
                  }

                  if (!isPitch90 && calcHeading < 100 && indexOfEndBR - indexOfStartBR <2000 ) {
                    let startLoop = indexOfStartBR;
                    let endLoop = indexOfEndBR;
                    if (endLoop - startLoop > 1500) endLoop -= 1500;

                    for (let a =startLoop; a <= endLoop; a++) {
                      arrayOfBR.push(items[a]);
                    }

                    console.log("time of start " + TimeOfStart);
                    console.log(
                      "time of first index " +
                        items[indexOfStartBR + startIndexOfLatitude][
                          "EntityMetadata.RecordingTime"
                        ]
                    );
                    console.log("index of second index " + indexOfSecondPoint);
                    console.log(
                      "index of start " +
                        (indexOfStartBR + startIndexOfLatitude)
                    );
                    // console.log(
                    //   "time of end index " +
                    //     items[indexOfEndBR + startIndexOfLatitude][
                    //       "EntityMetadata.RecordingTime"
                    //     ]
                    // );
                    console.log(
                      "index of end " + (indexOfEndBR + startIndexOfLatitude)
                    );

                    console.log(
                      "secondheading " +
                        headingConvertedValues[indexOfSecondPoint]
                    );
                    console.log(
                      "last heading " +
                        headingConvertedValues[
                          indexOfEndBR + startIndexOfLatitude
                        ]
                    );
                    console.log("calc heading " + calcHeading);
                    k = items.length;
                    j = items.length;
                    i = items.length;
                  } else {
                    k = items.length;
                  }
                }
              }
              return [arrayOfBR , (indexOfEndBR + startIndexOfLatitude)];
            }
          }
        }
      }
    }
  }
  if (arrayOfBR[0] === undefined) {
    return [undefined, -1];
  }
  return [
    arrayOfBR,
    items[indexOfEndBR + startIndexOfLatitude]["EntityMetadata.RecordingTime"],
  ];
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
        data: data
          .slice(startIndexOfLatitude)
          .map((item, index) => ({ x: index, y: item[relevantData] })),
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
      exerciseX.push(parseFloat(item["East"]));
      exerciseY.push(parseFloat(item["North"]));
      exerciseZ.push(parseFloat(item["Down"]));
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
    currentPitchMax = Number(
      data[i]["OwnPlatform.StateVector.PresentPos.Pitch"]
    );
    previousPitchMax = Number(
      data[i - 1]["OwnPlatform.StateVector.PresentPos.Pitch"]
    );
    nextPitchMax = Number(
      data[i + 1]["OwnPlatform.StateVector.PresentPos.Pitch"]
    );
    // changing the range from 1.5 to 1.4

    if (
      currentPitchMax >= previousPitchMax &&
      currentPitchMax >= nextPitchMax &&
      currentPitchMax >= 1.4
    ) {
      for (let j = i + 1; j < data.length - 1; j++) {
        currentPitchMin = Number(
          data[j]["OwnPlatform.StateVector.PresentPos.Pitch"]
        );
        previousPitchMin = Number(
          data[j - 1]["OwnPlatform.StateVector.PresentPos.Pitch"]
        );
        nextPitchMin = Number(
          data[j + 1]["OwnPlatform.StateVector.PresentPos.Pitch"]
        );

        // changing the range from 1.5 to 1.4
        if (
          currentPitchMin <= previousPitchMin &&
          currentPitchMin <= nextPitchMin &&
          currentPitchMin <= -1.4
        ) {
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
          for (
            let k = maxPitch - startIndexOfLatitude;
            k <= minPitch - startIndexOfLatitude;
            k++
          ) {
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

function handleChartClick2D(clickedIndex, sendFrom3D) {
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
    let clickedX = data[clickedIndex]["East"];
    let clickedY = data[clickedIndex]["North"];
    let clickedZ = data[clickedIndex]["Down"];

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
    if (header.includes(arrOfHeaders[i])) {
      return true;
    }
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
  let isFoundRecordingTime = false, notTheFirst = false;
  let newVal, prvVal;

  for (let j = 0; j < data.length; j++) {
    if (data[j][header] !== undefined && data[j][header] !== null && data[j]["EntityMetadata.EntityType"] === "Own") {
      
      currVal = data[j][header];
      
      if(isFoundRecordingTime) {
        currVal = currVal + prvVal;
        arr.push(currVal);
      }
      if(header == 'EntityMetadata.RecordingTime' && data[j + 1][header] < data[j][header]) {
        isFoundRecordingTime = true;
        prvVal = currVal;
        if(!notTheFirst) {
          arr.push(currVal);
        }
        notTheFirst = true;
      }

      for (let k = j + 1; k < data.length; k++) {
        if (data[k][header] !== undefined && data[k][header] !== null && data[k]["EntityMetadata.EntityType"] === "Own") {
          nextVal = data[k][header];
          index = 0;
          if(isFoundRecordingTime) {
            nextVal = data[k][header] + prvVal;
            while (index < 8) {
              index++;
              newVal = (currVal + ((nextVal  - currVal) / 9) * index);
              arr.push(newVal);
            }
          } else {
            arr.push(currVal);
            nextVal = data[k][header];
            while (index < 8) {
              index++;
              newVal = currVal + ((nextVal - currVal) / 9) * index;
              arr.push(newVal);
            }
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
  let ifFoundRBS = false;

  if (header === "OwnPlatform.StateVector.PresentPos.Latitude") {
    for (let i = 0; i < data.length; i++) {
      if (data[i][header] !== undefined) {
        counter++;
        if (counter === 30) {
          startIndexOfLatitude = i - 29;
          for (let m = startIndexOfLatitude - 1; m > 0; m--) {
            data[m][header] = undefined;
          }
          for (let j = i; j < data.length; j++) {
            if (data[j][header] == undefined) {
              counter++;
              if (counter === 40) {
                endIndexOfLatitude = j - 40;
                lastIndex = endIndexOfLatitude;
                for (let k = endIndexOfLatitude + 1; k < data.length; k++) {
                  data[k][header] = undefined;
                }
                break;
              }
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
  }

  if (startIndexOfLatitude !== undefined && endIndexOfLatitude !== undefined) {
    for (let i = startIndexOfLatitude; i < endIndexOfLatitude; i++) {

      if (data[i][header] === undefined && data[i]["EntityMetadata.EntityType"] == "Own") {
        let firstValue;
        for (let t = i; t > startIndexOfLatitude; t--) {
          if (data[t][header] !== undefined && data[t]["EntityMetadata.EntityType"] == "Own") {
            firstValue = data[t][header];
            break;
          }
        }

        // let firstValue = data[i - 1][header];

        let counterEmptyValue = 0;
        let lastValue;
        for (let j = i; j < endIndexOfLatitude; j++) {
          if (
            data[j][header] == undefined &&
            data[j]["EntityMetadata.EntityType"] == "Own"
          ) {
            counterEmptyValue++;
          } else if ((data[j][header] !== undefined && data[j]["EntityMetadata.EntityType"] == "Own")){
            lastValue = data[j][header];
            break;
          }
        }

        let numberOfEmptySpot = 0;
        while (numberOfEmptySpot < counterEmptyValue) {
          numberOfEmptySpot++;
          let newValue =
            firstValue +
            ((lastValue - firstValue) / (counterEmptyValue + 1)) *
              numberOfEmptySpot;
          data[i - 1 + numberOfEmptySpot][header] = newValue;
        }
      }
    }
  }
}

function downloadCSV() {
  const headers2 = Object.keys(data[0]);
  const slicedData = data.slice(740, 19674);

  const csvContent = [
    headers2.join(","),
    ...slicedData.map((obj) => headers2.map((header) => obj[header]).join(",")),
  ].join("\n");

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
      let convertedSpeed =
        (parseFloat(data[i]["OwnPlatform.StateVector.Velocity.CAS"]) * 3600) /
        6076.1;
      speedValues.push(convertedSpeed);
    }
    if (checkData(i, "OwnPlatform.StateVector.PresentPos.Pitch")) {
      let convertedPitchDeg =
        (data[i]["OwnPlatform.StateVector.PresentPos.Pitch"] * 180) / Math.PI;
      pitchConvertedValues.push(convertedPitchDeg);
    }
    if (checkData(i, "OwnPlatform.StateVector.PresentPos.Roll")) {
      let convertedRollDeg =
        (data[i]["OwnPlatform.StateVector.PresentPos.Roll"] * 180) / Math.PI;
      rollConvertedValues.push(convertedRollDeg);
    }
    if (checkData(i, "OwnPlatform.StateVector.PresentPos.Heading")) {
      let convertedHeadingDeg =
        (data[i]["OwnPlatform.StateVector.PresentPos.Heading"] * 180) / Math.PI;
      headingConvertedValues.push(convertedHeadingDeg);
    }
  }
}

function createLocation() {
  let firstIndexToUse;
  for (let j = startIndexOfLatitude; j < data.length; j++) {
    if (
      data[j]["OwnPlatform.StateVector.PresentPos.Latitude"] !== undefined &&
      data[j]["OwnPlatform.StateVector.PresentPos.Longitude"] !== undefined &&
      data[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"] !== undefined
    ) {
      northValues.push(
        parseFloat(data[j]["OwnPlatform.StateVector.PresentPos.Longitude"])
      );
      eastValues.push(
        parseFloat(data[j]["OwnPlatform.StateVector.PresentPos.Latitude"])
      );
      downValues.push(
        parseFloat(data[j]["OwnPlatform.StateVector.PresentPos.AltitudeSea"])
      );
      firstIndexToUse = j + 1;
      break;
    }
  }
  for (let i = firstIndexToUse; i < data.length; i++) {
    if (
      data[i]["OwnPlatform.StateVector.Velocity.East"] !== undefined &&
      data[i]["OwnPlatform.StateVector.Velocity.North"] !== undefined &&
      data[i]["OwnPlatform.StateVector.Velocity.Down"] !== undefined
    ) {
      let newNorthValue =
        northValues[i - firstIndexToUse] +
        (data[i - 1]["OwnPlatform.StateVector.Velocity.North"] * 100) / 3.2808;
      northValues.push(newNorthValue);

      let newEastValue =
        eastValues[i - firstIndexToUse] +
        (data[i - 1]["OwnPlatform.StateVector.Velocity.East"] * 100) / 3.2808;
      eastValues.push(newEastValue);

      let newDownValue =
        downValues[i - firstIndexToUse] +
        (data[i - 1]["OwnPlatform.StateVector.Velocity.Down"] * 100) / 3.2808;
      downValues.push(newDownValue);
    }
  }
  for (let k = 0; k < northValues.length; k++) {
    data[k]["North"] = northValues[k];
    data[k]["East"] = eastValues[k];
    data[k]["Down"] = -downValues[k];
  }
}


function convertData2() {

  northValues.push( parseFloat(data[startIndexOfLatitude]["OwnPlatform.StateVector.PresentPos.Longitude"]));
  eastValues.push( parseFloat(data[startIndexOfLatitude]["OwnPlatform.StateVector.PresentPos.Latitude"]));
  downValues.push( parseFloat( data[startIndexOfLatitude]["OwnPlatform.StateVector.PresentPos.AltitudeSea"]));
  speedValues.push(parseFloat(data[startIndexOfLatitude]["OwnPlatform.StateVector.Velocity.CAS"]));
  pitchConvertedValues.push(parseFloat(data[startIndexOfLatitude]["OwnPlatform.StateVector.PresentPos.Pitch"]));
  rollConvertedValues.push(parseFloat(data[startIndexOfLatitude]["OwnPlatform.StateVector.PresentPos.Roll"]));
  headingConvertedValues.push(parseFloat(data[startIndexOfLatitude]["OwnPlatform.StateVector.PresentPos.Heading"]));

  for (let i = startIndexOfLatitude; i < data.length; i++) {
      let newNorthValue = northValues[i - startIndexOfLatitude] + (data[i - 1]["OwnPlatform.StateVector.Velocity.North"] * 100) /3.2808;
      northValues.push(newNorthValue);
      let newEastValue = eastValues[i - startIndexOfLatitude] + (data[i - 1]["OwnPlatform.StateVector.Velocity.East"] * 100) /3.2808;
      eastValues.push(newEastValue);
      let newDownValue = downValues[i - startIndexOfLatitude] + (data[i - 1]["OwnPlatform.StateVector.Velocity.Down"] * 100) / 3.2808;
      downValues.push(newDownValue);
      let convertedSpeed = (parseFloat(data[i]["OwnPlatform.StateVector.Velocity.CAS"]) * 3600) / 6076.1;
      speedValues.push(convertedSpeed);
      let convertedPitchDeg = (data[i]["OwnPlatform.StateVector.PresentPos.Pitch"] * 180) / Math.PI;
      pitchConvertedValues.push(convertedPitchDeg);
      let convertedRollDeg = (data[i]["OwnPlatform.StateVector.PresentPos.Roll"] * 180) / Math.PI;
      rollConvertedValues.push(convertedRollDeg);
      let convertedHeadingDeg = (data[i]["OwnPlatform.StateVector.PresentPos.Heading"] * 180) / Math.PI;
      headingConvertedValues.push(convertedHeadingDeg);
  }

  for (let k = 0; k < northValues.length; k++) {
    data[k]["OwnPlatform.StateVector.Velocity.North"] = northValues[k];
    data[k]["OwnPlatform.StateVector.Velocity.East"] = eastValues[k];
    data[k]["OwnPlatform.StateVector.Velocity.Down"] = -downValues[k];
    data[k]["OwnPlatform.StateVector.Velocity.CAS"] = speedValues[k];
    data[k]["OwnPlatform.StateVector.PresentPos.Pitch"] = pitchConvertedValues[k];
    data[k]["OwnPlatform.StateVector.PresentPos.Roll"] = rollConvertedValues[k];
    data[k]["OwnPlatform.StateVector.PresentPos.Heading"] = headingConvertedValues[k];
  }
}