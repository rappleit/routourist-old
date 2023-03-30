// https://webninjadeveloper.com/javascript/javascript-google-directions-api-example-to-display-routes-between-two-locations-in-google-maps/
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
const statsPanel = document.querySelector("#statsPanel");

function initMap() {
    /**
     * Initializes the Google Map, adds event listener for click event,
     * initializes the DirectionsService and Autocomplete objects for the source and destination inputs, and initializes the PlacesService
     *
     * Note:
     * Map Styling: https://mapstyle.withgoogle.com/
     * For custom marker images, add {suppressMarkers:true}, https://thewebstorebyg.wordpress.com/2013/01/11/custom-directions-panel-with-google-maps-api-v3/
     */
    map = new google.maps.Map(document.querySelector("#map"), {
        center: {lat: 1.3521, lng: 103.8198},
        zoom: 12,
        mapId: "741626712eb9af1",
    });
    google.maps.event.addListener(map, "click", function (event) {
        this.setOptions({scrollwheel: true});
    });
    directionsService = new google.maps.DirectionsService();

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
    /**
     * Increases the number of waypoints, adds an input field for the new waypoint and sets up the corressponding autocomplete for the new input field
     */
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
    /**
     * Calculates a route based on the user's input, then calls retrieveRoute to retrieve and display the route on the map
     * @returns {void}
     *
     * Note: // Requests using more than 10 waypoints, or waypoint optimization, are billed at a higher rate
     */
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
    /**
     * Clears all markers and polylines from the map
     * @returns {void}
     */
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
    /**
     * Saves a route to the database
     * @param {string} userID - ID of user saving the route
     * @param {string} request - Request associated with the route being saved
     * @param {string} routeString - Route string to be saved to the database
     * @returns {void}
     *
     * Note: routeString is saved also, so as to fast display to user what's it's set to on SavedRoutes page. If no need, don't save since its regenerated in retrieveRoute anyway
     */
    const user = {
        userID: userID,
        request: request,
        routeString: routeString,
    };
    console.log(`Route saved!\n${user}`);
}

function retrieveRoute(user) {
    /**
     * Creates retrieves route from the database based on the user object, specific to a user
     * Retrieves the route using the Google Maps Directions API, and sets the directions on the map
     * It also displays the route string on the directions panel, and performs a nearby place search for places of interest based on the categories selected by the user and within the specified radius
     * It calculates the carbon footprint and duration of the trip, and displays the stats on the page
     *
     * As transit inherently does not allow for > 1 destination, and therefore no optimization of routes, the following implementation serves to solve the issue
     * However, resulting routes and directions are displayed as such since there is no way to insert and render it in the way of the directionsRenderer object
     *
     * @param {Object} user - An object containing information about the user, including their ID, selected categories, and radius, as well as the request object containing the origin, destination, waypoints, travel mode, and whether the route is optimized.
     * @returns {void}
     */

    // Retrieve from DB
    const from = user["request"]["origin"];
    const waypoints = user["request"]["waypoints"];
    const transportMode = user["request"]["travelMode"];
    const optimizeRoute = user["request"]["optimizeWaypoints"];

    const categoriesChecked = user["categoriesChecked"];
    const radius = user["radius"];
    const REQUEST = user["request"];
    let carbonFootprintCount = 0;
    let duration = 0;

    clearMap();
    const directionsRenderer = new google.maps.DirectionsRenderer();

    directionsRenderer.setMap(map);
    // Textual display of directions
    directionsRenderer.setPanel(directionsPanel);
    markersPolylines.push(directionsRenderer);

    if (transportMode === "TRANSIT") {
        let routeString = `Route for ${transportMode}: <br>`;

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
                            routeLegsArray[i] = result["routes"][0]["legs"];
                        } else {
                            directionsPanel.innerHTML = `<h1>${request["origin"]} -> ${request["destination"]} failed with a status of ${status}</h1>`;
                        }
                    });

                    let to = waypoints[i];
                    routeString += formatRouteString(to);
                    if (i === waypoints.length - 2) {
                        to = waypoints[i + 1];
                        routeString += formatRouteString(to);
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
                    const partialData = calculatePartialStats(
                        routeLegsArray,
                        transportMode
                    );
                    carbonFootprintCount += partialData[0];
                    duration += partialData[1];
                    calculateStats(REQUEST, carbonFootprintCount, duration);

                    // saveRoute(user["userID"], user["request"], routeString);
                }, 750);
            }, 750);
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
                    const to = request["destination"];
                    const toString = formatRouteString(to);
                    routeString +=
                        formatRouteString(from) +
                        toString.substring(0, toString.length - 4);

                    directionsPanel.innerHTML = `<h1>${routeString}</h1>`;
                    nearbyPlaceSearch(
                        getLat_LngArray(result),
                        categoriesChecked,
                        radius
                    );
                    const partialData = calculatePartialStats(
                        result["routes"][0]["legs"],
                        transportMode
                    );
                    carbonFootprintCount += partialData[0];
                    duration += partialData[1];
                    calculateStats(REQUEST, carbonFootprintCount, duration);

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
                    `Route for ${transportMode}: <br>` +
                    createRouteString(result, waypoints);

                directionsPanel.innerHTML = `<h1>${routeString}</h1>`;

                nearbyPlaceSearch(
                    getLat_LngArray(result),
                    categoriesChecked,
                    radius
                );
                const partialData = calculatePartialStats(
                    result["routes"][0]["legs"],
                    transportMode
                );
                carbonFootprintCount += partialData[0];
                duration += partialData[1];
                calculateStats(REQUEST, carbonFootprintCount, duration);

                // saveRoute(user["userID"], user["request"], routeString);
            } else {
                directionsPanel.innerHTML = `<h1>${status}</h1>`;
            }
        });
    }
}

function createMarker(details) {
    /**
     * Creates advanced marker on the map
     * @param {object} details - Details of the marker to be created
     * @param {google.maps.LatLngLiteral} details.position - Position of the marker on the map
     * @param {string} details.title - Title of the marker
     * @param {HTMLElement} details.content - HTML content of the marker
     * @param {google.maps.Map} map - Map on which to place the marker
     * @returns {void}
     *
     * Note: background: result[i]["icon_background_color"]
     *       glyph: new URL(`${result[i]["icon_mask_base_uri"]}.png`)
     *       May configure collisionBehaviour + zoomBehaviour
     */

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
    /**
     * Creates HTML content for a marker, displaying the name, address, rating, user ratings total, and price level of the associated place
     * @param {Object} property - Object containing the properties of the place to be displayed
     * @param {string} property.type - Type of the place
     * @param {string} property.name - Name of the place
     * @param {string} [property.formatted_address] - Formatted address of the place
     * @param {number} property.rating - Rating of the place
     * @param {number} property.user_ratings_total - Total number of user ratings of the place
     * @param {number} [property.price_level] - Price level of the place (from 1 to 4)
     * @returns {Element} - Div element containing the HTML content for the marker
     *
     * References: https://developers.google.com/maps/documentation/javascript/advanced-markers/html-markers#maps_advanced_markers_html-javascript, https://fontawesome.com/search
     */
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
    /**
     * Highlights a marker by adding the 'highlight' class to its content element and setting its z-index to 1
     * @param {object} markerView - The marker to highlight
     */
    markerView.content.classList.add("highlight");
    markerView.element.style.zIndex = 1;
}

function unhighlight(markerView) {
    /**
     * Removes the highlight from marker by removing the 'highlight' class from its content element and resetting its z-index to the default value
     * @param {object} markerView - The marker to unhighlight
     */
    markerView.content.classList.remove("highlight");
    markerView.element.style.zIndex = "";
}

function getLat_LngArray(result) {
    /**
     * Returns array of latitudes and longitudes from the given Google Maps Directions API result object
     * @param {Object} result - Result object returned by the Google Maps Directions API
     * @returns {Array} Array of latitudes and longitudes from the result object
     *
     * Eg. i % 100 takes every 100th lat_lng from each step, from each leg, from each route
     */

    const lat_lngArray = result["routes"]
        .map((route) =>
            route["legs"].map((leg) =>
                leg["steps"].map((step) =>
                    step["lat_lngs"].filter((info, i) => i % 100 === 0)
                )
            )
        )
        .flat(3);
    return lat_lngArray;
}

function nearbyPlaceSearch(lat_lngArray, categoriesChecked, radius) {
    /**
     * Searches for nearby places based on the given latitude-longitude pairs and categories
     * @param {Array} lat_lngArray - Array of latitude-longitude pairs to search
     * @param {Array} categoriesChecked - Array of categories to search for
     * @param {Number} radius - Radius (in kilometers) around each latitude-longitude pair to search within
     * @returns {void}
     */
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
    /**
     * Searches for nearby Google Places of the specified type along the given route
     * @param {Object} result - The result object returned by the Directions API
     *
     * References: https://developers.google.com/maps/documentation/javascript/supported_types
     * Useful types: amusement_park, bicycle_store, cafe, clothing_store, gym, lodging, movie_theater, museum, night_club, park, restaurant, shopping_mall, spa, tourist_attraction, zoo
     */
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
    /**
     * Generates a string representation of a route based on the provided result and waypoints
     * @param {object} result - Result object from a Google Maps Directions API request
     * @param {string[]} waypoints - Array of string waypoints in the route
     * @returns {string} String representation of the route
     */

    const from = result["routes"][0]["legs"][0]["start_address"];
    // Formatting name
    let routeString = formatRouteString(from);

    // Eg. From 0>2>3>1, routeArray = location @ 0>...
    const routeArray = result["routes"][0]["waypoint_order"].map((i) => {
        let destination = waypoints[i];

        destination = formatRouteString(destination);
        return destination;
    });
    for (loc of routeArray.splice(0, routeArray.length - 1)) {
        routeString += loc + " -> ";
    }
    routeString += routeArray[routeArray.length - 1];
    return routeString;
}

function formatRouteString(locationName) {
    /**
     * Generates the correct, readable string representation of the location name
     * @param {string} locationName - locationName
     * @returns {string} Formatted representation of the location name
     */
    const locationNameSplit = locationName.split(",");
    return `${
        locationNameSplit.length > 2
            ? locationNameSplit[1].length > 4
                ? // if word more than 4 letters, takes word
                  locationNameSplit[1]
                : // Else takes Postal Code
                  // Eg. Suntec City became 3 Temasek Blvd, #1, #327-328, Singapore 038983
                  locationNameSplit[locationNameSplit.length - 1]
            : locationNameSplit[0]
    } -> `;
}

function drawTransitRoute(
    encodedRoutePolylineArray,
    routeLegsArray,
    routeString
) {
    /**
     * Draws transit route on the Google Map and displays the route directions in the directionsPanel
     * @param {Array} encodedRoutePolylineArray - Array of encoded polylines representing the route segments
     * @param {Array} routeLegsArray - Array of objects representing the legs of the route
     * @param {string} routeString - A string representing the route directions
     */
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
    /**
     * Calculates the great circle distance between two points using spherical trigonometry
     * @param {Object} pt1 - Coordinates of the origin point as an object with 'lat' and 'lng' properties/functions
     * @param {Object} pt2 - Coordinates of the point of interest as an object with 'lat' and 'lng' properties
     * @returns {number} Distance between the two points rounded to two decimal places, in kilometers
     */
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
    const data = [];
    return data;
}

function retrieveBlueSGData() {
    // Retrieve from DB
}

// const BlueSGApi = require("bluesg-api");
async function saveBlueSGData() {
    /**
     * Saves BlueSG station data to a database
     * @async
     * @function saveBlueSGData
     * @throws {Error} If unable to get a token or stations data
     * @returns {void} Saves data to DB
     *
     * References: https://membership.bluesg.com.sg/stations/, https://socket.dev/npm/package/bluesg-api
     * Guide: "npm i form-data", const FormData = require("form-data") in node_modules>bluesg-api>dist>index.js
     */
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
    /**
     * Saves self-researched data on bicycle rentals, sustainable hotels, and electric vehicle stations to a data object
     * @returns {Object} The data object containing researched data on bicycle rentals, sustainable hotels, and electric vehicle stations
     */

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
    /**
     * Searches for location data based on postal codes in a given data object
     * @param {Object} dataObject - Object containing location data, where each key is the location name and the value is an array of postal codes for that location
     * @param {Object} content - Object containing additional information about the location
     * @returns {Array} Array of location data objects, where each object contains information about the location, such as name, address, type, URL, rating, reviews, and price level
     */

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

function calculatePartialStats(routeLegsArray, transportMode) {
    /**
     *Calculates the carbon footprint and duration of a given route
     *@param {Array} routeLegsArray Array of objects representing the legs of the route
     *@param {string} transportMode A string representing the mode of transport for the route
     *@returns {Array} Array containing the total carbon footprint (in kg CO2 equivalent) and the duration (in seconds) of the route
     *
     *References: https://www.bikeradar.com/features/long-reads/cycling-environmental-impact/, https://www.eco-business.com/news/singapores-mrt-lines-be-graded-green-ness/
     */

    // Carbon footprint in kg CO2 equivalent per (passenger km)
    const carbonFootprintBase = {
        "Conventional Car": 0.271,
        "Electric Car": 0.09,
        Bus: 0.051,
        MRT: 0.013,
        "Conventional Bicycle": 0.021,
        "Electric Bicycle": 0.015,
        Walk: 0.056,
    };
    let carbonFootprintCount = 0;
    let duration = 0;

    if (transportMode === "TRANSIT") {
        if (routeLegsArray.length > 1) {
            routeLegsArray = routeLegsArray.map((leg) => leg[0]);
        }

        duration += routeLegsArray
            .map((leg) => leg["duration"]["value"])
            .reduce((total, current) => total + current, 0);

        routeLegsArray
            .map((leg) => leg["steps"])
            .forEach((routeStep) => {
                routeStep.forEach((step) => {
                    let mode = step["instructions"]
                        ? step["instructions"].split(" ")[0]
                        : "Walk";

                    const stepMode =
                        mode === "Subway" || mode === "Tram"
                            ? "MRT"
                            : mode === "Bus"
                            ? "Bus"
                            : "Walk";
                    carbonFootprintCount +=
                        carbonFootprintBase[stepMode] *
                        (step["distance"]["value"] / 1000);
                });
            });
    } else {
        duration += routeLegsArray
            .map((leg) => leg["duration"]["value"])
            .reduce((total, current) => total + current, 0);
        const routeDistance = routeLegsArray
            .map((leg) => leg["distance"]["value"])
            .reduce((total, current) => total + current, 0);
        const stepMode =
            transportMode === "DRIVING"
                ? "Conventional Car"
                : transportMode === "BICYCLING"
                ? "Conventional Bicycle"
                : "Walk";
        carbonFootprintCount +=
            carbonFootprintBase[stepMode] * (routeDistance / 1000);
    }

    // console.log(`${transportMode}: ${carbonFootprintCount}, ${secondsToHms(duration)}`);
    return [carbonFootprintCount, duration];
}

function calculateStats(request, carbonFootprintCount, duration) {
    /**
     * Calculates carbon footprint and duration for a given travel request and mode of transport
     * @param {object} request - Travel request object containing origin, waypoints, optimizeWaypoints, and travelMode properties
     * @param {number} carbonFootprintCount - Total carbon footprint in kg CO2 equivalent emitted for the given travel request
     * @param {number} duration - Total duration for the given travel request, in seconds
     * @returns {void} Does not return anything, but updates the statsPanel with comparison data between the given travel request's transport mode and all other modes of transport
     *
     * Intention: Carbon footprint depending on mode of transport and their cumulative distance + Time as a tradeoff to make informed decisions
     */

    const from = request["origin"];
    const waypoints = request["waypoints"];
    const optimizeRoute = request["optimizeWaypoints"];
    const transportMode = request["travelMode"];

    const outputStringArray = [];
    outputStringArray[0] = `Through your ${transportMode} journey, ${carbonFootprintCount.toFixed(
        2
    )} kg CO2e is emitted, taking ${secondsToHms(duration)}<br>`;
    const otherTravelModes = [
        "DRIVING",
        "TRANSIT",
        "WALKING",
        "BICYCLING",
    ].filter((mode) => mode !== transportMode);

    for (let i = 0; i < otherTravelModes.length; i++) {
        let otherDuration = 0;
        let otherCarbonFootprintCount = 0;
        outputStringArray[i + 1] = `${otherTravelModes[i]} `;

        if (otherTravelModes[i] === "TRANSIT") {
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
                    const routeLegsArray = [];
                    for (let j = 0; j < waypoints.length - 1; j++) {
                        request = {
                            origin: waypoints[j],
                            destination: waypoints[j + 1],
                            travelMode: "TRANSIT",
                            optimizeWaypoints: optimizeRoute,
                            unitSystem: google.maps.UnitSystem.METRIC,
                            region: "SG",
                        };

                        directionsService.route(
                            request,
                            function (result, status) {
                                if (status === "OK") {
                                    routeLegsArray[j] =
                                        result["routes"][0]["legs"];
                                }
                            }
                        );
                    }
                    setTimeout(() => {
                        const partialData = calculatePartialStats(
                            routeLegsArray,
                            "TRANSIT"
                        );
                        otherCarbonFootprintCount += partialData[0];
                        otherDuration += partialData[1];
                        outputStringArray[i + 1] = compareStats(
                            carbonFootprintCount,
                            otherCarbonFootprintCount,
                            duration,
                            otherDuration,
                            outputStringArray[i + 1]
                        );
                    }, 750);
                }, 750);
            } else {
                request = {
                    origin: from,
                    destination: waypoints[waypoints.length - 1],
                    waypoints: [],
                    travelMode: otherTravelModes[i],
                    optimizeWaypoints: optimizeRoute,
                    unitSystem: google.maps.UnitSystem.METRIC,
                    region: "SG",
                };
                directionsService.route(request, function (result, status) {
                    if (status === "OK") {
                        const partialData = calculatePartialStats(
                            result["routes"][0]["legs"],
                            otherTravelModes[i]
                        );
                        otherCarbonFootprintCount += partialData[0];
                        otherDuration += partialData[1];
                        outputStringArray[i + 1] = compareStats(
                            carbonFootprintCount,
                            otherCarbonFootprintCount,
                            duration,
                            otherDuration,
                            outputStringArray[i + 1]
                        );
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
                travelMode: otherTravelModes[i],
                optimizeWaypoints: optimizeRoute,
                unitSystem: google.maps.UnitSystem.METRIC,
                region: "SG",
            };
            directionsService.route(request, async function (result, status) {
                if (status === "OK") {
                    const partialData = calculatePartialStats(
                        result["routes"][0]["legs"],
                        otherTravelModes[i]
                    );
                    otherCarbonFootprintCount += partialData[0];
                    otherDuration += partialData[1];
                    outputStringArray[i + 1] = compareStats(
                        carbonFootprintCount,
                        otherCarbonFootprintCount,
                        duration,
                        otherDuration,
                        outputStringArray[i + 1]
                    );
                }
            });
        }
        setTimeout(() => {
            statsPanel.innerHTML = outputStringArray.join("");
            if (!optimizeRoute) {
                statsPanel.innerHTML += `<br>Optimize your route now for greater efficiency!<br> Or perhaps you'd like to expand your search radius and look for more sustainable options?`;
            }
        }, 2200);
    }
}

function compareStats(
    carbonFootprintCount,
    otherCarbonFootprintCount,
    duration,
    otherDuration,
    outputString
) {
    /**
     *Compares statistics (carbon footprint and duration of journey) of user's inputted mode of transport with all other modes of transport
     *indicating the percentage difference in emissions and the difference in time.
     *@param {number} carbonFootprintCount - Carbon footprint count to compare with
     *@param {number} otherCarbonFootprintCount - Other carbon footprint count to compare with
     *@param {number} duration - duration to compare with
     *@param {number} otherDuration - Other duration to compare with
     *@param {string} outputString - Output string to append the comparison results
     *@returns {string} Output string indicating the percentage difference in carbon footprint and the difference in time of journey
     */
    if (otherCarbonFootprintCount > carbonFootprintCount) {
        const percentDiff = (
            ((otherCarbonFootprintCount - carbonFootprintCount) /
                carbonFootprintCount) *
            100
        ).toFixed(0);
        outputString += `⬆️ ${percentDiff}% emissions, `;
    } else {
        const percentDiff = (
            ((carbonFootprintCount - otherCarbonFootprintCount) /
                carbonFootprintCount) *
            100
        ).toFixed(0);
        outputString += `⬇️${percentDiff}% emissions, `;
    }

    if (duration > otherDuration) {
        const timeDiff = secondsToHms(duration - otherDuration);
        outputString += `⬇️ ${timeDiff}<br>`;
    } else {
        const timeDiff = secondsToHms(otherDuration - duration);
        outputString += `⬆️${timeDiff}<br>`;
    }
    return outputString;
}

function secondsToHms(d) {
    /**
     *Converts seconds into hours, minutes, seconds format
     *@param {number} d - Seconds to convert
     *@returns {string} Converted time in the specified hours, minutes, seconds format
     */
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);
    var s = Math.floor((d % 3600) % 60);
    // Initial: 5 hours, 16 minutes, 41 seconds
    var hDisplay = h > 0 ? h + (h == 1 ? " hr " : " hrs ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " min " : " mins ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " s" : " s") : "";
    return hDisplay + mDisplay;
}
