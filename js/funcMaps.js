function writeCoords(userCoords, splineCoords) {
    var strWrite = "";
    splineCoords.forEach(function (entry) {
        strWrite = strWrite + entry.lat().toFixed(6) + "," + entry.lng().toFixed(6) + "\n";
    });

    //saves the coords to splineCoords.txt
    $.post("php/users/saveSplineCoords.php", {
        'data': strWrite
    });

    //saves userCoords to SQL table user_coords
    $.post("php/users/saveUserCoords.php", {
        userCoords: JSON.stringify(userCoords)
    });
}

function getUserCoords(callback) {
    var ret = [];
    $.ajax({
        type: 'POST',
        url: 'php/getPoints.php',
        data: "",
        async: true,
        dataType: 'json',
        success: function (rows) {
            //rows is a [][]
            rows.forEach(function (elem) {
                ret.push(new google.maps.LatLng(elem[0], elem[1]));
            });
            return callback(ret);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function makeArraySplinable(pathArray) {
    // https://johan.karlsteen.com/2011/07/30/improving-google-maps-polygons-with-b-splines/ 
    //funktionen mit array bzw Objekt sind in js call by reference http://stackoverflow.com/questions/6605640/javascript-by-reference-vs-by-value
    //copy array
    var arr = pathArray.slice(0);
    var element1 = arr[0];
    var element2 = arr[1];
    var elementLast = arr[arr.length - 1];
    var elementBeforeLast = arr[arr.length - 2];

    arr.push(element1, element2);
    arr.unshift(elementBeforeLast, elementLast);
    return arr;
}

function bspline(inPoints) {
    var arr = makeArraySplinable(inPoints);
    var i, t, ax, ay, bx, by, cx, cy, dx, dy, lat, lon, points;
    points = [];
    // For every point
    for (i = 2; i < arr.length - 2; i++) {
        for (t = 0; t < 1; t += 0.2) {
            ax = (-arr[i - 2].lat() + 3 * arr[i - 1].lat() - 3 * arr[i].lat() + arr[i + 1].lat()) / 6;
            ay = (-arr[i - 2].lng() + 3 * arr[i - 1].lng() - 3 * arr[i].lng() + arr[i + 1].lng()) / 6;
            bx = (arr[i - 2].lat() - 2 * arr[i - 1].lat() + arr[i].lat()) / 2;
            by = (arr[i - 2].lng() - 2 * arr[i - 1].lng() + arr[i].lng()) / 2;
            cx = (-arr[i - 2].lat() + arr[i].lat()) / 2;
            cy = (-arr[i - 2].lng() + arr[i].lng()) / 2;
            dx = (arr[i - 2].lat() + 4 * arr[i - 1].lat() + arr[i].lat()) / 6;
            dy = (arr[i - 2].lng() + 4 * arr[i - 1].lng() + arr[i].lng()) / 6;
            lat = ax * Math.pow(t + 0.1, 3) + bx * Math.pow(t + 0.1, 2) + cx * (t + 0.1) + dx;
            lon = ay * Math.pow(t + 0.1, 3) + by * Math.pow(t + 0.1, 2) + cy * (t + 0.1) + dy;
            points.push(new google.maps.LatLng(lat, lon));
        }
    }
    return points;
}