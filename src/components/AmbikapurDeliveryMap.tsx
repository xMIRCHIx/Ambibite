"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  Maximize2,
  Minimize2,
  X,
  Plus,
  Minus,
  Navigation,
  Store,
  MapPin,
  ExternalLink,
} from "lucide-react";

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
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Handle Fullscreen transition: resize Leaflet canvas and fit bounds
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
        if (isFullscreen) {
          mapInstanceRef.current.fitBounds([restaurantCoord, customerCoord], {
            padding: [60, 60],
          });
        }
      }, 150);
    }
  }, [isFullscreen]);

  const isRealGps = Boolean(riderLat && riderLng);

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-[9999] w-screen h-screen bg-stone-900 rounded-none shadow-2xl flex flex-col"
          : "relative w-full rounded-2xl overflow-hidden border border-[#EDE5DA] bg-[#FAF7F2] shadow-xs group"
      }`}
      style={
        isFullscreen
          ? { height: "100vh", width: "100vw" }
          : { height, minHeight: height }
      }
    >
      {/* Actual Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        onClick={() => {
          if (!isFullscreen) setIsFullscreen(true);
        }}
        className="w-full h-full z-0 cursor-pointer"
        style={{
          height: "100%",
          width: "100%",
          minHeight: isFullscreen ? "100vh" : height,
        }}
      />

      {/* NORMAL EMBEDDED MODE OVERLAYS */}
      {!isFullscreen && (
        <>
          {/* Floating Status Overlay Badge (Top Left) */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200 text-xs font-bold shadow-md flex items-center gap-2 z-10 pointer-events-none">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRealGps ? "bg-emerald-500 animate-ping" : "bg-emerald-500 animate-pulse"
              }`}
            />
            <span className="text-stone-800">
              {isRealGps
                ? "🛰️ Live GPS Active • Real-time Location"
                : mode === "customer"
                ? `Rider en route • ~${etaMinutes} mins away (1.4 km)`
                : `Drop: ${customerArea.split(",")[0]}`}
            </span>
          </div>

          {/* Expand Fullscreen Button (Top Right) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            className="absolute top-3 right-3 bg-white/95 hover:bg-white text-stone-900 text-[11px] font-black px-3 py-1.5 rounded-full border border-stone-200 shadow-md flex items-center gap-1.5 z-20 cursor-pointer transition active:scale-95 hover:shadow-lg"
            title="Click to view full screen interactive map"
          >
            <Maximize2 className="w-3.5 h-3.5 text-orange-600" />
            <span>Bada Map Dekhein</span>
          </button>

          {/* Mode Indicator Overlay Badge (Bottom Right) */}
          <div className="absolute bottom-2.5 right-3 bg-stone-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black text-white shadow-xs z-10 pointer-events-none">
            Ambikapur Live GPS • Tap to Expand ⛶
          </div>
        </>
      )}

      {/* FULLSCREEN EXPANDED MODE OVERLAYS */}
      {isFullscreen && (
        <>
          {/* Top Floating App Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-stone-200 text-xs font-black shadow-xl flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRealGps ? "bg-emerald-500 animate-ping" : "bg-emerald-500 animate-pulse"
                }`}
              />
              <span className="text-stone-900">
                {isRealGps ? "🛰️ Live GPS Streaming" : "Ambikapur Real Road Route"} • ~{etaMinutes} mins
              </span>
            </div>

            <button
              onClick={() => setIsFullscreen(false)}
              className="bg-stone-900 hover:bg-black text-white px-4 py-2 rounded-2xl border border-stone-700 shadow-xl flex items-center gap-1.5 text-xs font-black transition cursor-pointer active:scale-95"
            >
              <X className="w-4 h-4 text-orange-400" />
              <span>Chhota Karein (Exit)</span>
            </button>
          </div>

          {/* Right Floating Map Controls (Zoom In, Zoom Out, Center Rider) */}
          <div className="absolute right-4 top-24 flex flex-col gap-2 z-20 pointer-events-auto">
            <button
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="w-11 h-11 rounded-2xl bg-white/95 shadow-xl border border-stone-200 flex items-center justify-center text-stone-800 font-black hover:bg-white active:scale-95 cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="w-11 h-11 rounded-2xl bg-white/95 shadow-xl border border-stone-200 flex items-center justify-center text-stone-800 font-black hover:bg-white active:scale-95 cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const pos = riderLat && riderLng ? [riderLat, riderLng] : realRoadRoute[18];
                mapInstanceRef.current?.panTo(pos, { animate: true });
              }}
              className="w-11 h-11 rounded-2xl bg-orange-600 text-white shadow-xl flex items-center justify-center hover:bg-orange-500 active:scale-95 cursor-pointer"
              title="Center on Rider"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Floating Delivery Card */}
          <div className="absolute bottom-6 left-4 right-4 max-w-lg mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-4 border border-stone-200 shadow-2xl z-20 pointer-events-auto space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-stone-900">
                {orderNumber} • Ambikapur Live Delivery Route
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {etaMinutes} Mins ETA
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-2">
                <Store className="w-4 h-4 text-orange-600 shrink-0" />
                <div className="truncate">
                  <strong className="block text-stone-900 font-bold truncate">{restaurantName}</strong>
                  <span className="text-[10px] text-stone-500">Gandhi Chowk Pickup</span>
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <strong className="block text-stone-900 font-bold truncate">Drop Location</strong>
                  <span className="text-[10px] text-stone-500 truncate">{customerArea}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
