"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

interface DeliveryMapProps {
  restaurantName?: string;
  customerArea?: string;
  orderNumber?: string;
  mode?: "customer" | "rider";
  height?: string;
}

export default function AmbikapurDeliveryMap({
  restaurantName = "The Royal Kitchen",
  customerArea = "Kedarpur Residential Zone, Ambikapur",
  orderNumber = "#ZB-LIVE",
  mode = "customer",
  height = "280px",
}: DeliveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState(12);

  // Ambikapur Coordinates:
  // Gandhi Chowk (Central): 23.1235, 83.1930
  // Kedarpur (Residential): 23.1155, 83.2045
  const restaurantCoord: [number, number] = [23.1235, 83.1930];
  const customerCoord: [number, number] = [23.1155, 83.2045];

  const routeWaypoints: [number, number][] = [
    restaurantCoord,
    [23.1220, 83.1955],
    [23.1200, 83.1980],
    [23.1175, 83.2015],
    customerCoord,
  ];

  useEffect(() => {
    let isMounted = true;

    // Dynamically initialize Leaflet on the client
    const initLeaflet = async () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      try {
        const L = (await import("leaflet")).default;

        if (!isMounted || !mapContainerRef.current) return;

        // Clean any leftover leaflet DOM before initializing
        if ((mapContainerRef.current as any)._leaflet_id) {
          (mapContainerRef.current as any)._leaflet_id = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [23.1195, 83.1987],
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
        });

        // High reliability OpenStreetMap standard tile layer
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          subdomains: ["a", "b", "c"],
        }).addTo(map);

        // Marker 1: Restaurant Pin
        const restIcon = L.divIcon({
          className: "leaflet-custom-div",
          html: `<div style="background-color:#ea580c; width:34px; height:34px; border-radius:50%; border:3px solid white; box-shadow:0 6px 16px rgba(234,88,12,0.5); display:flex; align-items:center; justify-content:center; font-size:16px;">🏪</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        // Marker 2: Customer House Pin
        const customerIcon = L.divIcon({
          className: "leaflet-custom-div",
          html: `<div style="background-color:#16a34a; width:34px; height:34px; border-radius:50%; border:3px solid white; box-shadow:0 6px 16px rgba(22,163,74,0.5); display:flex; align-items:center; justify-content:center; font-size:16px;">🏠</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        // Marker 3: Moving Rider Bike
        const bikeIcon = L.divIcon({
          className: "leaflet-custom-div",
          html: `<div style="background-color:#0f172a; width:36px; height:36px; border-radius:50%; border:3px solid #ea580c; box-shadow:0 6px 20px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; font-size:17px;">🛵</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        L.marker(restaurantCoord, { icon: restIcon })
          .addTo(map)
          .bindPopup(`<b>${restaurantName}</b><br>Gandhi Chowk, Ambikapur`);

        L.marker(customerCoord, { icon: customerIcon })
          .addTo(map)
          .bindPopup(`<b>Customer Drop Location</b><br>${customerArea}`);

        // Ambikapur road corridor polyline
        L.polyline(routeWaypoints, {
          color: "#ea580c",
          weight: 4,
          opacity: 0.85,
          dashArray: "8, 8",
        }).addTo(map);

        // Add Bike Marker & smoothly glide along the road
        const bikeMarker = L.marker([23.1200, 83.1980], { icon: bikeIcon }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoaded(true);

        // Crucial: Leaflet requires invalidateSize() after CSS paint
        setTimeout(() => {
          if (isMounted && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 150);

        setTimeout(() => {
          if (isMounted && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 500);

        // Smooth bike animation along route
        let step = 1;
        const bikeInterval = setInterval(() => {
          if (!isMounted) return;
          step = (step + 1) % routeWaypoints.length;
          bikeMarker.setLatLng(routeWaypoints[step]);
          setEtaMinutes((prev) => (prev <= 2 ? 14 : prev - 1));
        }, 3500);

        return () => {
          clearInterval(bikeInterval);
        };
      } catch (err) {
        console.warn("Leaflet mount notice:", err);
      }
    };

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-[#EDE5DA] bg-[#FAF7F2] shadow-xs"
      style={{ height, minHeight: height }}
    >
      {/* Actual Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0"
        style={{ height: "100%", width: "100%", minHeight: height }}
      />

      {/* Floating Status Overlay Badge */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200 text-xs font-bold shadow-md flex items-center gap-2 z-10 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-stone-800">
          {mode === "customer"
            ? `Rider is on the way • ~${etaMinutes} mins away (1.4 km)`
            : `Delivery to ${customerArea.split(",")[0]} • 1.4 km`}
        </span>
      </div>

      {/* Mode Indicator Overlay Badge (Bottom Right) */}
      <div className="absolute bottom-2.5 right-3 bg-stone-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black text-white shadow-xs z-10 pointer-events-none">
        Ambikapur Live GPS • OpenStreetMap
      </div>
    </div>
  );
}
