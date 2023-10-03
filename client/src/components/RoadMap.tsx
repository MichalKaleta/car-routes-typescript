import { useState, useEffect } from "react";
import GoogleMapReact from "google-map-react";
import axios from "axios";
import { getArrayChunks } from "../utils/arrayMethods";
import { Pagination } from "antd";
import "./RoadMap.scss";

const RoadMap = () => {
  const [directionsApi, setDirectionsApi] = useState();
  const [routeChunks, setRouteChunks] = useState();
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchRouteData() {
      const res = await axios.get("http://localhost:3000/api/coordinates");

      const coordinates = res.data.map(({ latitude, longitude }) => {
        return {
          lat: latitude,
          lng: longitude,
        };
      });
      //cut into chunks of maximum maps API waypoints 25 + origin
      setRouteChunks(getArrayChunks(coordinates, 26));
    }
    fetchRouteData();
  }, []);

  useEffect(() => {
    async function fetchRoadSectionMap() {
      const routeSection = routeChunks[page - 1];
      const { directionsService, directionsRenderer } = directionsApi;

      const request = {
        origin: routeSection[0],
        waypoints: routeSection
          .slice(1, routeSection.length)
          .map((location) => ({
            stopover: false,
            location,
          })),
        destination: routeChunks[page]
          ? routeChunks[page].slice(0, 1)[0]
          : routeSection.slice(-1)[0],

        travelMode: "DRIVING",
      };

      directionsService.route(request, function (result, status) {
        if (status == "OK") {
          directionsRenderer.setDirections(result);
        }
      });
      directionsRenderer.setMap(directionsApi.map);
    }

    directionsApi && routeChunks ? fetchRoadSectionMap() : null;
  }, [page, directionsApi, routeChunks]);

  const handleApiLoaded = (map, maps) => {
    var directionsService = new maps.DirectionsService();
    var directionsRenderer = new maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    setDirectionsApi({
      directionsService,
      directionsRenderer,
      map,
    });
  };

  return (
    <div className="road-map__container">
      {routeChunks?.length > 0 && (
        <GoogleMapReact
          bootstrapURLKeys={{
            key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
          }}
          center={[0, 0]}
          defaultZoom={2}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
        />
      )}
      <div className="road-map__selector-wrapper">
        <Pagination
          defaultCurrent={1}
          defaultPageSize={1}
          total={routeChunks?.length || 1}
          onChange={(page) => setPage(page)}
        />
      </div>
    </div>
  );
};

export default RoadMap;
