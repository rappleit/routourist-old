import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import Link from 'next/link';
<<<<<<< HEAD
=======
import { useAuthContext } from '@/hooks/useAuthContext';
import { useLogout } from '@/hooks/useLogout';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import ReactDOM from 'react-dom';

>>>>>>> af939e4bbf7eecc5c25b30c4563c008c2ee7adee

export default function Map() {
    const { user } = useAuthContext()
    const { logout } = useLogout()

    const autoCompleteOptions = {
        componentRestrictions: { country: "sg" },
    };

    const [gmap, setGMap] = useState(null)
    const [gdirectionsService, setGDirectionsService] = useState(null)
    const [gplacesSearch, setGPlacesSearch] = useState(null)
    const [gdestAutoComplete, setGDestAutoComplete] = useState(null)
    const [markersPolylines, setMarkersPolylines] = useState([])
    const [lat_lngArray, setLat_LngArray] = useState([])
    
    const [isAttractionsDropdownOpen, setIsAttractionsDropdownOpen] = useState(false)

    const [waypointsNum, setWaypointsNum] = useState(2)

    const handleLogout = (e) => {
        e.preventDefault();
        logout()
    }

    const handleAttractionsDropdown = (e) => {
        e.preventDefault();
        setIsAttractionsDropdownOpen(!isAttractionsDropdownOpen)
    }

    const addWaypoint = (e) => {
        e.preventDefault();
        if (waypointsNum < 10) {
            setWaypointsNum(waypointsNum + 1)
        }

        /*const waypointsList = document.querySelector("#waypointsList")
        const inputDiv = document.createElement("div")
        inputDiv.setAttributeNS(null, "className", "flex")
        waypointsList.appendChild(inputDiv)
        const inputField = document.createElement("input")
        inputField.setAttributeNS(null, "className", "toRef px-3 py-1 border-1 w-11/12 rounded-md")
        inputField.setAttribute("placeholder", "To where?")
        inputDiv.appendChild(inputField)*/



    }

    useEffect(() => {
        if (waypointsNum > 2) {
            const allDestInputs = document.querySelectorAll("input.toRef");
            for (var j = 0; j < allDestInputs.length; j++) {
                const newDestAutoComplete = new google.maps.places.Autocomplete(
                    (allDestInputs[j]), autoCompleteOptions);
            }
        }
    }, [waypointsNum])

    const createRouteString = (result, waypoints) => {
        const from = result["routes"][0]["legs"][0]["start_address"];
        const fromSplit = from.split(",");
        // Formatting name
        let routeString = `${fromSplit.length > 2
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
        for (let loc of routeArray.splice(0, routeArray.length - 1)) {
            routeString += loc + " -> ";
        }
        routeString += routeArray[routeArray.length - 1];
        return routeString;
    }

    const calculatePartialStats = (routeLegsArray, transportMode) => {
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

        return [carbonFootprintCount, duration];
    }

    const calculateStats = (request, carbonFootprintCount, duration) => {
        const statsPanel = document.querySelector("#statsPanel");

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
                        const request = {
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
                        gdirectionsService.route(request, function (result, status) {
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
                            const request = {
                                origin: waypoints[j],
                                destination: waypoints[j + 1],
                                travelMode: "TRANSIT",
                                optimizeWaypoints: optimizeRoute,
                                unitSystem: google.maps.UnitSystem.METRIC,
                                region: "SG",
                            };

                            gdirectionsService.route(
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
                        }, 800);
                    }, 800);
                } else {
                    const request = {
                        origin: from,
                        destination: waypoints[waypoints.length - 1],
                        waypoints: [],
                        travelMode: otherTravelModes[i],
                        optimizeWaypoints: optimizeRoute,
                        unitSystem: google.maps.UnitSystem.METRIC,
                        region: "SG",
                    };
                    gdirectionsService.route(request, function (result, status) {
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
                const request = {
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
                gdirectionsService.route(request, async function (result, status) {
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
                statsPanel.innerHTML = `<p>${outputStringArray.join("")}</p>`
                if (!optimizeRoute) {
                    statsPanel.innerHTML += `<p><br>Optimize your route now for greater efficiency!`;
                }
            }, 1500);
        }
    }

    const secondsToHms = (d) => {
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

    const compareStats = (
        carbonFootprintCount,
        otherCarbonFootprintCount,
        duration,
        otherDuration,
        outputString) => {
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

    const drawTransitRoute = (
        encodedRoutePolylineArray,
        routeLegsArray,
        routeString) => {
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
                    map: gmap,
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
                    map: gmap,
                })
            );
            routeDirections +=
                `<br><br>${String.fromCharCode(65 + i)} (${routeStringSplit[
                    i
                ].trim()}) -> ${String.fromCharCode(66 + i)} (${routeStringSplit[
                    i + 1
                ].trim()})<br>${routeLegsArray[i][0]["distance"]["text"]} . About ${routeLegsArray[i][0]["duration"]["text"]
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
                                    map: gmap,
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
                                    map: gmap,
                                })
                            );
                            return `${index + 1}. Take ${step["transit"]["line"]["name"].length < 4 ||
                                step["transit"]["line"]["name"].includes(
                                    "Sentosa"
                                ) ||
                                step["transit"]["line"]["name"].includes("Shuttle")
                                ? "BUS"
                                : "MRT"
                                } <b>${step["transit"]["line"]["name"]}</b>  ${step["transit"]["departure_stop"]["name"]
                                } -> ${step["transit"]["arrival_stop"]["name"]} for ${step["transit"]["num_stops"]
                                } ${step["transit"]["num_stops"] > 1 ? "stops" : "stop"}
                    ${step["distance"]["text"]}`;
                        }
                        return `${index + 1}. ${step["instructions"]} ${step["distance"]["text"]
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
                map: gmap,
            })
        );
        document.querySelector("#directionsPanel").innerHTML += routeDirections;
    }

    const getLat_LngArray = (result) => {
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

    const retrieveRoute = (route) => {
        // Retrieve info from route object
        const from = route["request"]["origin"];
        const waypoints = route["request"]["waypoints"];
        const transportMode = route["request"]["travelMode"];
        const optimizeRoute = route["request"]["optimizeWaypoints"];

        const categoriesChecked = route["categoriesChecked"];
        const radius = route["radius"];
        const REQUEST = route["request"];

        let carbonFootprintCount = 0;
        let duration = 0;

        const directionsOverview = document.querySelector("#directionsOverview")
        const directionsPanel = document.querySelector("#directionsPanel");
        const directionsRenderer = new google.maps.DirectionsRenderer();

        directionsRenderer.setMap(gmap);
        // Textual display of directions
        directionsRenderer.setPanel(directionsPanel);
        markersPolylines.push(directionsRenderer);

        if (transportMode === "TRANSIT") {
            let routeString = `Route for ${transportMode}: <br>`;

            if (waypoints.length > 1) {
                if (optimizeRoute) {
                    // If TRANSIT & >2 & optimize
                    // ∴ Uses driving (roads, ∴ Mostly accurate to buses only) & distance(?) to optimize order first
                    const request = {
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
                    gdirectionsService.route(request, function (result, status) {
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
                        const request = {
                            origin: waypoints[i],
                            destination: waypoints[i + 1],
                            travelMode: transportMode,
                            optimizeWaypoints: optimizeRoute,
                            unitSystem: google.maps.UnitSystem.METRIC,
                            region: "SG",
                        };

                        gdirectionsService.route(request, function (result, status) {
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
                        let toSplit = to.split(",");
                        routeString += `${toSplit.length > 2 ? toSplit[1] : to
                            } -> `;
                        if (i === waypoints.length - 2) {
                            to = waypoints[i + 1];
                            toSplit = to.split(",");
                            routeString += toSplit.length > 2 ? toSplit[1] : to;
                        }
                    }

                    // ASYNC directionsService request
                    setTimeout(() => {
                        directionsOverview.innerHTML = `${routeString}`;
                        directionsPanel.innerHTML = `<h1>${routeString}</h1>`;
                        drawTransitRoute(
                            encodedRoutePolylineArray,
                            routeLegsArray,
                            routeString
                        );

                        const latlngArray = routeLegsArray
                            .map((leg) =>
                                leg[0]["steps"].map((step) =>
                                    step["lat_lngs"].filter(
                                        (info, i) => i % 100 === 0
                                    )
                                )
                            )
                            .flat(2);

                        setLat_LngArray(latlngArray);

                        const partialData = calculatePartialStats(
                            routeLegsArray,
                            transportMode
                        );
                        carbonFootprintCount += partialData[0];
                        duration += partialData[1];
                        calculateStats(REQUEST, carbonFootprintCount, duration);

                    }, 800);
                }, 800);
                // If TRANSIT & =2
            } else {
                const request = {
                    origin: from,
                    destination: waypoints[waypoints.length - 1],
                    waypoints: [],
                    travelMode: transportMode,
                    optimizeWaypoints: optimizeRoute,
                    unitSystem: google.maps.UnitSystem.METRIC,
                    region: "SG",
                };
                gdirectionsService.route(request, function (result, status) {
                    if (status === "OK") {
                        directionsRenderer.setDirections(result);
                        const fromSplit = from.split(",");
                        const to = request["destination"];
                        const toSplit = to.split(",");
                        routeString +=
                            (fromSplit.length > 2 ? fromSplit[1] : from) +
                            " -> " +
                            (toSplit.length > 2 ? toSplit[1] : to);
                        directionsOverview.innerHTML = `${routeString}`;
                        directionsPanel.innerHTML = `<h1>${routeString}</h1>`;

                        setLat_LngArray(getLat_LngArray(result));
                        const partialData = calculatePartialStats(
                            result["routes"][0]["legs"],
                            transportMode
                        );
                        carbonFootprintCount += partialData[0];
                        duration += partialData[1];
                        calculateStats(REQUEST, carbonFootprintCount, duration);

                    } else {
                        directionsPanel.innerHTML = `<h1>${status}</h1>`;
                    }
                });
            }
            // If DRIVING/WALKING/BICYCLING
        } else {
            const request = {
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
            gdirectionsService.route(request, async function (result, status) {
                if (status === "OK") {
                    directionsRenderer.setDirections(result);
                    let routeString =
                        `Route for ${transportMode}: <br>` +
                        createRouteString(result, waypoints);

                    directionsOverview.innerHTML = `${routeString}`;
                    directionsPanel.innerHTML = `<h1>${routeString}</h1>`;

                    setLat_LngArray(getLat_LngArray(result));
                    const partialData = calculatePartialStats(
                        result["routes"][0]["legs"],
                        transportMode
                    );
                    carbonFootprintCount += partialData[0];
                    duration += partialData[1];
                    calculateStats(REQUEST, carbonFootprintCount, duration);

                } else {
                    directionsPanel.innerHTML = `<h1>${status}</h1>`;
                }
            });
        }

    }

    const calcRoute = (e) => {
        e.preventDefault();
        const from = document.querySelector("#fromRef").value;
        const waypoints = Array.from(document.querySelectorAll("input.toRef")).map(
            (waypoint) => waypoint.value
        );

        const transportModeMenu = document.querySelector("#transportModeMenuRef")
        const transportMode = transportModeMenu.value.toUpperCase();
        const optimizeRoute = document.querySelector("#optimizeRouteRef").checked;
        const categoriesChecked = []
        const radius = 1
        const currentRoute = {
            routeName: "",
            request: {
                origin: from,
                destination: waypoints[waypoints.length - 1],
                waypoints: waypoints,
                travelMode: transportMode,
                optimizeWaypoints: optimizeRoute,
            },
        };
        retrieveRoute(currentRoute);
    }

    if (typeof window != "undefined") {
        window.initMap = () => {
            const map = new google.maps.Map(document.querySelector("#map"), {
                center: { lat: 1.3521, lng: 103.8198 },
                zoom: 12,
                mapId: "741626712eb9af1",
            });
            google.maps.event.addListener(map, "click", function (event) {
                this.setOptions({ scrollwheel: true });
            });
            const directionsService = new google.maps.DirectionsService();
            // For custom marker images, add {suppressMarkers:true}, https://thewebstorebyg.wordpress.com/2013/01/11/custom-directions-panel-with-google-maps-api-v3/

            const sourceAutocomplete = new google.maps.places.Autocomplete(
                document.querySelector("#fromRef"),
                autoCompleteOptions
            );
            const destAutocomplete = new google.maps.places.Autocomplete(
                document.querySelector(".toRef"),
                autoCompleteOptions
            );
            const placesSearch = new google.maps.places.PlacesService(map);
            //const allData = retrieveAllData();

            setGMap(map)
            setGDirectionsService(directionsService)
            setGPlacesSearch(placesSearch)
            setGDestAutoComplete(destAutocomplete)
        }
    }



    return (
        <>
            <Helmet>
                <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBthJKxacm0pSrgo2yEEM_BUjmIryn8VOI&libraries=places,geometry,marker&v=beta&callback=initMap" async defer></script>
            </Helmet>
            <div className="bg-eggshell w-screen h-screen flex justify-between relative" >
                <div id="map" className="z-1 fixed h-screen w-screen"></div>
                <div className="bg-gray z-99 h-screen w-1/4 place-self-start fixed">
                    <div className='mx-3 h-full flex flex-col '>
                        <div className='basis-1/12 flex items-baseline justify-between'> {/* title */}
                            <h1 className='font-titleFont font-bold text-eggshell text-2xl mt-4'>Routourist</h1>
                            <KeyboardDoubleArrowLeftIcon className='text-eggshell text-3xl cursor-pointer' />
                        </div>

                        <form className='basis-7/12 mt-2 flex flex-col justify-evenly'>
                            <div id="waypointsList" className='font-bodyfont flex flex-col h-24 gap-2 overflow-auto'> {/* this is for the inputs */}
                                <div className='flex'>
                                    <input id="fromRef" placeholder='From where?' className='px-3 py-1 border-1 w-11/12 rounded-md' type="text"></input>
                                    <MoreVertIcon className='text-eggshell text-3xl' />
                                </div>
                                <div className='flex'>
                                    <input placeholder='To where?' className='toRef px-3 py-1 border-1 w-11/12 rounded-md' type="text"></input>
                                    <MoreVertIcon className='text-eggshell text-3xl' />
                                </div>
                                {
                                    [...Array(waypointsNum - 2)].map((wp, i) => (
                                        <div className='flex' key={i}>
                                            <input placeholder='To where?' className='toRef px-3 py-1 border-1 w-11/12 rounded-md' type="text" />
                                            <MoreVertIcon className='text-eggshell text-3xl' />
                                        </div>
                                    ))
                                }

                            </div>

                            <div className='flex justify-center'> {/* this is for the add */}
                                <div>
                                    <button onClick={(e) => addWaypoint(e)}><AddCircleOutlineIcon className='text-eggshell text-3xl cursor-pointer' /></button>
                                </div>

                            </div>

                            <div className='font-bodyfont'>
                                <select id="transportModeMenuRef" name="ModeTransport" className='bg-gray text-eggshell w-11/12 font-bodyfont border-2 border-eggshell rounded-md px-3 py-1'>
                                    <option value="Driving">Driving</option>
                                    <option value="Transit">Transit</option>
                                    <option value="Walking">Walk</option>
                                    <option value="Bicycling">Cycling</option>
                                </select>
                            </div>

<<<<<<< HEAD
                    <div className='basis-1/12 flex place-content-center'> {/* my saved routes button */}
                        <Link href="/savedroutes"><button className='font-bodyfont w-fit h-fit px-10 py-2.5  bg-eggshell rounded-lg drop-shadow-2xl'>My Saved Routes</button></Link>
=======
                            <div> {/* checkbox */}
                                <input id="optimizeRouteRef" type="checkbox" name='OptimiseChoice' value="OptimiseChoice"></input>
                                <label for='OptimiseChoice' className='text-eggshell font-bodyfont ml-3'>Optimise Route</label>
                                <p className='text-eggshell font-bodyfont text-xs'>You can reduce your carbon footprint <br /> by optmising your route!</p>
                            </div>

                            <div className='flex place-content-center'> {/* buttons */}
                                <div>
                                    <button onClick={(e) => calcRoute(e)} className='font-bodyfont w-full max-h-fit bg-green py-2 px-3 rounded-lg drop-shadow-2xl mb-3'>Create Route</button>
                                    <button className='font-bodyfont w-full max-h-fit bg-eggshell py-2 px-3 rounded-lg drop-shadow-2xl'>Save Route</button>
                                </div>

                            </div>
                        </form>


                        <div className='h-full font-bodyfont basis-3/12 flex items-center '> {/* start to end section */}
                            <div className='h-fit'>
                                <div id="directionsPanel" className="hidden"></div>
                                <p id="directionsOverview" className="text-xs text-eggshell"></p>
                                <p className='underline text-eggshell cursor-pointer text-sm'>Show Directions</p>
                            </div>

                        </div>

                        <div className='basis-1/12 flex place-content-center'> {/* my saved routes button */}
                            <Link href={(user) ? "/map" : "/login"}><button className='font-bodyfont w-fit h-fit px-10 py-2.5  bg-eggshell rounded-lg drop-shadow-2xl'>My Saved Routes</button></Link>
                        </div>

>>>>>>> af939e4bbf7eecc5c25b30c4563c008c2ee7adee
                    </div>

                </div>





                <div className='font-bodyfont z-99 fixed right-0 mt-4 mr-12 flex items-start h-14'>
                    <div className="w-64 flex flex-col justify-center items-center">
                        <button onClick={(e) => handleAttractionsDropdown(e)} className='w-full max-h-fit bg-gray hover:bg-green rounded-xl text-eggshell py-1.5 px-4'>Show Nearby Attractions</button>
                        {(isAttractionsDropdownOpen) ? <div className='w-full bg-gray py-1.5 px-4 mt-2 rounded-xl opacity-80 text-eggshell'>
                            <form className="flex flex-col text-sm">
                                <div className="flex gap-2 items-center">
                                    <label>Water Activities</label>
                                    <input className="category" name="Water Activities" type="checkbox" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label>SAFRA Centres</label>
                                    <input className="category" name="SAFRA Centres" type="checkbox" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label>Food</label>
                                    <input className="category" name="Food" type="checkbox" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label>Monuments</label>
                                    <input className="category" name="Monuments" type="checkbox" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label>Museums</label>
                                    <input className="category" name="Museums" type="checkbox" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label>Skyrise Greenery</label>
                                    <input className="category" name="Skyrise Greenery" type="checkbox" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label>Museums</label>
                                    <input className="category" name="Museums" type="checkbox" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label>Tourist Attractions</label>
                                    <input className="category" name="Tourist Attractions" type="checkbox" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label>Historic Sites</label>
                                    <input className="category" name="Historic Sites" type="checkbox" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label>Park</label>
                                    <input className="category" name="Park" type="checkbox" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label>Green Mark Buildings</label>
                                    <input className="category" name="Green Mark Buildings" type="checkbox" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label>Rent Bicycles</label>
                                    <input className="category" name="Rent Bicycles" type="checkbox" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label>Sustainable Hotels</label>
                                    <input className="category" name="Sustainable Hotels" type="checkbox" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label>Shell Recharge/Greenlots (EV)</label>
                                    <input className="category" name="Shell Recharge/Greenlots (EV)" type="checkbox" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label>BlueSG (EV)</label>
                                    <input className="category" name="BlueSG (EV)" type="checkbox" />
                                </div>
                            </form>
                        </div> : <></>}
                    </div>

                    {(!user) ?
                        <Link href="/login"><button className='max-w-fit bg-gray rounded-xl text-eggshell py-1.5 px-4 mx-3 hover:bg-green'><LogoutIcon className='mr-1' />Login</button></Link> :
                        <button onClick={(e) => handleLogout(e)} className='max-w-fit bg-gray rounded-xl text-eggshell py-1.5 px-4 mx-3 hover:bg-green'><LogoutIcon className='mr-1' />Logout</button>
                    }
                    <InfoIcon className='text-gray text-3xl mx-3' />
                </div>
                <div className="z-99 fixed bg-gray opacity-80 right-0 bottom-0 rounded-md text-eggshell flex place-content-center items-center mr-16 mb-8 p-4">
                    <div id="statsPanel" className='text-sm'></div>
                </div>





            </div>
        </>

    )

}