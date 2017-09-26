
var loadedPointData;
var sortedTimes = [];

loadPointData('csv/20170923_USDDPexample_MC.csv');

// loadGroupData();

function loadPointData(csvFilename)
{
    jQuery.get(csvFilename, function(data) {
        loadedPointData = parsePointData(data);
    });
}

// function loadGroupData(csvFileData)
// {
//     jQuery.get('csv/groupData.csv', function(data) {
//         console.log("Loaded group data");
//     });
// }

// ID, t, rx, ry, rz, vx, vy, vz, ux, uy, uz,
// where ID=sample number of Monte-Carlo, r* = position, v*=velocity, u*=thrust (control input)
function parsePointData(data)
{
    let csvData = $.csv.toObjects(data);

    // Cluster by timestamp
    let dataByTime = {};

    for (let i = 0; i < csvData.length; i++)
    {
        let dataItem = csvData[i];
        let time = dataItem['t'];

        if (time in dataByTime)
        {
            dataByTime[time].push(dataItem);
        }
        else
        {
            // New time
            dataByTime[time] = [dataItem];
        }
    }

    sortedTimes = Object.keys(dataByTime);
    sortedTimes.sort(timeComparator);

    return dataByTime;
}

function timeComparator(a, b) {
    return a - b;
}

// // t,rx,ry,rz,vx,vy,vz, c11, c12, c13, ..., c16, c22, c23, ..., c26, c33, c34, ..., c36, c44, ..., c66
// // where r*=Mean position, v*=Mean velocity, c**= Covariance (symmetric matrix)
// function parseGroupData()
// {

// }