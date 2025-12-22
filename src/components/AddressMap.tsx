import React from "react";
import { Box, Typography } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  lat?: number;
  lng?: number;
  label?: string;
};

export default function AddressMap({ lat, lng, label }: Props) {
  if (lat == null || lng == null) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Informe um endereço (ou CEP + número) para visualizar o mapa.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
      <MapContainer center={[lat, lng]} zoom={16} style={{ height: 280, width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={markerIcon}>
          <Popup>{label || "Local do evento"}</Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
}
