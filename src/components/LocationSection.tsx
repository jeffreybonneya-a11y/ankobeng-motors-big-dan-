import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Mail, 
  Compass, 
  Layers, 
  Maximize2, 
  ExternalLink,
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/initialData';

const LAT = 5.547731;
const LNG = -0.217733;
const DEFAULT_ZOOM = 17;

export const LocationSection: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeTileLayer, setActiveTileLayer] = useState<'standard' | 'satellite' | 'detailed'>('standard');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map centered at exact coordinates: 5.547731, -0.217733
    const map = L.map(mapContainerRef.current, {
      center: [LAT, LNG],
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false // prevents accidental scroll capture on mobile while allowing user zoom
    });

    // Tile providers: Ultra-clear, natural real-world map tiles
    const tileUrls = {
      standard: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      },
      detailed: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      },
      satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }
    };

    const initialTiles = tileUrls[activeTileLayer];
    const tileLayer = L.tileLayer(initialTiles.url, {
      maxZoom: 19,
      attribution: initialTiles.attribution
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Create custom high-visibility Ankobeng Motors Pin Marker
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #111317; color: white; border: 2px solid #E64A19; border-radius: 6px; padding: 4px 8px; font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 5px;">
            <span style="width: 8px; height: 8px; background-color: #E64A19; border-radius: 50%; display: inline-block;"></span>
            ANKOBENG MOTORS
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #E64A19; margin-top: -1px;"></div>
          <div style="width: 14px; height: 14px; background-color: #E64A19; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.5); margin-top: -2px;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    const marker = L.marker([LAT, LNG], { icon: customIcon }).addTo(map);

    // Popup with real business details
    marker.bindPopup(`
      <div style="font-family: 'Outfit', sans-serif; padding: 6px 2px; color: #111317;">
        <h4 style="margin: 0; font-size: 14px; font-weight: 800; text-transform: uppercase; color: #E64A19;">ANKOBENG MOTORS</h4>
        <p style="margin: 2px 0 6px; font-size: 11px; color: #4b5563; font-weight: 600;">Dealers in Opel Engines & All Kinds of Engine Parts</p>
        <div style="font-size: 11px; color: #1f2937; border-top: 1px solid #e5e7eb; padding-top: 4px;">
          <div>📍 Near Post Office, Abossey Okai – Accra</div>
          <div>📞 0244148534 / 0277649509</div>
        </div>
      </div>
    `);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Tile layers (Standard / Clean Voyager / Satellite)
  const changeLayer = (layerType: 'standard' | 'satellite' | 'detailed') => {
    setActiveTileLayer(layerType);
    if (!mapInstanceRef.current) return;

    const tileUrls = {
      standard: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors'
      },
      detailed: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      },
      satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }
    };

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newTiles = tileUrls[layerType];
    tileLayerRef.current = L.tileLayer(newTiles.url, {
      maxZoom: 19,
      attribution: newTiles.attribution
    }).addTo(mapInstanceRef.current);
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetCenter = () => {
    mapInstanceRef.current?.setView([LAT, LNG], DEFAULT_ZOOM, { animate: true });
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`;
  const bingMapsUrl = `https://www.bing.com/maps?q=${LAT},${LNG}`;

  return (
    <section id="location" className="w-full bg-[#0F1115] py-16 px-4 sm:px-6 lg:px-8 border-t border-[#2B313E]">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#2B313E] pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#E64A19]" />
              <h2 className="font-['Outfit'] text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                PHYSICAL LOCATION &amp; INTERACTIVE MAP
              </h2>
            </div>
            <p className="font-['Outfit'] font-normal text-xs sm:text-sm text-gray-400">
              Live geographic data centered on Ankobeng Motors yard, Abossey Okai, Accra.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E64A19]"></span>
            <span className="font-['Outfit'] text-xs text-gray-300 uppercase font-bold tracking-wider">
              ABOSSEY OKAI AUTO PARTS DISTRICT, ACCRA
            </span>
          </div>
        </div>

        {/* Map Container Box with Dark/Orange Industrial Frame */}
        <div className="relative w-full rounded-xl border border-[#2B313E] bg-[#161920] overflow-hidden shadow-2xl">
          
          {/* Top Bar: GPS, Live Controls, Elevation */}
          <div className="bg-[#111317] px-4 py-3 border-b border-[#2B313E] flex flex-wrap items-center justify-between gap-3 z-20 relative">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 font-['Outfit'] text-xs text-gray-300">
                <Compass className="w-4 h-4 text-[#E64A19]" />
                <span className="font-bold text-white tracking-wide">GPS: {LAT}, {LNG}</span>
              </div>
              <span className="text-gray-600 hidden sm:inline">•</span>
              <span className="font-['Outfit'] text-xs text-gray-400">
                Elevation: <strong className="text-gray-200">11 m / 36 ft</strong>
              </span>
            </div>

            {/* Map Style Selector & External Links */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-[#1E222B] p-1 rounded border border-[#2B313E]">
                <button
                  type="button"
                  onClick={() => changeLayer('standard')}
                  className={`px-2.5 py-1 rounded font-['Outfit'] text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                    activeTileLayer === 'standard' ? 'bg-[#E64A19] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => changeLayer('detailed')}
                  className={`px-2.5 py-1 rounded font-['Outfit'] text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                    activeTileLayer === 'detailed' ? 'bg-[#E64A19] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Streets
                </button>
                <button
                  type="button"
                  onClick={() => changeLayer('satellite')}
                  className={`px-2.5 py-1 rounded font-['Outfit'] text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                    activeTileLayer === 'satellite' ? 'bg-[#E64A19] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Satellite
                </button>
              </div>

              <a
                href={bingMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E] text-gray-200 hover:text-[#E64A19] font-['Outfit'] text-xs font-bold transition-colors"
              >
                <span>Bing Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Map Layout Grid: 8 Cols Interactive Map + 4 Cols Direct Yard Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 relative min-h-[460px] sm:min-h-[520px] lg:min-h-[580px]">
            
            {/* The Live Interactive Map: 100% Crisp, High Resolution, Bright Natural Colors */}
            <div className="lg:col-span-8 relative w-full h-[380px] sm:h-[460px] lg:h-full bg-[#f8f9fa] overflow-hidden">
              
              {/* Leaflet Map Target DOM Node */}
              <div ref={mapContainerRef} className="w-full h-full z-10" />

              {/* Float Controls: Zoom In, Zoom Out, Reset Center */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 shadow-lg">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  aria-label="Zoom in map"
                  className="w-9 h-9 rounded bg-[#111317]/90 hover:bg-[#111317] border border-[#2B313E] flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  aria-label="Zoom out map"
                  className="w-9 h-9 rounded bg-[#111317]/90 hover:bg-[#111317] border border-[#2B313E] flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetCenter}
                  aria-label="Recenter on Ankobeng Motors"
                  title="Recenter on Ankobeng Motors"
                  className="w-9 h-9 rounded bg-[#111317]/90 hover:bg-[#111317] border border-[#2B313E] flex items-center justify-center text-[#E64A19] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Interactive Notice */}
              <div className="absolute bottom-2 left-2 z-20 bg-[#111317]/90 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] font-['Outfit'] text-gray-300 border border-[#2B313E] hidden sm:block">
                💡 Drag, pan or zoom to explore surrounding Abossey Okai roads
              </div>
            </div>

            {/* Sidebar Details Panel: Clear Business Location Card */}
            <div className="lg:col-span-4 bg-[#161920] border-t lg:border-t-0 lg:border-l border-[#2B313E] p-6 sm:p-7 flex flex-col justify-between gap-6 z-10">
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-xs bg-[#E64A19]"></span>
                    <span className="font-['Outfit'] text-[10px] uppercase text-[#E64A19] font-extrabold tracking-widest">
                      PHYSICAL WORKSHOP &amp; DISPATCH YARD
                    </span>
                  </div>
                  <h3 className="font-['Outfit'] text-lg sm:text-xl font-bold uppercase text-white leading-tight">
                    Abossey-Okai Rd, Accra, Greater Accra Region
                  </h3>
                  <span className="font-['Outfit'] text-xs text-gray-300 font-medium">
                    Near the Post Office, Abossey Okai – Accra
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 text-gray-300 font-['Outfit'] text-xs pt-3 border-t border-[#2B313E]">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-[#E64A19] shrink-0 mt-0.5" />
                    <span><strong>Postal Address:</strong> Box KN4009, ACCRA</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Navigation className="w-4 h-4 text-[#E64A19] shrink-0 mt-0.5" />
                    <span><strong>Landmarks:</strong> Near Post Office, Bonsu Lane, Sariki Kudi Lane</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#E64A19] shrink-0 mt-0.5" />
                    <span><strong>Coordinates:</strong> 5.547731, -0.217733</span>
                  </div>
                </div>

                <p className="font-['Outfit'] text-xs text-gray-400 leading-relaxed font-normal pt-1">
                  Located directly on Abossey-Okai Rd with easy vehicular access. Mechanics, fleet operators, and haulage trucks can drive right up to our shopfront for motor testing, compression verification, and immediate loading.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-4 border-t border-[#2B313E]">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-[#E64A19] hover:bg-[#D84315] text-white font-['Outfit'] text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer active:scale-98"
                >
                  <Navigation className="w-4 h-4" />
                  <span>GET DIRECTIONS (5.547731, -0.217733)</span>
                </a>

                <a
                  href={`tel:${BUSINESS_INFO.phones.primary}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-[#1E222B] hover:bg-[#252B36] border border-[#2B313E] text-white font-['Outfit'] text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4 text-[#E64A19]" />
                  <span>CALL BIG DAN FOR DIRECTIONS</span>
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
