import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { Region } from "@shared/schema";
import { Icon, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerIcon2xPng from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2xPng,
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
});

interface AnalysisMapProps {
  regions: Region[];
  selectedRegionId: number | null;
  onSelectRegion: (id: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  pendingMarker?: { lat: number; lng: number } | null;
}

function MapController({ center, selectedId }: { center: [number, number], selectedId: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedId) {
      map.flyTo(center, 10, { duration: 1.5 });
    }
  }, [center, selectedId, map]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

const pendingIcon = new Icon({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2xPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "pending-marker"
});

export function AnalysisMap({ regions, selectedRegionId, onSelectRegion, onMapClick, pendingMarker }: AnalysisMapProps) {
  const selectedRegion = regions.find(r => r.id === selectedRegionId);
  
  const defaultCenter: [number, number] = [20, 0];
  const center: [number, number] = selectedRegion 
    ? [selectedRegion.latitude, selectedRegion.longitude] 
    : defaultCenter;

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border shadow-sm relative z-0">
      <div className="absolute top-2 left-12 z-[1000] bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-md shadow-sm text-xs text-muted-foreground">
        Click anywhere on the map to add a new region
      </div>
      <MapContainer 
        center={defaultCenter} 
        zoom={3} 
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />
        
        <MapClickHandler onMapClick={onMapClick} />
        
        {regions.map((region) => (
          <Marker 
            key={region.id} 
            position={[region.latitude, region.longitude]}
            eventHandlers={{
              click: () => onSelectRegion(region.id),
            }}
            opacity={selectedRegionId === region.id ? 1 : 0.7}
          >
            <Popup>
              <div className="text-sm font-medium">
                <h3 className="font-serif font-bold text-base mb-1">{region.name}</h3>
                <p className="text-muted-foreground">{region.description}</p>
                <button 
                  onClick={() => onSelectRegion(region.id)}
                  className="mt-2 text-primary hover:underline text-xs"
                  data-testid={`button-select-region-${region.id}`}
                >
                  Select for Analysis
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {pendingMarker && (
          <Marker 
            position={[pendingMarker.lat, pendingMarker.lng]}
            icon={pendingIcon}
            opacity={0.8}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-medium text-amber-600">New Region</p>
                <p className="text-xs text-muted-foreground">
                  {pendingMarker.lat.toFixed(4)}, {pendingMarker.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        <MapController center={center} selectedId={selectedRegionId} />
      </MapContainer>
    </div>
  );
}
