import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import Link from 'next/link';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useLogout } from '@/hooks/useLogout';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import ReactDOM from 'react-dom';
import Popup from '../components/popup';
import Popupinfo from '@/components/popupinfo';
import ResearchedData from '@/data/ResearchedData.json'
import BlueSGData from '@/data/BlueSGData.json'
import OneMapData from '@/data/OneMapData.json'
import { useSavedRoutesContext } from '@/hooks/useSavedRouteContext';
import DirectionsPopup from '@/components/directionsPopup';


export default function Map() {
    const { user } = useAuthContext()
    const { savedRoutes, dispatch } = useSavedRoutesContext()
    const { logout } = useLogout()

    const autoCompleteOptions = {
        componentRestrictions: { country: "sg" },
    };

    const [openinfo, setOpenInfo] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [openDirectionsModal, setOpenDirectionsModal] = useState(false)
    const [showSidebar, setShowSideBar] = useState(true)

    const fromRef = useRef()
    const toRef = useRef()

    const [gmap, setGMap] = useState(null)
    const [gdirectionsService, setGDirectionsService] = useState(null)
    const [gplacesSearch, setGPlacesSearch] = useState(null)
    const [gdestAutoComplete, setGDestAutoComplete] = useState(null)
    const [markersPolylines, setMarkersPolylines] = useState([])
    const [attractionMarkers, setAttractionMarkers] = useState([])
    const [lat_lngArray, setLat_LngArray] = useState([])

    const [isAttractionsDropdownOpen, setIsAttractionsDropdownOpen] = useState(false)
    const allCategories = ["Water Activities", "SAFRA Centres", "Monuments", "Food", "Museums", "Skyrise Greenery", "Tourist Attractions", "Historic Sites", "Park", "Green Mark Buildings", "Rent Bicycles", "Sustainable Hotels", "Shell Recharge/Greenlots (EV)", "BlueSG (EV)"]

    const [waypointsNum, setWaypointsNum] = useState(2)
    const [categoriesChecked, setCategoriesChecked] = useState([])
    const [waypointValues, setWaypointValues] = useState([])

    //FOR SAVING ROUTES
    const [currentRoute, setCurrentRoute] = useState({})
    const [currentRouteOverview, setCurrentRouteOverview] = useState("")
    const [savedRouteName, setSavedRouteName] = useState("")
    

    useEffect(() => {
        setTimeout(() => {
            const fetchedRouteName = localStorage.getItem("routeName");
            const fetchedRouteOverview = localStorage.getItem("routeOverview");
            const fetchedRoutePath = localStorage.getItem("routePath")

            if (fetchedRoutePath && fetchedRoutePath != undefined && fetchedRoutePath != "") {
                setCurrentRoute(JSON.parse(fetchedRoutePath));
                setCurrentRouteOverview(fetchedRouteOverview);
                setWaypointsNum((JSON.parse(fetchedRoutePath)["waypoints"].length > 1) ? (JSON.parse(fetchedRoutePath)["waypoints"].length) : 2)
                fromRef.current.value = JSON.parse(fetchedRoutePath)["origin"]
                const directionsOverview = document.querySelector("#directionsOverview")
                directionsOverview.innerHTML = fetchedRouteOverview;
                const firstToInput = document.querySelector("#firstToRef")
                const transportModeMenu = document.querySelector("#transportModeMenuRef")
                transportModeMenu.value = JSON.parse(fetchedRoutePath)["travelMode"]
                const optimizeRoute = document.querySelector("#optimizeRouteRef");

                optimizeRoute.checked = JSON.parse(fetchedRoutePath)["optimizeWaypoints"]


                if (JSON.parse(fetchedRoutePath)["waypoints"].length > 1) {
                    //origin is in waypoints
                    firstToInput.value = JSON.parse(fetchedRoutePath)["waypoints"][1]
                    setWaypointValues(JSON.parse(fetchedRoutePath)["waypoints"].slice(1))
                } else {
                    //origin is not in waypoints
                    firstToInput.value = JSON.parse(fetchedRoutePath)["waypoints"][0]
                    setWaypointValues(JSON.parse(fetchedRoutePath)["waypoints"])
                }
                if (gdirectionsService != null) {
                    calcRoute()
                }
               
            }

        }, 1000)
       


    }, [typeof window, gdirectionsService])

    const handleLogout = (e) => {
        e.preventDefault();
        logout()
    }

    const addWaypoint = (e) => {
        e.preventDefault();
        if (waypointsNum < 10) {
            setWaypointsNum(waypointsNum + 1)
        }
        setWaypointValues(waypointValues => [...waypointValues, ""])
        
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

    const resetWaypoints = (e) => {
        e.preventDefault();
        setWaypointsNum(2);
        fromRef.current.value = ""
        toRef.current.value = ""
        setWaypointValues([""])
    }

    const clearMap = () => {
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

        if (attractionMarkers.length > 0) {
            for (let i = 0; i < attractionMarkers.length; i++) {
                if (attractionMarkers[i].marker != null) {
                    try {
                        // For polyline, since both won't give errors
                        attractionMarkers[i].marker.setMap(null);
                    } catch (TypeError) {
                        // For advanced markers
                        attractionMarkers[i].marker.map = null;
                    }
                }
            }
        }
        setAttractionMarkers([]);

        const attractionCategoryChecklist = document.querySelectorAll("input.category")
        for (const cat of attractionCategoryChecklist) {
            cat.checked = false;
        }

        setCurrentRoute({});
        setCurrentRouteOverview("");
    }

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
            statsPanel.innerHTML = "Generating..."
            setTimeout(() => {
                statsPanel.innerHTML = `<p>${outputStringArray.join("")}</p>`
                if (!optimizeRoute) {
                    statsPanel.innerHTML += `<p><br>Optimize your route now for greater efficiency!`;
                }
            }, 2000);
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

        const REQUEST = route["request"];
        localStorage.setItem("routeName", "");
        localStorage.setItem("routePath", JSON.stringify(REQUEST));



        let carbonFootprintCount = 0;
        let duration = 0;

        setCategoriesChecked([]);
        clearMap();
        setCurrentRoute(REQUEST)


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
                        setCurrentRouteOverview(routeString)
                        localStorage.setItem("routeOverview", routeString);
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
                        setCurrentRouteOverview(routeString)
                        localStorage.setItem("routeOverview", routeString);
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
                    setCurrentRouteOverview(routeString)
                    localStorage.setItem("routeOverview", routeString);
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
    const inforender = (e) => {
        e.preventDefault();
        setOpenInfo(true)
    }

    const saveRoute = (e) => {
        e.preventDefault();
        setOpenModal(true)

    }
    const calcRoute = (e) => {
        if (e) {
            e.preventDefault();
        }
        const from = document.querySelector("#fromRef").value;
        const waypoints = Array.from(document.querySelectorAll("input.toRef")).map(
            (waypoint) => waypoint.value
        );

        const transportModeMenu = document.querySelector("#transportModeMenuRef")
        const transportMode = transportModeMenu.value.toUpperCase();
        const optimizeRoute = document.querySelector("#optimizeRouteRef").checked;

        const reqRoute = {
            request: {
                origin: from,
                destination: waypoints[waypoints.length - 1],
                waypoints: waypoints,
                travelMode: transportMode,
                optimizeWaypoints: optimizeRoute,
            },
        };


        console.log(reqRoute)
        retrieveRoute(reqRoute);
    }

    if (typeof window != "undefined") {
        const google = window.google = window.google ? window.google : {}

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

            setGMap(map)
            setGDirectionsService(directionsService)
            setGPlacesSearch(placesSearch)
            setGDestAutoComplete(destAutocomplete)
        }
    }

    const haversine_distance = (pt1, pt2) => {
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

    const nearbyPlaceSearch = (lat_lngArray, categoriesChecked) => {
        const dataSets = [ResearchedData, BlueSGData, OneMapData]
        for (const lat_lng of lat_lngArray) {
            for (const dataSet of dataSets) {
                for (const [theme, themePlace] of Object.entries(dataSet)) {
                    if (categoriesChecked.includes(theme)) {
                        for (const place of themePlace) {
                            if (
                                haversine_distance(lat_lng, place["address"]) <= 0.8
                            ) {
                                createMarker({
                                    theme: theme,
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
                                console.log("marker created")
                            }
                        }
                    }
                }
            }

        }
    }

    const createMarker = (details) => {
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
            map: gmap,
        });

        const markerCategory = details["theme"];

        attractionMarkers.push({
            category: markerCategory,
            marker: advancedMarkerView
        });
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

    const buildContent = (property) => {
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
        let markerIcon = ""

        switch (property["type"]) {
            case "building":
                markerIcon = "building"
                break;
            case "food":
                markerIcon = "utensils"
                break;
            case "bicycle":
                markerIcon = "bicycle"
                break;
            case "ev":
                markerIcon = "car-side"
                break;
            case "hotel":
                markerIcon = "hotel"
                break;
            case "park":
                markerIcon = "tree"
                break;
            case "water":
                markerIcon = "droplet"
                break;
            default:
                markerIcon = "circle-exclamation"
        }

        content.innerHTML = `
    <div class="icon">
        <i aria-hidden="true" class="fa fa-icon fa-${markerIcon}"></i>
        <span class="fa-sr-only">${markerIcon}</span>
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
            <span${property["price_level"] * "$" ||
            property["price_level"] ||
            "$$$$$$$$"
            }  span>
        </div>
        </div>
    </div>
    `;
        return content;
    }

    const highlight = (markerView) => {
        /**
         * Highlights a marker by adding the 'highlight' class to its content element and setting its z-index to 1
         * @param {object} markerView - The marker to highlight
         */
        markerView.content.classList.add("highlight");
        markerView.element.style.zIndex = 1;
    }

    const unhighlight = (markerView) => {
        /**
        * Removes the highlight from marker by removing the 'highlight' class from its content element and resetting its z-index to the default value
        * @param {object} markerView - The marker to unhighlight
        */
        markerView.content.classList.remove("highlight");
        markerView.element.style.zIndex = "";
    }

    const handleAttractionsDropdown = (e) => {
        e.preventDefault();
        setIsAttractionsDropdownOpen(!isAttractionsDropdownOpen)
    }

    const handleCategoryChecked = (e) => {

        if (e.target.checked) {
            setCategoriesChecked(oldArr => [...oldArr, e.target.name])
        } else {
            setCategoriesChecked(categoriesChecked.filter(cat => cat !== e.target.name))
        }
    }

    useEffect(() => {
        nearbyPlaceSearch(lat_lngArray, categoriesChecked)

        for (const cat of allCategories) {
            if (!categoriesChecked.includes(cat)) {
                for (const catToBeRemoved of attractionMarkers.filter(item => item.category == cat))
                    try {
                        catToBeRemoved.marker.setMap(null);
                    } catch (TypeError) {
                        catToBeRemoved.marker.map = null;
                    }
                setAttractionMarkers(attractionMarkers.filter(item => item.category !== cat))

            }
        }

    }, [categoriesChecked])


    return (
        <>
            <Helmet>
                <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBthJKxacm0pSrgo2yEEM_BUjmIryn8VOI&libraries=places,geometry,marker&v=beta&callback=initMap" async defer></script>

                <script src="https://use.fontawesome.com/releases/v6.3.0/js/all.js"></script>
            </Helmet>
            {openinfo && <Popupinfo closeinfo={setOpenInfo} />}
            {openModal && <Popup closemodal={setOpenModal} overview={currentRouteOverview} route={currentRoute} />}
            <DirectionsPopup closemodal={setOpenDirectionsModal} isOpen={openDirectionsModal} />
            <div className="bg-eggshell w-screen h-screen flex justify-between relative" >
                <div id="map" className="z-1 fixed h-screen w-screen"></div>
                <div className="bg-gray z-99 p-2 rounded-xl m-4 place-self-start fixed">
                    <button onClick={() => setShowSideBar(true)}><KeyboardDoubleArrowRightIcon className={`${(showSidebar) ? "hidden" : ""} text-eggshell text-3xl cursor-pointer`} /></button>
                </div>
                <div className={`${(showSidebar) ? "" : "hidden"} bg-gray z-99 h-screen w-1/4 place-self-start fixed`}>
                    <div className='mx-3 h-full flex flex-col'>
                        <div className='basis-1/12 flex items-baseline justify-between'> {/* title */}
                            <Link href="/"><h1 className='font-titleFont font-bold text-eggshell text-2xl mt-4'>Routourist</h1></Link>
                            <button onClick={() => setShowSideBar(false)}><KeyboardDoubleArrowLeftIcon className='text-eggshell text-3xl cursor-pointer' /></button>
                        </div>

                        <form className='basis-7/12 mt-2 flex flex-col justify-evenly'>
                            <div id="waypointsList" className='font-bodyfont flex flex-col h-24 gap-2 overflow-auto'> {/* this is for the inputs */}
                                <div className='flex'>
                                    <input ref={fromRef} id="fromRef" placeholder='From where?' className=' px-3 py-1 border-1 w-11/12 rounded-md' type="text"></input>
                                </div>
                                <div className='flex'>
                                    <input id="firstToRef" ref={toRef} placeholder='To where?' className='toRef px-3 py-1 border-1 w-11/12 rounded-md' type="text"></input>
                                    <MoreVertIcon className='text-eggshell text-3xl' />
                                </div>
                                {
                                    ((waypointsNum - 2) > 0) ? [...Array(waypointsNum - 2)].map((wp, i) => (
                                        <div className='flex' key={i}>
                                            <input onChange={(e) => setWaypointValues(
                                                waypointValues.map((item, j) => {
                                                    if (j === i+1) {
                                                        item = e.target.value
                                                    } else {
                                                        item = item
                                                    }
                                                }
                                            )
                                            )} placeholder='To where?' className='toRef px-3 py-1 border-1 w-11/12 rounded-md' type="text" value={waypointValues[i+1]}/>
                                            <MoreVertIcon className='text-eggshell text-3xl' />
                                        </div>
                                    )) : <></>
                                }

                            </div>

                            <div className='flex justify-center'> {/* this is for the add */}
                                <div className="flex items-center justify-between w-full mb-2">
                                    <button onClick={(e) => addWaypoint(e)} className="text-eggshell underline cursor-pointer hover:text-green">Add Waypoint</button>
                                    <button onClick={(e) => resetWaypoints(e)} className="text-eggshell underline cursor-pointer hover:text-green">Reset</button>
                                </div>

                            </div>

                            <div className='font-bodyfont'>
                                <select id="transportModeMenuRef" name="ModeTransport" className='bg-gray text-eggshell w-11/12 font-bodyfont border-2 border-eggshell rounded-md px-3 py-1 mb-2'>
                                    <option value="DRIVING">Driving</option>
                                    <option value="TRANSIT">Transit</option>
                                    <option value="WALKING">Walk</option>
                                    <option value="BICYCLING">Cycling</option>
                                </select>
                            </div>

                            <div> {/* checkbox */}
                                <input id="optimizeRouteRef" type="checkbox" name='OptimiseChoice' value="OptimiseChoice"></input>
                                <label for='OptimiseChoice' className='text-eggshell font-bodyfont ml-3'>Optimise Route</label>
                                <p className='text-eggshell font-bodyfont text-xs'>You can reduce your carbon footprint <br /> by optmising your route!</p>
                            </div>

                            <div className='flex place-content-center mt-4'> {/* buttons */}
                                <div>
                                    <button onClick={(e) => calcRoute(e)} className='font-bodyfont w-full max-h-fit bg-green hover:bg-lightgreen py-2 px-3 rounded-lg drop-shadow-2xl mb-3'>Create Route</button>
                                    <button onClick={(e) => saveRoute(e)} className='font-bodyfont w-full max-h-fit bg-eggshell hover:bg-white py-2 px-3 rounded-lg drop-shadow-2xl'>Save Route</button>
                                </div>

                            </div>
                        </form>


                        <div className='h-full font-bodyfont basis-3/12 flex items-center '> {/* start to end section */}
                            <div className='h-fit'>
                                <div id="directionsPanel" className="hidden"></div>
                                <p id="directionsOverview" className="text-xs text-eggshell"></p>
                                {(currentRoute.origin) ? <button onClick={() => setOpenDirectionsModal(true)} className="text-xs underline text-eggshell cursor-pointer">Show Directions</button> : <></>}
                            </div>

                        </div>

                        <div className='basis-1/12 flex place-content-center'> {/* my saved routes button */}
                            <Link href={(user) ? "/savedroutes" : "/login"}><button className='font-bodyfont w-fit h-fit px-10 py-2.5 mb-4 bg-eggshell hover:bg-white rounded-lg drop-shadow-2xl'>My Saved Routes</button></Link>
                        </div>

                    </div>

                </div>

                <div className='font-bodyfont z-99 fixed right-0 mt-4 mr-12 flex items-start h-14'>
                    <div className="w-64 flex flex-col justify-center items-center">
                        <button onClick={(e) => handleAttractionsDropdown(e)} className='w-full max-h-fit bg-gray hover:bg-green rounded-xl text-eggshell py-1.5 px-4'>Show Nearby Attractions</button>
                        <div className={`${(isAttractionsDropdownOpen) ? "" : "hidden"} w-full bg-gray py-1.5 px-4 mt-2 rounded-xl opacity-80 text-eggshell`}>
                            <form className="flex flex-col text-sm">
                                {
                                    allCategories.map((cat) => (
                                        <div className="flex gap-2 items-center">
                                            <label>{cat}</label>
                                            <input onChange={(e) => handleCategoryChecked(e)} className="category" name={cat} type="checkbox" />
                                        </div>
                                    ))
                                }

                            </form>
                        </div>
                    </div>

                    {(!user) ?
                        <Link href="/login"><button className='max-w-fit bg-gray rounded-xl text-eggshell py-1.5 px-4 mx-3 hover:bg-green'><LogoutIcon className='mr-1' />Login</button></Link> :
                        <button onClick={(e) => handleLogout(e)} className='max-w-fit bg-gray rounded-xl text-eggshell py-1.5 px-4 mx-3 hover:bg-green'><LogoutIcon className='mr-1' />Logout</button>
                    }
                    <button onClick={(e) => inforender(e)} ><InfoIcon className='text-gray text-3xl mx-3' /></button>
                </div>
                <div className="z-99 fixed bg-gray opacity-80 right-0 bottom-0 rounded-md text-eggshell flex place-content-center items-center mr-16 mb-8 p-4">
                    <div id="statsPanel" className='text-sm'></div>
                </div>





            </div>
        </>

    )

}