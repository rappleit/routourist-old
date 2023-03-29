// markers css
// nodejs, split into modules

// Requests using more than 10 waypoints, or waypoint optimization, are billed at a higher rate

// https://webninjadeveloper.com/javascript/javascript-google-directions-api-example-to-display-routes-between-two-locations-in-google-maps/
// https://developers.google.com/maps/documentation/javascript/directions
// https://developers.google.com/maps/documentation/javascript/markers
var map;
var directionsService;
var placesSearch;
var allData;
const autoCompleteOptions = {
    componentRestrictions: {country: "sg"},
};
const markersPolylines = [];

const fromBox = document.querySelector("#from");
const firstToBox = document.querySelector(".waypoints");
const addWaypointBox = document.querySelector("#addWaypoint");
const transportModeBox = document.querySelector("#transportMode");
const directionsPanel = document.querySelector("#directionsPanel");
const compareCarbonFootprintPanel = document.querySelector(
    "#compareCarbonFootprintPanel"
);

function initMap() {
    // Map Styling: https://mapstyle.withgoogle.com/
    map = new google.maps.Map(document.querySelector("#map"), {
        center: {lat: 1.3521, lng: 103.8198},
        zoom: 12,
        mapId: "741626712eb9af1",
    });
    google.maps.event.addListener(map, "click", function (event) {
        this.setOptions({scrollwheel: true});
    });
    directionsService = new google.maps.DirectionsService();
    // For custom marker images, add {suppressMarkers:true}, https://thewebstorebyg.wordpress.com/2013/01/11/custom-directions-panel-with-google-maps-api-v3/

    const sourceAutocomplete = new google.maps.places.Autocomplete(
        document.querySelector("#from"),
        autoCompleteOptions
    );
    const destAutocomplete = new google.maps.places.Autocomplete(
        document.querySelector(".to"),
        autoCompleteOptions
    );
    placesSearch = new google.maps.places.PlacesService(map);
    allData = retrieveAllData();
}

let waypointsNum = 1;

function addWaypoint() {
    waypointsNum++;
    const input = document.createElement("input");
    input.setAttribute("class", "to");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", `To (${waypointsNum})`);
    input.setAttribute("style", "width: 100%");

    // let label = document.createElement("label");
    // label.innerHTML = `${String.fromCharCode(65 + locationsNum)}: `;
    // firstTo.appendChild(label);

    const br = document.createElement("br");

    firstToBox.replaceChild(input, addWaypointBox);
    firstToBox.appendChild(br);
    firstToBox.appendChild(addWaypointBox);

    destAutocomplete = new google.maps.places.Autocomplete(
        document.querySelectorAll(".to")[waypointsNum - 1],
        autoCompleteOptions
    );
}

function calcRoute() {
    const from = document.querySelector("#from").value;
    const waypoints = Array.from(document.querySelectorAll(".to")).map(
        (waypoint) => waypoint.value
    );
    const transportMode = transportModeBox.value.toUpperCase();
    const optimizeRoute = document.querySelector("#optimizeRoute").checked;
    const categoriesChecked = Array.from(document.querySelectorAll(".category"))
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.name);
    const radius = document.querySelector("#radius").value;

    const user = {
        userID: "testuser",
        categoriesChecked: categoriesChecked,
        radius: radius,
        request: {
            origin: from,
            destination: waypoints[waypoints.length - 1],
            waypoints: waypoints,
            travelMode: transportMode,
            optimizeWaypoints: optimizeRoute,
        },
    };
    retrieveRoute(user);
}

function clearMap() {
    // Clear markers & polylines
    if (markersPolylines.length > 0) {
        for (let i = 0; i < markersPolylines.length; i++) {
            if (markersPolylines[i] != null) {
                try {
                    // For polyline, since both won't give errors
                    markersPolylines[i].setMap(null);
                } catch (TypeError) {
                    // For advanced markers
                    markersPolylines[i].map = null;
                }
            }
        }
    }
    markersPolylines.length = 0;
}

function saveRoute(userID, request, routeString) {
    // Save Route to DB here
    // routeString is saved also, so as to fast display to user what's it's set to on SavedRoutes page. If no need, don't save since its regenerated in retrieveRoute anyway
    const user = {
        userID: userID,
        request: request,
        routeString: routeString,
    };
    console.log(`Route saved!\n${user}`);
}

function retrieveRoute(user) {
    // Retrieve from DB
    const from = user["request"]["origin"];
    const waypoints = user["request"]["waypoints"];
    const transportMode = user["request"]["travelMode"];
    const optimizeRoute = user["request"]["optimizeWaypoints"];

    const categoriesChecked = user["categoriesChecked"];
    const radius = user["radius"];
    const REQUEST = user["request"];
    let carbonFootprintCount = 0;

    clearMap();
    const directionsRenderer = new google.maps.DirectionsRenderer();

    directionsRenderer.setMap(map);
    // 1) Textual display of directions
    directionsRenderer.setPanel(directionsPanel);
    markersPolylines.push(directionsRenderer);

    if (transportMode === "TRANSIT") {
        let routeString = `Optimal route for ${transportMode}: <br>`;

        if (waypoints.length > 1) {
            if (optimizeRoute) {
                // If TRANSIT & >2 & optimize
                // ∴ Uses driving (roads, ∴ Mostly accurate to buses only) & distance(?) to optimize order first
                request = {
                    origin: from,
                    destination: waypoints[waypoints.length - 1],
                    waypoints: waypoints
                        .slice(0, waypoints.length)
                        .map((waypoint) => {
                            return {
                                location: waypoint,
                                stopover: true,
                            };
                        }),
                    travelMode: "DRIVING",
                    optimizeWaypoints: optimizeRoute,
                    unitSystem: google.maps.UnitSystem.METRIC,
                    region: "SG",
                };
                directionsService.route(request, function (result, status) {
                    if (status === "OK") {
                        const waypoints_copy = waypoints.slice();
                        result["routes"][0]["waypoint_order"].map(
                            (optimalOrder, index) => {
                                waypoints[index] = waypoints_copy[optimalOrder];
                            }
                        );
                    } else {
                        directionsPanel.innerHTML = `<h1>${status}</h1>`;
                    }
                });
            }
            // If TRANSIT & >2
            setTimeout(() => {
                waypoints.unshift(from);
                let encodedRoutePolylineArray = [];
                let routeLegsArray = [];
                for (let i = 0; i < waypoints.length - 1; i++) {
                    request = {
                        origin: waypoints[i],
                        destination: waypoints[i + 1],
                        travelMode: transportMode,
                        optimizeWaypoints: optimizeRoute,
                        unitSystem: google.maps.UnitSystem.METRIC,
                        region: "SG",
                    };

                    directionsService.route(request, function (result, status) {
                        if (status === "OK") {
                            // ASYNC nature resolves promises with less data faster, so .push doesn't guarantee order.
                            // Specifying order within array guarantees resolved promises will be slotted in that order.
                            encodedRoutePolylineArray[i] =
                                result["routes"][0]["overview_polyline"];
                            console.log("IN ORIGINAL");
                            console.log(result["routes"][0]["legs"]);
                            routeLegsArray[i] = result["routes"][0]["legs"];
                        } else {
                            directionsPanel.innerHTML = `<h1>${request["origin"]} -> ${request["destination"]} failed with a status of ${status}</h1>`;
                        }
                    });

                    let to = waypoints[i];
                    let toSplit = to.split(",");
                    routeString += `${
                        toSplit.length > 2 ? toSplit[1] : to
                    } -> `;
                    if (i === waypoints.length - 2) {
                        to = waypoints[i + 1];
                        toSplit = to.split(",");
                        routeString += toSplit.length > 2 ? toSplit[1] : to;
                    }
                }

                // ASYNC directionsService request
                setTimeout(() => {
                    directionsPanel.innerHTML = `<h1>${routeString}</h1>`;
                    drawTransitRoute(
                        encodedRoutePolylineArray,
                        routeLegsArray,
                        routeString
                    );

                    const lat_lngArray = routeLegsArray
                        .map((leg) =>
                            leg[0]["steps"].map((step) =>
                                step["lat_lngs"].filter(
                                    (info, i) => i % 100 === 0
                                )
                            )
                        )
                        .flat(2);
                    nearbyPlaceSearch(lat_lngArray, categoriesChecked, radius);
                    console.log(routeLegsArray);
                    carbonFootprintCount += calculatePartialCarbonFootprint(
                        routeLegsArray.map((leg) => leg[0]["steps"])[0]
                    );
                    calculateTotalCarbonFootprint(
                        REQUEST,
                        carbonFootprintCount
                    );

                    // saveRoute(user["userID"], user["request"], routeString);
                }, 500);
            }, 500);
            // If TRANSIT & =2
        } else {
            request = {
                origin: from,
                destination: waypoints[waypoints.length - 1],
                waypoints: [],
                travelMode: transportMode,
                optimizeWaypoints: optimizeRoute,
                unitSystem: google.maps.UnitSystem.METRIC,
                region: "SG",
            };
            directionsService.route(request, function (result, status) {
                if (status === "OK") {
                    directionsRenderer.setDirections(result);
                    const fromSplit = from.split(",");
                    const to = request["destination"];
                    const toSplit = to.split(",");
                    routeString +=
                        (fromSplit.length > 2 ? fromSplit[1] : from) +
                        " -> " +
                        (toSplit.length > 2 ? toSplit[1] : to);

                    directionsPanel.innerHTML = `<h1>${routeString}</h1>`;
                    nearbyPlaceSearch(
                        getLat_LngArray(result),
                        categoriesChecked,
                        radius
                    );

                    carbonFootprintCount += calculatePartialCarbonFootprint(
                        result["routes"][0]["legs"].map(
                            (leg) => leg["steps"]
                        )[0]
                    );
                    calculateTotalCarbonFootprint(
                        REQUEST,
                        carbonFootprintCount
                    );

                    // saveRoute(user["userID"], user["request"], routeString);
                } else {
                    directionsPanel.innerHTML = `<h1>${status}</h1>`;
                }
            });
        }
        // If DRIVING/WALKING/BICYCLING
    } else {
        request = {
            origin: from,
            destination: waypoints[waypoints.length - 1],
            waypoints: waypoints.slice(0, waypoints.length).map((waypoint) => {
                return {
                    location: waypoint,
                    stopover: true,
                };
            }),
            travelMode: transportMode,
            optimizeWaypoints: optimizeRoute,
            unitSystem: google.maps.UnitSystem.METRIC,
            region: "SG",
        };
        directionsService.route(request, async function (result, status) {
            if (status === "OK") {
                directionsRenderer.setDirections(result);
                let routeString =
                    `Optimal route for ${transportMode}: <br>` +
                    createRouteString(result, waypoints);

                directionsPanel.innerHTML = `<h1>${routeString}</h1>`;

                nearbyPlaceSearch(
                    getLat_LngArray(result),
                    categoriesChecked,
                    radius
                );
                console.log(result);
                carbonFootprintCount += calculatePartialCarbonFootprint(
                    result["routes"][0]["legs"].map((leg) => leg["steps"])[0]
                );
                calculateTotalCarbonFootprint(REQUEST, carbonFootprintCount);

                // saveRoute(user["userID"], user["request"], routeString);
            } else {
                directionsPanel.innerHTML = `<h1>${status}</h1>`;
            }
        });
    }
}

function createMarker(details) {
    // background: result[i]["icon_background_color"]
    // glyph: new URL(`${result[i]["icon_mask_base_uri"]}.png`)
    // May configure collisionBehaviour + zoomBehaviour
    const advancedMarkerView = new google.maps.marker.AdvancedMarkerView({
        position: details["position"],
        title: details["title"],
        content: details["content"],
        map: map,
    });
    markersPolylines.push(advancedMarkerView);
    const element = advancedMarkerView.element;

    ["focus", "pointerenter"].forEach((event) => {
        element.addEventListener(event, () => {
            highlight(advancedMarkerView);
        });
    });
    ["blur", "pointerleave"].forEach((event) => {
        element.addEventListener(event, () => {
            unhighlight(advancedMarkerView);
        });
    });
    advancedMarkerView.addListener("click", (event) => {
        window.location.href = details["url"];
    });
}

function buildContent(property) {
    // https://developers.google.com/maps/documentation/javascript/advanced-markers/html-markers#maps_advanced_markers_html-javascript
    // https://fontawesome.com/search
    const content = document.createElement("div");

    content.classList.add("property");
    property["type"] = "building";

    content.innerHTML = `
    <div class="icon">
        <i aria-hidden="true" class="fa fa-icon fa-${
            property["type"]
        }" title="${property["type"]}"></i>
        <span class="fa-sr-only">${property["type"]}</span>
    </div>
    <div class="details">
        <div class="name">${property["name"]}</div>
        <div class="address">${property["formatted_address"] || ""}</div>
        <div class="features">
        <div>
            <i aria-hidden="true" class="fa fa-solid fa-star rating" title="rating"></i>
            <span class="fa-sr-only">rating</span>
            <span>${property["rating"]}/5</span>
        </div>
        <div>
            <i aria-hidden="true" class="fa fa-solid fa-user review" title="review"></i>
            <span class="fa-sr-only">review</span>
            <span>${property["user_ratings_total"]}</span>
        </div>
        <div>
            <i aria-hidden="true" class="fa fa-solid fa-dollar price" title="price"></i>
            <span class="fa-sr-only">price</span>
            <span${
                property["price_level"] * "$" ||
                property["price_level"] ||
                "$$$$$$$$"
            }  span>
        </div>
        </div>
    </div>
    `;
    return content;
}

function highlight(markerView) {
    markerView.content.classList.add("highlight");
    markerView.element.style.zIndex = 1;
}

function unhighlight(markerView) {
    markerView.content.classList.remove("highlight");
    markerView.element.style.zIndex = "";
}

function getLat_LngArray(result) {
    // i % 100 takes every 100th lat_lng from each step, from each leg, from each route
    const lat_lngArray = result["routes"]
        .map((route) =>
            route["legs"].map((leg) =>
                leg["steps"].map((step) =>
                    step["lat_lngs"].filter((info, i) => i % 100 === 0)
                )
            )
        )
        .flat(3);
    console.log(lat_lngArray);
    return lat_lngArray;
}

function nearbyPlaceSearch(lat_lngArray, categoriesChecked, radius) {
    for (lat_lng of lat_lngArray) {
        for (source of allData) {
            for (const [theme, themePlace] of Object.entries(source)) {
                if (categoriesChecked.includes(theme)) {
                    for (place of themePlace) {
                        if (
                            haversine_distance(lat_lng, place["address"]) <=
                            Number(radius)
                        ) {
                            createMarker({
                                position: place["address"],
                                title: place["description"],
                                content: buildContent({
                                    type: place["type"],
                                    name: place["name"],
                                    rating: place["rating"],
                                    user_ratings_total: place["reviews"],
                                    url: place["url"],
                                }),
                            });
                        }
                    }
                }
            }
        }
    }
}

function nearbyGoogleAPIPlaceSearch(result) {
    let lat_lngArray = result["routes"]
        .map((route) =>
            route["legs"].map((leg) =>
                leg["steps"].map((step) =>
                    step["lat_lngs"].filter((info, i) => i % 10 === 0)
                )
            )
        )
        .flat(3);
    console.log(lat_lngArray);

    for (lat_lng of lat_lngArray) {
        request = {
            location: lat_lng,
            radius: "1",
            type: "museum",
            region: "SG",
        };
        // https://developers.google.com/maps/documentation/javascript/supported_types
        // amusement_park, bicycle_store, cafe, clothing_store, gym, lodging, movie_theater, museum, night_club, park, restaurant, shopping_mall, spa, tourist_attraction, zoo
        placesSearch.textSearch(request, function (result, status) {
            if (status === "OK") {
                for (let i = 0; i < result.length; i++) {
                    createMarker({
                        position: result[i]["geometry"]["location"],
                        title: "DESCRIPTION",
                        content: buildContent(result[i]),
                    });
                }
            }
        });
    }
}

function createRouteString(result, waypoints) {
    const from = result["routes"][0]["legs"][0]["start_address"];
    const fromSplit = from.split(",");
    // Formatting name
    let routeString = `${
        fromSplit.length > 2
            ? fromSplit[1].length > 4
                ? // if word more than 4 letters, takes word
                  fromSplit[1]
                : // Else takes Postal Code
                  // Eg. Suntec City became 3 Temasek Blvd, #1, #327-328, Singapore 038983
                  fromSplit[fromSplit.length - 1]
            : fromSplit[0]
    } -> `;

    // Eg. From 0>2>3>1, routeArray = location @ 0>...
    const routeArray = result["routes"][0]["waypoint_order"].map((i) => {
        let destination = waypoints[i];

        const destinationSplit = destination.split(",");
        destination =
            destinationSplit.length > 2
                ? destinationSplit[1].length > 4
                    ? destinationSplit[1]
                    : destinationSplit[destinationSplit.length - 1]
                : destinationSplit[0];
        return destination;
    });
    for (loc of routeArray.splice(0, routeArray.length - 1)) {
        routeString += loc + " -> ";
    }
    routeString += routeArray[routeArray.length - 1];
    return routeString;
}

function drawTransitRoute(
    encodedRoutePolylineArray,
    routeLegsArray,
    routeString
) {
    const routeStringSplit = routeString
        .split(": <br>")[1]
        .trim()
        .split(" -> ");
    let routeDirections = "";
    const colors = [
        "#e6194b",
        "#3cb44b",
        "#ffe119",
        "#4363d8",
        "#f58231",
        "#911eb4",
        "#46f0f0",
        "#f032e6",
        "#bcf60c",
        "#fabebe",
        "#008080",
        "#e6beff",
        "#9a6324",
        "#fffac8",
        "#800000",
        "#aaffc3",
        "#808000",
        "#ffd8b1",
        "#000075",
        "#808080",
        "#ffffff",
        "#000000",
    ];
    for (let i = 0; i < encodedRoutePolylineArray.length; i++) {
        markersPolylines.push(
            new google.maps.Polyline({
                path: google.maps.geometry.encoding.decodePath(
                    encodedRoutePolylineArray[i]
                ),
                strokeColor: colors[i],
                map: map,
            })
        );
        markersPolylines.push(
            new google.maps.marker.AdvancedMarkerView({
                position: routeLegsArray[i][0]["start_location"],
                // title: on hover
                content: new google.maps.marker.PinView({
                    scale: 1,
                    background: colors[i],
                    glyph: String.fromCharCode(65 + i),
                }).element,
                map: map,
            })
        );
        routeDirections +=
            `<br><br>${String.fromCharCode(65 + i)} (${routeStringSplit[
                i
            ].trim()}) -> ${String.fromCharCode(66 + i)} (${routeStringSplit[
                i + 1
            ].trim()})<br>${routeLegsArray[i][0]["distance"]["text"]} . About ${
                routeLegsArray[i][0]["duration"]["text"]
            } <br>` +
            routeLegsArray[i][0]["steps"]
                .map((step, index) => {
                    if (step["transit"]) {
                        markersPolylines.push(
                            new google.maps.marker.AdvancedMarkerView({
                                position:
                                    step["transit"]["departure_stop"][
                                        "location"
                                    ],
                                content: new google.maps.marker.PinView({
                                    scale: 0.5,
                                    background: colors[i],
                                    glyph: `${index + 1}. TD`,
                                }).element,
                                map: map,
                            })
                        );
                        markersPolylines.push(
                            new google.maps.marker.AdvancedMarkerView({
                                position:
                                    step["transit"]["arrival_stop"]["location"],
                                content: new google.maps.marker.PinView({
                                    scale: 0.5,
                                    background: colors[i],
                                    glyph: `${index + 1}. TA`,
                                }).element,
                                map: map,
                            })
                        );
                        return `${index + 1}. Take ${
                            step["transit"]["line"]["name"].length < 4 ||
                            step["transit"]["line"]["name"].includes(
                                "Sentosa"
                            ) ||
                            step["transit"]["line"]["name"].includes("Shuttle")
                                ? "BUS"
                                : "MRT"
                        } <b>${step["transit"]["line"]["name"]}</b>  ${
                            step["transit"]["departure_stop"]["name"]
                        } -> ${step["transit"]["arrival_stop"]["name"]} for ${
                            step["transit"]["num_stops"]
                        } ${step["transit"]["num_stops"] > 1 ? "stops" : "stop"}
                        ${step["distance"]["text"]}`;
                    }
                    return `${index + 1}. ${step["instructions"]} ${
                        step["distance"]["text"]
                    }`;
                })
                .join("<br>");
    }

    markersPolylines.push(
        new google.maps.marker.AdvancedMarkerView({
            position:
                routeLegsArray[routeLegsArray.length - 1][0]["end_location"],
            content: new google.maps.marker.PinView({
                scale: 1,
                background: colors[encodedRoutePolylineArray.length - 1],
                glyph: String.fromCharCode(
                    65 + encodedRoutePolylineArray.length
                ),
            }).element,
            map: map,
        })
    );
    document.querySelector("#directionsPanel").innerHTML += routeDirections;
}

function haversine_distance(pt1, pt2) {
    // Spherical trigonometry to determine the great circle distance between two points in km
    // pt1 is origin, pt2 is point of interest
    const R = 6371.071;
    const rlat1 = pt1.lat() * (Math.PI / 180);
    const rlat2 = pt2["lat"] * (Math.PI / 180);
    const difflat = rlat2 - rlat1;
    const difflon = (pt2["lng"] - pt1.lng()) * (Math.PI / 180);

    const distance =
        2 *
        R *
        Math.asin(
            Math.sqrt(
                Math.sin(difflat / 2) * Math.sin(difflat / 2) +
                    Math.cos(rlat1) *
                        Math.cos(rlat2) *
                        Math.sin(difflon / 2) *
                        Math.sin(difflon / 2)
            )
        );
    return distance.toFixed(2);
}

// To consider Additional Transit Options: https://developers.google.com/maps/documentation/javascript/directions#TransitOptions
// function checkTransportMode() {
//     const br = document.createElement("br");

//     const modes = document.createElement("select");
//     modes.setAttribute("id", "modes");
//     modes.setAttribute("multiple", "");
//     modes.setAttribute("size", "2");
//     modes.setAttribute("style", "width: 50%");

//     const busModeOption = document.createElement("option");
//     const trainModeOption = document.createElement("option");
//     busModeOption.innerText = "BUS";
//     trainModeOption.innerText = "TRAIN";
//     busModeOption.setAttribute("value", "BUS");
//     trainModeOption.setAttribute("value", "TRAIN");

//     if (
//         transportModeBox.value.toUpperCase() === "TRANSIT" &&
//         !document.querySelector("#modes")
//     ) {
//         modes.appendChild(busModeOption);
//         modes.appendChild(trainModeOption);
//         document
//             .querySelector("#optimizeRoute")
//             .insertAdjacentElement("beforebegin", modes);

//         let routingPreference = document.createElement("select");
//         routingPreference.setAttribute("id", "routingPreference");

//         // firstTo.replaceChild(input, addWaypointBtn);
//         // firstTo.appendChild(addWaypointBtn);
//     }
// }

function retrieveAllData() {
    // const data = [];
    // data.push(retrieveResearchedData());
    // data.push(retrieveBlueSGData());
    // data.push(retrieveOneMapData());
    const data = [
        {
            "Rent Bicycles": [
                {
                    name: "Coastline Leisure",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.3120099,
                        lng: 103.922606,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Coastline Leisure",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.30668,
                        lng: 103.935039,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "GoCycling",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.302569,
                        lng: 103.917722,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "GoCycling",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.314115,
                        lng: 103.960188,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "GoCycling",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.378455,
                        lng: 103.897158,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "AIRE MTB",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.352083,
                        lng: 103.819836,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "GoGreen",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.352083,
                        lng: 103.819836,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "GoCycling",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.355322,
                        lng: 103.988337,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "GoCycling",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.3730929,
                        lng: 104.0055299,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "GoCycling",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.391593,
                        lng: 103.989133,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Wheeelers",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.414844,
                        lng: 103.898768,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "GoCycling",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.419049,
                        lng: 103.910365,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "GoCycling",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.292309,
                        lng: 103.766107,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "GoCycling",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.374766,
                        lng: 103.9523509,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Cycling @ Punggol",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.401546,
                        lng: 103.890067,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "GoCycling",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.344416,
                        lng: 103.730542,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "GoCycling",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.289069,
                        lng: 103.862943,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Lifestyle Bike N Skate",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.302256,
                        lng: 103.907597,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Jomando Adventure and Recreation",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.420877,
                        lng: 103.912046,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Comfort Bicycle",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.4008529,
                        lng: 103.959671,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Bikes @ Waterway",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.40977,
                        lng: 103.904703,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Bicycle Hut",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.28983,
                        lng: 103.849601,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "City Scoot",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.28983,
                        lng: 103.849601,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "N.o. 25",
                    description: "Opening Hours: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.402671,
                        lng: 103.9702771,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
            ],
            "Sustainable Hotels": [
                {
                    name: "Marina Bay Sands",
                    description: "Sustainable Practices: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.282275,
                        lng: 103.858322,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Oasia Hotel",
                    description: "Sustainable Practices: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.275815,
                        lng: 103.844358,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Crowne Plaza",
                    description: "Sustainable Practices: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.358695,
                        lng: 103.987985,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Oasia Hotel",
                    description: "Sustainable Practices: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.320287,
                        lng: 103.845191,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Parkroyal",
                    description: "Sustainable Practices: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.290989,
                        lng: 103.857422,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Oasia Hotel",
                    description: "Sustainable Practices: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.253281,
                        lng: 103.819301,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "The Grand Hyatt",
                    description: "Sustainable Practices: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.3064309,
                        lng: 103.832783,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Lloyd's Inn",
                    description: "Sustainable Practices: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.297187,
                        lng: 103.840424,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Pan Pacific",
                    description: "Sustainable Practices: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.300011,
                        lng: 103.860309,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Pan Pacific",
                    description: "Sustainable Practices: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.292001,
                        lng: 103.858718,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Parkroyal",
                    description: "Sustainable Practices: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.285605,
                        lng: 103.8464,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Parkroyal",
                    description: "Sustainable Practices: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.299782,
                        lng: 103.860659,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Parkroyal",
                    description: "Sustainable Practices: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.310676,
                        lng: 103.855615,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "JW Mariott",
                    description: "Sustainable Practices: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.2946279,
                        lng: 103.855476,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
            ],
            "Shell Recharge/Greenlots (EV)": [
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.290006,
                        lng: 103.832466,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.34991,
                        lng: 103.738553,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.306348,
                        lng: 103.830876,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.304713,
                        lng: 103.823345,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.302959,
                        lng: 103.837188,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.33079,
                        lng: 103.799036,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.344118,
                        lng: 103.707646,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.348069,
                        lng: 103.838213,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.3357631,
                        lng: 103.7445445,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.317388,
                        lng: 103.653143,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.3066305,
                        lng: 103.7910604,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.289904,
                        lng: 103.80764,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.347388,
                        lng: 103.764873,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.323306,
                        lng: 103.817323,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.290607,
                        lng: 103.806854,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.33861,
                        lng: 103.7519329,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.270457,
                        lng: 103.812772,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.292095,
                        lng: 103.810034,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.330888,
                        lng: 103.748645,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
                {
                    name: "Shell Recharge/Greenlots (EV)",
                    description: "Availability: ",
                    type: "building",
                    url: "www.google.com",
                    address: {
                        lat: 1.3856949,
                        lng: 103.746266,
                    },
                    rating: "4.3",
                    reviews: "1000",
                    price: "$$",
                },
            ],
        },
    ];
    return data;
}

function retrieveBlueSGData() {
    // Retrieve from DB
}

// https://membership.bluesg.com.sg/stations/
// https://socket.dev/npm/package/bluesg-api, "npm i form-data", const FormData = require("form-data") in node_modules>bluesg-api>dist>index.js

// const BlueSGApi = require("bluesg-api");
async function saveBlueSGData() {
    const data = {};
    data["BlueSG (EV)"] = [];

    const token = await BlueSGApi.getToken();
    if (!token) {
        throw new Error("Unable to get token");
    }
    const stations = await BlueSGApi.getStations(token);
    if (!stations) {
        throw new Error("Unable to get station");
    }

    for (let i = 0; i < stations.length; i++) {
        data["BlueSG (EV)"][i] = {
            name: "BlueSG (EV)",
            description: `${stations[i]["capabilities"]
                .map((capability) => capability.toUpperCase())
                .join(" + ")} available`,
            type: "ev",
            url: "www.google.com",
            formatted_address: stations[i]["street"],
            address: {
                lat: stations[i]["latitude"],
                lng: stations[i]["longitude"],
            },
            rating: "4.3",
            reviews: "1000",
            price: "$$",
        };
    }

    // // For rental_status, cars_counter, charging_status, charge_slots,
    // const availabilities = await BlueSGApi.getAvailabilities(
    //     token,
    //     stations.slice(0, 10).map((station) => station["id"])
    // );

    // Save data to DB here
}

function retrieveResearchedData() {
    // Retrieve from DB
}

function saveResearchedData() {
    const data = {};
    // https://thesmartlocal.com/read/bicycle-rental-singapore/
    const bicycleRentals = {
        "Coastline Leisure": ["439174", "468960"],
        GoCycling: [
            "449893",
            "468965",
            "538768",
            "829170",
            "498991",
            "499676",
            "819643",
            "600353",
            "519500",
            "126784",
            "039803",
        ],
        "Lifestyle Bike N Skate": ["440080"],
        "Bikes @ Waterway": ["828851"],
        "Cycling @ Punggol": ["821233"],
        "Jomando Adventure and Recreation": ["828694"],
        Wheeelers: ["828670"],
        GoGreen: ["009901"],
        "N.o. 25": ["N.o. 25 Jalan Pekan Ubin"],
        "Comfort Bicycle": ["508273"],
        "Bicycle Hut": ["179094"],
        "City Scoot": ["179094"],
        "AIRE MTB": ["679525"],
    };

    // https://trip101.com/article/the-best-sustainable-and-green-hotels-in-singapore, https://www.visitsingapore.com/editorials/eco-friendly-hotels/
    const sustainableHotels = {
        "Crowne Plaza": ["819664"],
        "Lloyd's Inn": ["239091"],
        "The Grand Hyatt": ["228211"],
        "Oasia Hotel": ["079333", "307470", "098679"],
        "Pan Pacific": ["199592", "039595"],
        "Marina Bay Sands": ["018956"],
        "JW Mariott": ["189763"],
        Parkroyal: ["039594", "058289", "199591", "208533"],
    };

    // https://charge.greenlots.com/evowner/portal/locate-charger
    const shellRecharge = {
        "Shell Recharge/Greenlots (EV)": [
            "649960",
            "639577",
            "659166",
            "609607",
            "609961",
            "608829",
            "659760",
            "689717",
            "138588",
            "289629",
            "159950",
            "159941",
            "159936",
            "299551",
            "098857",
            "247933",
            "238869",
            "169637",
            "238855",
            "574326",
        ],
    };

    data["Rent Bicycles"] = searchData(bicycleRentals, {
        description: "Opening Hours: ",
        type: "bicycle",
        url: "www.google.com",
        formatted_address: "FORMATTED_ADDRESS",
        rating: "4.3",
        reviews: "1000",
        price_level: "$$",
    });
    data["Sustainable Hotels"] = searchData(sustainableHotels, {
        description: "Sustainable Practices: ",
        type: "hotel",
        url: "www.google.com",
        formatted_address: "FORMATTED_ADDRESS",
        rating: "4.3",
        reviews: "1000",
        price_level: "$$",
    });
    data["Shell Recharge/Greenlots (EV)"] = searchData(shellRecharge, {
        description: "Availability: ",
        type: "ev",
        url: "www.google.com",
        formatted_address: "FORMATTED_ADDRESS",
        rating: "4.3",
        reviews: "1000",
        price_level: "$$",
    });
    // Save data to DB here
}

function searchData(dataObject, content) {
    const data = [];
    const totalEntryCount = Object.values(dataObject).reduce(
        (total, current) => total + current.length,
        0
    );
    let currentEntryCount = 0;
    const geocoder = new google.maps.Geocoder();

    for (const [name, postalCodes] of Object.entries(dataObject)) {
        for (postalCode of postalCodes) {
            geocoder.geocode(
                {
                    address: postalCode,
                    componentRestrictions: {
                        country: "SG",
                    },
                    region: "SG",
                },
                function (results, status) {
                    if (status === "OK") {
                        let latlng = results[0]["geometry"]["location"]
                            .toString()
                            .replace("(", "")
                            .replace(")", "")
                            .split(", ");
                        data[currentEntryCount] = {
                            name: name,
                            description: content["description"],
                            type: content["type"],
                            url: content["url"],
                            formatted_address: content["formatted_address"],
                            address: {
                                lat: Number(latlng[0]),
                                lng: Number(latlng[1]),
                            },
                            rating: content["rating"],
                            reviews: content["reviews"],
                            price_level: content["price_level"],
                        };
                        currentEntryCount++;
                    } else {
                        console.log(
                            "Geocode was not successful due to: " + status
                        );
                    }
                }
            );
        }
    }

    return data;
}

function calculatePartialCarbonFootprint(routeSteps) {
    // https://www.bikeradar.com/features/long-reads/cycling-environmental-impact/, https://www.eco-business.com/news/singapores-mrt-lines-be-graded-green-ness/
    // Carbon footprint in kg CO2 equivalent per (passenger km)
    const carbonFootprintPer = {
        "Conventional Car": 0.271,
        "Electric Car": 0.09,
        Bus: 0.051,
        MRT: 0.013,
        "Conventional Bicycle": 0.021,
        "Electric Bicycle": 0.015,
        Walk: 0.056,
    };
    let carbonFootprintCount = 0;
    routeSteps.forEach((step) => {
        let mode = step["instructions"].split(" ");
        let travel_mode = step["travel_mode"];
        let stepMode =
            travel_mode === "DRIVING"
                ? "Conventional Car"
                : travel_mode === "BICYCLING"
                ? "Conventional Bicycle"
                : mode[0] === "Subway"
                ? "MRT"
                : mode[0] === "Bus"
                ? "Bus"
                : "Walk";
        carbonFootprintCount +=
            carbonFootprintPer[stepMode] * (step["distance"]["value"] / 1000);
    });
    console.log(carbonFootprintCount);
    return carbonFootprintCount;
}

function calculateTotalCarbonFootprint(request, carbonFootprintCount) {
    // Stats: ((distance without optimisation) - (distance with optimisation) ) x (rs between distance and carbon footprint depending on mode of transport)

    // "Optimize for less time", "Perhaps you'd like to expand your search radius and look for more sustainable options?"

    const from = request["origin"];
    const waypoints = request["waypoints"];
    const optimizeRoute = request["optimizeWaypoints"];
    const transportMode = request["travelMode"];

    let carbonFootprintString = `For ${transportMode}: ${carbonFootprintCount.toFixed(
        2
    )} kg CO2e/(passenger km)<br>`;
    const otherTravelModes = [
        "DRIVING",
        "TRANSIT",
        "WALKING",
        "BICYCLING",
    ].filter((mode) => mode !== transportMode);

    for (otherTravelMode of otherTravelModes) {
        carbonFootprintString += `For ${otherTravelMode}: `;
        let otherCarbonFootprintCount = 0;

        if (otherTravelMode === "TRANSIT") {
            if (waypoints.length > 1) {
                if (optimizeRoute) {
                    request = {
                        origin: from,
                        destination: waypoints[waypoints.length - 1],
                        waypoints: waypoints
                            .slice(0, waypoints.length)
                            .map((waypoint) => {
                                return {
                                    location: waypoint,
                                    stopover: true,
                                };
                            }),
                        travelMode: "DRIVING",
                        optimizeWaypoints: optimizeRoute,
                        unitSystem: google.maps.UnitSystem.METRIC,
                        region: "SG",
                    };
                    directionsService.route(request, function (result, status) {
                        if (status === "OK") {
                            const waypoints_copy = waypoints.slice();
                            result["routes"][0]["waypoint_order"].map(
                                (optimalOrder, index) => {
                                    waypoints[index] =
                                        waypoints_copy[optimalOrder];
                                }
                            );
                        }
                    });
                }

                setTimeout(() => {
                    waypoints.unshift(from);
                    for (let i = 0; i < waypoints.length - 1; i++) {
                        request = {
                            origin: waypoints[i],
                            destination: waypoints[i + 1],
                            travelMode: otherTravelMode,
                            optimizeWaypoints: optimizeRoute,
                            unitSystem: google.maps.UnitSystem.METRIC,
                            region: "SG",
                        };

                        directionsService.route(
                            request,
                            function (result, status) {
                                if (status === "OK") {
                                    otherCarbonFootprintCount +=
                                        calculatePartialCarbonFootprint(
                                            result["routes"][0]["legs"][0][
                                                "steps"
                                            ]
                                        );
                                    carbonFootprintString += `${otherCarbonFootprintCount.toFixed(
                                        2
                                    )} kg CO2e/(passenger km)<br>`;
                                }
                            }
                        );
                    }
                }, 500);
            } else {
                request = {
                    origin: from,
                    destination: waypoints[waypoints.length - 1],
                    waypoints: [],
                    travelMode: otherTravelMode,
                    optimizeWaypoints: optimizeRoute,
                    unitSystem: google.maps.UnitSystem.METRIC,
                    region: "SG",
                };
                directionsService.route(request, function (result, status) {
                    if (status === "OK") {
                        otherCarbonFootprintCount +=
                            calculatePartialCarbonFootprint(
                                result["routes"][0]["legs"][0]["steps"]
                            );
                        carbonFootprintString += `${otherCarbonFootprintCount.toFixed(
                            2
                        )} kg CO2e/(passenger km)<br>`;
                    }
                });
            }
        } else {
            request = {
                origin: from,
                destination: waypoints[waypoints.length - 1],
                waypoints: waypoints
                    .slice(0, waypoints.length)
                    .map((waypoint) => {
                        return {
                            location: waypoint,
                            stopover: true,
                        };
                    }),
                travelMode: otherTravelMode,
                optimizeWaypoints: optimizeRoute,
                unitSystem: google.maps.UnitSystem.METRIC,
                region: "SG",
            };
            directionsService.route(request, async function (result, status) {
                if (status === "OK") {
                    console.log("IN CARBON FOOTPRINT");
                    console.log(result["routes"][0]["legs"]);
                    setTimeout(() => {
                        otherCarbonFootprintCount +=
                            calculatePartialCarbonFootprint();
                        result["routes"][0]["legs"][0]["steps"];

                        carbonFootprintString += `${otherCarbonFootprintCount.toFixed(
                            2
                        )} kg CO2e/(passenger km)<br>`;
                    }, 500);
                }
            });
        }
        setTimeout(() => {
            compareCarbonFootprintPanel.innerHTML = carbonFootprintString;
        }, 500);
        // if (!optimizeRoute) {
        //     console.log(
        //         "With your non-optimized route, ... Optimize route now!"
        //     );
        // }
    }
}
