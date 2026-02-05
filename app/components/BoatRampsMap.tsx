"use client";
import { useState } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const predefinedLocations = {
  pickup: [
    { name: "San Juan", coordinates: { longitude: -66.105735, latitude: 18.465539 } },
    { name: "Luquillo", coordinates: { longitude: -65.716684, latitude: 18.379524 } },
    { name: "Fajardo", coordinates: { longitude: -65.651818, latitude: 18.325787 } },
    { name: "Ceiba", coordinates: { longitude: -65.615992, latitude: 18.264044 } },
    { name: "Naguabo", coordinates: { longitude: -65.733164, latitude: 18.210997 } },
    { name: "Humacao", coordinates: { longitude: -65.827675, latitude: 18.144287 } },
  ],
  destination: [
    { name: "Culebra", coordinates: { longitude: -65.303221, latitude: 18.31492 } },
    { name: "Vieques", coordinates: { longitude: -65.4402, latitude: 18.09775 } },
    { name: "Icacos Islands", coordinates: { longitude: -65.610291, latitude: 18.366572 } },
    { name: "Isla Palominos", coordinates: { longitude: -65.594091, latitude: 18.29902 } },
    { name: "Mar Chiquita", coordinates: { longitude: -66.492964, latitude: 18.466466 } },
    { name: "Playa Buye", coordinates: { longitude: -67.187112, latitude: 18.064237 } },
    { name: "Crash Boat Beach", coordinates: { longitude: -67.15035, latitude: 18.47243 } },
    { name: "Saint Thomas", coordinates: { longitude: -64.933, latitude: 18.3407 } }, // Added island
    { name: "Charlotte Amalie", coordinates: { longitude: -64.931, latitude: 18.3405 } }, // Added Charlotte Amalie
  ],
  stops: [
    { name: "Culebra", coordinates: { longitude: -65.303221, latitude: 18.314920 } },
    { name: "Vieques", coordinates: { longitude: -65.440200, latitude: 18.097750 } },
    { name: "Icacos Islands", coordinates: { longitude: -65.610291, latitude: 18.366572 } },
    { name: "Isla Palominos", coordinates: { longitude: -65.594091, latitude: 18.299020 } },
    { name: "Mar Chiquita", coordinates: { longitude: -66.492964, latitude: 18.466466 } },
    { name: "Playa Buye", coordinates: { longitude: -67.187112, latitude: 18.064237 } },
    { name: "Crash Boat Beach", coordinates: { longitude: -67.150350, latitude: 18.472430 } },
  ],
};

const BoatRampsMap = () => {
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    longitude: number;
    latitude: number;
  } | null>(null);

  return (
    <section className="">
      <div className="max-w-5xl mx-auto ">
        <div className="h-64 relative">
          <Map
            initialViewState={{
              longitude: -66.3,
              latitude: 18.2,
              zoom: 7.8,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/outdoors-v11"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            maxBounds={[
              [-68.3, 17.8], // Southwest corner
              [-64.5, 19.6], // Northeast corner (adjusted)
            ]}
          >
            {/* Render Pickup Markers */}
            {predefinedLocations.pickup.map((location) => (
              <Marker
                key={location.name}
                longitude={location.coordinates.longitude}
                latitude={location.coordinates.latitude}
                onClick={() =>
                  setSelectedLocation({
                    name: location.name,
                    longitude: location.coordinates.longitude,
                    latitude: location.coordinates.latitude,
                  })
                }
              >
                <div className="cursor-pointer text-blue-600">
                  <img
                    src="/boat-ramp.png"
                    alt="Boat Ramp"
                    className="object-cover h-5"
                  />
                </div>
              </Marker>
            ))}

            {/* Render Destination Markers */}
            {predefinedLocations.destination.map((location) => (
              <Marker
                key={location.name}
                longitude={location.coordinates.longitude}
                latitude={location.coordinates.latitude}
                onClick={() =>
                  setSelectedLocation({
                    name: location.name,
                    longitude: location.coordinates.longitude,
                    latitude: location.coordinates.latitude,
                  })
                }
              >
                <div className="cursor-pointer text-red-600">
                  <img
                    src="/boat-ramp.png"
                    alt="Boat Ramp"
                    className="object-cover h-5"
                  />
                </div>
              </Marker>
            ))}

            {/* Popup for Selected Location */}
            {selectedLocation && (
              <Popup
                longitude={selectedLocation.longitude}
                latitude={selectedLocation.latitude}
                closeOnClick={false}
                onClose={() => setSelectedLocation(null)}
              >
                <h3 className="text-sm font-semibold">{selectedLocation.name}</h3>
              </Popup>
            )}
          </Map>
        </div>
      </div>
    </section>
  );
};

export default BoatRampsMap;
