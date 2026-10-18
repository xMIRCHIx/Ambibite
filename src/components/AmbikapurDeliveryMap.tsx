"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

interface DeliveryMapProps {
  restaurantName?: string;
  customerArea?: string;
  orderNumber?: string;
  mode?: "customer" | "rider";
  height?: string;
  riderLat?: number;
  riderLng?: number;
}

export default function AmbikapurDeliveryMap({
  restaurantName = "The Royal Kitchen",
  customerArea = "Kedarpur Residential Zone, Ambikapur",
  orderNumber = "#ZB-LIVE",
  mode = "customer",
  height = "280px",
  riderLat,
  riderLng,
}: DeliveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const bikeMarkerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState(12);

  // Ambikapur Coordinates:
  // Gandhi Chowk (Central): 23.1235, 83.1930
  // Kedarpur (Residential): 23.1155, 83.2045
  const restaurantCoord: [number, number] = [23.12341, 83.1933];
  const customerCoord: [number, number] = [23.11559, 83.20455];

  // Exact 43 road curve waypoints along Ambikapur streets (OSRM Engine)
  const realRoadRoute: [number, number][] = [
    [23.12341, 83.1933],
    [23.12391, 83.19348],
    [23.12396, 83.19347],
    [23.12405, 83.1935],
    [23.12469, 83.19375],
    [23.12492, 83.19389],
    [23.12437, 83.19503],
    [23.12431, 83.19516],
    [23.12411, 83.19553],
    [23.12332, 83.1972],
    [23.12325, 83.19729],
    [23.12295, 83.19799],
    [23.12247, 83.19906],
    [23.12231, 83.19947],
    [23.12223, 83.19968],
    [23.1218, 83.20076],
    [23.12177, 83.20086],
    [23.12152, 83.20164],
    [23.12091, 83.20262],
    [23.12041, 83.20352],
    [23.12034, 83.20364],
    [23.11958, 83.20335],
    [23.11935, 83.2033],
    [23.11888, 83.20321],
    [23.11867, 83.2032],
    [23.11862, 83.20318],
    [23.11801, 83.20313],
    [23.11787, 83.2031],
    [23.11782, 83.20312],
    [23.11757, 83.20313],
    [23.11728, 83.20303],
    [23.1169, 83.2028],
    [23.11698, 83.2026],
    [23.11661, 83.20242],
    [23.1164, 83.20234],
    [23.11626, 83.20274],
    [23.11612, 83.20319],
    [23.11612, 83.20329],
    [23.11614, 83.20339],
    [23.11612, 83.20346],
    [23.11591, 83.20394],
    [23.11571, 83.20428],
    [23.11559, 83.20455],
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
          center: [23.1200, 83.1985],
          zoom: 15,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
        });

        // Clean CartoDB Voyager tiles - Beautiful English labels, no foreign scripts
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 19,
            subdomains: ["a", "b", "c", "d"],
          }
        ).addTo(map);

        // Marker 1: Restaurant Pin (Gandhi Chowk)
        const restIcon = L.divIcon({
          className: "leaflet-custom-div",
          html: `<div style="background-color:#ea580c; width:34px; height:34px; border-radius:50%; border:3px solid white; box-shadow:0 6px 16px rgba(234,88,12,0.4); display:flex; align-items:center; justify-content:center; font-size:16px;">🏪</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        // Marker 2: Customer House Pin (Kedarpur)
        const customerIcon = L.divIcon({
          className: "leaflet-custom-div",
          html: `<div style="background-color:#16a34a; width:34px; height:34px; border-radius:50%; border:3px solid white; box-shadow:0 6px 16px rgba(22,163,74,0.4); display:flex; align-items:center; justify-content:center; font-size:16px;">🏠</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        // Marker 3: Rider Bike Pin
        const bikeIcon = L.divIcon({
          className: "leaflet-custom-div",
          html: `<div style="background-color:#0f172a; width:38px; height:38px; border-radius:50%; border:3px solid #f97316; box-shadow:0 8px 24px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; font-size:18px;">🛵</div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        L.marker(restaurantCoord, { icon: restIcon })
          .addTo(map)
          .bindPopup(`<b>${restaurantName}</b><br>Gandhi Chowk, Ambikapur`);

        L.marker(customerCoord, { icon: customerIcon })
          .addTo(map)
          .bindPopup(`<b>Customer Drop Location</b><br>${customerArea}`);

        // Real road polyline along Ambikapur streets
        L.polyline(realRoadRoute, {
          color: "#ea580c",
          weight: 5,
          opacity: 0.9,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(map);

        // Position bike at real rider position OR mid-route road position
        const initialBikePos: [number, number] =
          riderLat && riderLng ? [riderLat, riderLng] : realRoadRoute[18];
        const bikeMarker = L.marker(initialBikePos, { icon: bikeIcon }).addTo(map);
        bikeMarkerRef.current = bikeMarker;

        mapInstanceRef.current = map;
        setMapLoaded(true);

        // Fit bounds to keep both restaurant & customer in frame
        map.fitBounds([restaurantCoord, customerCoord], {
          padding: [30, 30],
          maxZoom: 15,
        });

        // Leaflet invalidateSize after container paint
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

  // Update bike marker in real-time when real GPS coordinates stream in
  useEffect(() => {
    if (riderLat && riderLng && bikeMarkerRef.current) {
      bikeMarkerRef.current.setLatLng([riderLat, riderLng]);
      if (mapInstanceRef.current) {
        // Softly pan to follow rider
        mapInstanceRef.current.panTo([riderLat, riderLng], { animate: true, duration: 1 });
      }
    }
  }, [riderLat, riderLng]);

  const isRealGps = Boolean(riderLat && riderLng);

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
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isRealGps ? "bg-emerald-500 animate-ping" : "bg-emerald-500 animate-pulse"
          }`}
        />
        <span className="text-stone-800">
          {isRealGps
            ? "🛰️ Live GPS Active • Real-time Rider Location"
            : mode === "customer"
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
