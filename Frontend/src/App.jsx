import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Popup, Marker, useMap } from "react-leaflet";
import { io } from "socket.io-client";

const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

const App = () => {
  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

  const socket = useRef(null);

  const [markers, setMarkers] = useState([]);

  const [position, setPosition] = useState({
    lat: 0,
    lng: 0,
  });

  useEffect(() => {
    socket.current = io(API_ENDPOINT);

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition({ lat: latitude, lng: longitude });
          socket.current.emit("send-data", { lat: latitude, lng: longitude });
        },
        (err) => {
          console.log(err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        socket.current.disconnect();
      };
    } else {
      alert("Sorry, geolocation is not available!");
    }
  }, []);

  useEffect(() => {
    if (socket.current) {
      socket.current.on("receive-data", (data) => {
        setMarkers((prevMarkers) => {
          if (prevMarkers.some((mark) => mark.id === data.id)) {
            return prevMarkers;
          }
          return [...prevMarkers, { id: data.id, pos: data.pos }];
        });
      });

      socket.current.on("remove-position", (id) => {
        setMarkers((prevMarkers) =>
          prevMarkers.filter((mark) => mark.id !== id)
        );
      });
    }
  }, []);

  console.log(markers.length);

  return (
    <div className="w-screen h-screen">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((mark) => (
          <Marker position={mark.pos} key={mark.id}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        ))}
        <RecenterAutomatically lat={position.lat} lng={position.lng} />
      </MapContainer>
    </div>
  );
};

export default App;
