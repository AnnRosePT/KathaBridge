import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Story } from "../types";
import { Soundtrack } from "../services/soundtrackService";

export interface HeritageSite {
  id: string;
  name: string;
  nameMalayalam: string;
  district: string;
  coordinates: { lat: number; lng: number };
  category: "RITUAL" | "TOPOGRAPHY" | "CRAFT" | "CLASSICAL" | "SACRED_GROVE";
  categoryLabel: string;
  unescoStatus: boolean;
  unescoLabel?: string;
  custodian: string;
  historicalSignificance: string;
  oralTraditionSummary: string;
  associatedStoryId: string;
  associatedStoryTitle: string;
  sourceCitation: string;
  sourceUrl: string;
}

export const HERITAGE_SITES: HeritageSite[] = [
  {
    id: "site-madayi-kavu",
    name: "Madayi Kavu & Parassini Madappura",
    nameMalayalam: "മാടായിക്കാവ് & പറശ്ശിനിക്കടവ്",
    district: "Kannur, North Malabar",
    coordinates: { lat: 11.9962, lng: 75.3117 },
    category: "RITUAL",
    categoryLabel: "Living Ritual Shrine",
    unescoStatus: false,
    custodian: "Malabar Devaswom & Indigenous Vannan/Malayan Lineages",
    historicalSignificance: "Ancient epicenter of North Malabar Mother Goddess worship and Theyyam ritual performance.",
    oralTraditionSummary: "Living open-air shrine where performers embody Thee Chamundi fire incarnations and Lord Muthappan oral folk chants.",
    associatedStoryId: "theyyam",
    associatedStoryTitle: "The Red Fire of Theyyam (തീച്ചാമുണ്ഡി)",
    sourceCitation: "Sahapedia Living Traditions Archive, Kannur Field Studies",
    sourceUrl: "https://www.sahapedia.org/theyyam"
  },
  {
    id: "site-irinjalakuda-koothambalam",
    name: "Irinjalakuda & Koodalmanikyam Koothambalam",
    nameMalayalam: "കൂടൽമാണിക്യം കൂത്തമ്പലം",
    district: "Thrissur, Central Kerala",
    coordinates: { lat: 10.3547, lng: 76.2082 },
    category: "CLASSICAL",
    categoryLabel: "UNESCO Sanskrit Temple Theatre",
    unescoStatus: true,
    unescoLabel: "UNESCO Intangible Cultural Heritage (2001)",
    custodian: "Margi & Kerala Kalamandalam Chakyar/Nambiar Guilds",
    historicalSignificance: "Surviving architectural temple theatre dedicated solely to 1,800-year-old Sanskrit dramatic performance.",
    oralTraditionSummary: "Site of ritualistic Netrabhinaya eye expressions, Mizhavu percussion resonation, and continuous Guru-Shishya oral pedagogy.",
    associatedStoryId: "koodiyattam",
    associatedStoryTitle: "Koodiyattam: The Eye That Speaks (കൂടിയാട്ടം)",
    sourceCitation: "UNESCO ICH Representative List Document RL/00010",
    sourceUrl: "https://ich.unesco.org/en/RL/kutiyattam-sanskrit-theatre-00010"
  },
  {
    id: "site-thrikkakara-temple",
    name: "Thrikkakara Vamana Moorthy Temple",
    nameMalayalam: "തൃക്കാക്കര ക്ഷേത്രം",
    district: "Ernakulam, Central Kerala",
    coordinates: { lat: 10.0381, lng: 76.3292 },
    category: "TOPOGRAPHY",
    categoryLabel: "Mythological Sovereignty Locus",
    unescoStatus: false,
    custodian: "Travancore Devaswom Board & Onam Folk Collective",
    historicalSignificance: "Epigraphic center associated with the ancient capital of King Mahabali's legendary golden age.",
    oralTraditionSummary: "Focal point of Onam festive beginnings, Pookkalam floral art rituals, and the collective memory of egalitarian social harmony.",
    associatedStoryId: "mahabali",
    associatedStoryTitle: "The Legend of Mahabali & Onam (മാവേലി ചരിതം)",
    sourceCitation: "Kerala Tourism Cultural Heritage Registry",
    sourceUrl: "https://www.keralatourism.org/festival/onam/1"
  },
  {
    id: "site-rayiranelloor-mala",
    name: "Rayiranelloor Mala (Hill of the Rolling Stone)",
    nameMalayalam: "രായിരനല്ലൂർ മല",
    district: "Palakkad, Central Kerala",
    coordinates: { lat: 10.8711, lng: 76.0825 },
    category: "TOPOGRAPHY",
    categoryLabel: "Philosophical Folklore Site",
    unescoStatus: false,
    custodian: "Rayiranelloor Hill Heritage Trust",
    historicalSignificance: "500-foot granite monolith where 7th-century sage Naranath Bhranthan rolled boulders to hilltops to watch them roll down.",
    oralTraditionSummary: "Living folklore site teaching philosophical equanimity, mockery of human vanity, and detachment from worldly achievements.",
    associatedStoryId: "naranath",
    associatedStoryTitle: "Naranath Bhranthan: The Wise Madman (നارانത്ത് ഭ്രാന്തൻ)",
    sourceCitation: "Kottarathil Sankunni's Aithihyamala (1909)",
    sourceUrl: "https://archive.org/details/aithihyamala"
  },
  {
    id: "site-mannarasala-sarpakkavu",
    name: "Mannarasala Sacred Serpent Grove",
    nameMalayalam: "മണ്ണാറശാല സർപ്പക്കാവ്",
    district: "Alappuzha, South Kerala",
    coordinates: { lat: 9.2778, lng: 76.5167 },
    category: "SACRED_GROVE",
    categoryLabel: "Indigenous Ecological Sanctuary",
    unescoStatus: false,
    custodian: "Illam Matriarchal Lineage (Valiya Amma)",
    historicalSignificance: "Pristine 16-acre virgin evergreen grove harboring 30,000 serpent stone idols and indigenous medicinal flora.",
    oralTraditionSummary: "Ecological folk tradition intertwining indigenous serpent mythology with biological conservation of ground aquifers.",
    associatedStoryId: "theyyam",
    associatedStoryTitle: "The Red Fire of Theyyam (Ecological Shrines)",
    sourceCitation: "Sahapedia Ecological Heritage Dossier",
    sourceUrl: "https://www.sahapedia.org"
  },
  {
    id: "site-aranmula-heritage",
    name: "Aranmula Metal Mirror Artisan Guild",
    nameMalayalam: "ആറന്മുള കണ്ണാടി പണിപ്പുര",
    district: "Pathanamthitta, South Kerala",
    coordinates: { lat: 9.3333, lng: 76.6833 },
    category: "CRAFT",
    categoryLabel: "Geographical Indication (GI) Guild",
    unescoStatus: false,
    custodian: "Aranmula Vishwakarma Metal Workers Collective",
    historicalSignificance: "Ancient metallurgical settlement retaining the secret copper-tin alloy front-surface reflective mirror formulation.",
    oralTraditionSummary: "Sacred craft tradition passed exclusively through oral master-apprentice memory without recorded metallurgical formulas.",
    associatedStoryId: "mahabali",
    associatedStoryTitle: "Heritage of Kerala (Aranmula Kannadi)",
    sourceCitation: "Geographical Indications Registry of India (GI-4)",
    sourceUrl: "https://www.keralatourism.org"
  }
];

interface Props {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onClose: () => void;
}

export const HeritageMapModal: React.FC<Props> = ({
  stories,
  onSelectStory,
  onClose
}) => {
  const [selectedSite, setSelectedSite] = useState<HeritageSite>(HERITAGE_SITES[0]);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapLayer, setMapLayer] = useState<"TERRAIN" | "STANDARD" | "ILLUSTRATED">("TERRAIN");

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const filteredSites = HERITAGE_SITES.filter((site) => {
    const matchesCategory = filterCategory === "ALL" || site.category === filterCategory;
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.nameMalayalam.includes(searchQuery) ||
      site.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapLayer === "ILLUSTRATED") return;
    if (!mapContainerRef.current) return;

    try {
      // Create Leaflet map instance
      const map = L.map(mapContainerRef.current, {
        center: [selectedSite.coordinates.lat, selectedSite.coordinates.lng],
        zoom: 8,
        minZoom: 6,
        maxZoom: 18,
        zoomControl: true
      });

      // Select tile URL based on mapLayer
      // TERRAIN: OpenTopoMap showing real Western Ghats elevation, contours, mountain relief & rivers
      // STANDARD: OpenStreetMap showing full regional geographical details
      const tileUrl =
        mapLayer === "TERRAIN"
          ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 18,
        attribution:
          mapLayer === "TERRAIN"
            ? "Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)"
            : "&copy; OpenStreetMap contributors"
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Add custom Neo-Pop pins
      HERITAGE_SITES.forEach((site) => {
        const isSelected = site.id === selectedSite.id;
        const customIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="
              background: ${isSelected ? "#FF087D" : site.unescoStatus ? "#080808" : "#FFFC00"};
              color: ${isSelected ? "#FFFFFF" : site.unescoStatus ? "#FFFC00" : "#080808"};
              border: 2.5px solid #080808;
              border-radius: 9999px;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 15px;
              box-shadow: 3px 3px 0px #080808;
              cursor: pointer;
              transform: translate(-50%, -50%);
              transition: transform 0.15s ease;
            ">
              📍
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([site.coordinates.lat, site.coordinates.lng], {
          icon: customIcon
        }).addTo(map);

        marker.on("click", () => {
          Soundtrack.playModalPop();
          setSelectedSite(site);
          map.flyTo([site.coordinates.lat, site.coordinates.lng], 12, {
            duration: 1.2
          });
        });

        markersRef.current.push(marker);
      });

      mapInstanceRef.current = map;

      // Fix size calculation inside animated modal
      const t1 = setTimeout(() => {
        map.invalidateSize();
      }, 150);

      const t2 = setTimeout(() => {
        map.invalidateSize();
      }, 450);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (err) {
      console.warn("Leaflet map initialization error:", err);
    }
  }, [mapLayer]);

  const handleSelectSite = (site: HeritageSite) => {
    Soundtrack.playClick();
    setSelectedSite(site);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [site.coordinates.lat, site.coordinates.lng],
        12,
        { duration: 1.2 }
      );
    }
  };

  const handleExportGeoJSON = () => {
    Soundtrack.playClick();
    const geoJsonData = {
      type: "FeatureCollection",
      metadata: {
        title: "KathaBridge Living Heritage Topography of Kerala",
        standard: "W3C Spatial Data on the Web / OGC GeoJSON",
        tileProvider: "OpenTopoMap & OpenStreetMap Geographical Topography",
        extractedAt: new Date().toISOString()
      },
      features: HERITAGE_SITES.map((site) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [site.coordinates.lng, site.coordinates.lat]
        },
        properties: {
          name: site.name,
          nameMalayalam: site.nameMalayalam,
          district: site.district,
          category: site.categoryLabel,
          unescoStatus: site.unescoStatus,
          custodian: site.custodian,
          historicalSignificance: site.historicalSignificance,
          associatedStory: site.associatedStoryTitle,
          citation: site.sourceCitation
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geoJsonData, null, 2)], {
      type: "application/geo+json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kathabridge-geographical-map-${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="heritage-map-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[14px_14px_0px_#FF087D] relative">
        {/* Modal Header */}
        <div className="bg-brandYellow border-b-4 border-brandBlack p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brandPink text-white border-2 border-brandBlack flex items-center justify-center text-xl shadow-[3px_3px_0px_#080808]">
              🗺️
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-brandBlack text-brandYellow text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack uppercase tracking-widest">
                <span>GEOGRAPHICAL TOPOGRAPHY GIS</span>
                <span>•</span>
                <span>KERALA ORAL LOCI</span>
              </div>
              <h2
                id="heritage-map-title"
                className="font-editorial text-2xl sm:text-3xl font-black text-brandBlack tracking-tight"
              >
                Geographical Topography &amp; Sacred Shrines
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportGeoJSON}
              className="bg-white hover:bg-brandBlack hover:text-white text-brandBlack border-2 border-brandBlack px-3 py-1.5 rounded-full font-mono text-xs font-black transition shadow-[2px_2px_0px_#080808] flex items-center gap-1.5 cursor-pointer"
              title="Download standardized GeoJSON dataset for GIS mapping"
            >
              <span>📥</span>
              <span className="hidden sm:inline">Export GeoJSON</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close heritage map"
              className="w-10 h-10 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808] cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border-b-2 border-brandBlack px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-black text-neutral-500">FILTER:</span>
            {[
              { id: "ALL", label: "All Loci" },
              { id: "RITUAL", label: "Living Rituals" },
              { id: "CLASSICAL", label: "Classical Arts" },
              { id: "TOPOGRAPHY", label: "Sacred Hills" },
              { id: "SACRED_GROVE", label: "Sacred Groves" },
              { id: "CRAFT", label: "Artisan Guilds" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  Soundtrack.playClick();
                  setFilterCategory(f.id);
                }}
                className={`text-xs font-mono font-black px-3 py-1 rounded-full border-2 border-brandBlack transition shadow-[2px_2px_0px_#080808] ${
                  filterCategory === f.id
                    ? "bg-brandPink text-white"
                    : "bg-white text-brandBlack hover:bg-brandYellow"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search site, district..."
              className="w-full px-3 py-1.5 bg-neutral-100 border-2 border-brandBlack rounded-full text-xs font-mono font-bold focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Main Content Area: Map / Visual Plot & Details Panel */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x-4 divide-brandBlack">
          {/* Left Column: Interactive Map */}
          <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-white relative">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-black uppercase text-brandPink flex items-center gap-1.5">
                  <span>✦</span>
                  <span>
                    {mapLayer === "TERRAIN"
                      ? "GEOGRAPHICAL TOPOGRAPHY (ELEVATION & RELIEF)"
                      : mapLayer === "STANDARD"
                      ? "OPENSTREETMAP CARTOGRAPHY"
                      : "CULTURAL ILLUSTRATED TERRAIN"}
                  </span>
                </span>
                <p className="text-xs text-neutral-600 font-sans font-bold">
                  Interactive geographical map with real terrain contours and GPS markers.
                </p>
              </div>

              {/* Map Layer Switcher */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-full border border-brandBlack">
                <button
                  onClick={() => {
                    Soundtrack.playClick();
                    setMapLayer("TERRAIN");
                  }}
                  className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-full transition cursor-pointer ${
                    mapLayer === "TERRAIN"
                      ? "bg-brandPink text-white shadow-[1px_1px_0px_#080808]"
                      : "text-brandBlack hover:text-brandPink"
                  }`}
                >
                  ⛰️ Topography
                </button>
                <button
                  onClick={() => {
                    Soundtrack.playClick();
                    setMapLayer("STANDARD");
                  }}
                  className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-full transition cursor-pointer ${
                    mapLayer === "STANDARD"
                      ? "bg-brandPink text-white shadow-[1px_1px_0px_#080808]"
                      : "text-brandBlack hover:text-brandPink"
                  }`}
                >
                  🗺️ Standard
                </button>
                <button
                  onClick={() => {
                    Soundtrack.playClick();
                    setMapLayer("ILLUSTRATED");
                  }}
                  className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-full transition cursor-pointer ${
                    mapLayer === "ILLUSTRATED"
                      ? "bg-brandPink text-white shadow-[1px_1px_0px_#080808]"
                      : "text-brandBlack hover:text-brandPink"
                  }`}
                >
                  🎨 Illustrated
                </button>
              </div>
            </div>

            {/* Map Frame */}
            <div className="relative w-full h-80 sm:h-96 bg-[#FFFDE0] border-4 border-brandBlack rounded-2xl overflow-hidden shadow-[6px_6px_0px_#080808]">
              {mapLayer !== "ILLUSTRATED" ? (
                <>
                  {/* Leaflet DOM container */}
                  <div
                    ref={mapContainerRef}
                    key={mapLayer}
                    className="w-full h-full"
                    style={{ minHeight: "320px", width: "100%", height: "100%" }}
                  />

                  {/* Leaflet attribution styling */}
                  <div className="absolute bottom-1.5 left-2 bg-white/90 border border-brandBlack px-2 py-0.5 rounded text-[9px] font-mono font-bold text-neutral-700 pointer-events-auto z-1000">
                    {mapLayer === "TERRAIN" ? "⛰️ OpenTopoMap Physical Terrain" : "🗺️ OpenStreetMap Geographical"}
                  </div>
                </>
              ) : (
                /* High-Contrast Illustrated Cultural Topography Map */
                <div className="w-full h-full flex items-center justify-center relative p-4 bg-[#FFFDE0]">
                  <div className="absolute top-3 left-3 text-[10px] font-mono font-bold text-neutral-400">
                    LAT: 8.3°N – 12.8°N<br />
                    LNG: 74.8°E – 77.4°E
                  </div>
                  <div className="absolute top-3 right-3 font-mono text-xs font-black text-brandBlack bg-white px-2 py-0.5 rounded border border-brandBlack">
                    NORTH ↑
                  </div>

                  <svg viewBox="0 0 400 320" className="w-full h-full max-w-[380px] drop-shadow-md">
                    <path
                      d="M 120 20 C 140 40, 160 80, 180 120 C 200 160, 220 200, 250 250 C 270 280, 290 300, 310 315 L 290 315 C 240 280, 200 230, 160 170 C 130 120, 100 60, 90 25 Z"
                      fill="#FFFC00"
                      stroke="#080808"
                      strokeWidth="3"
                    />
                    <path
                      d="M 140 20 L 290 315"
                      stroke="#FF087D"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      opacity="0.4"
                    />

                    <text x="35" y="160" fontFamily="monospace" fontSize="11" fontWeight="bold" fill="#080808" opacity="0.4">
                      ARABIAN SEA
                    </text>
                    <text x="235" y="70" fontFamily="monospace" fontSize="11" fontWeight="bold" fill="#080808" opacity="0.4">
                      WESTERN GHATS
                    </text>

                    {HERITAGE_SITES.map((site) => {
                      const normY = 40 + ((12.2 - site.coordinates.lat) / 3.0) * 250;
                      const normX = 110 + ((site.coordinates.lng - 75.1) / 1.7) * 170;
                      const isSelected = selectedSite.id === site.id;

                      return (
                        <g
                          key={site.id}
                          onClick={() => {
                            Soundtrack.playModalPop();
                            setSelectedSite(site);
                          }}
                          className="cursor-pointer group"
                        >
                          {isSelected && (
                            <circle cx={normX} cy={normY} r="18" fill="#FF087D" opacity="0.3" className="animate-ping" />
                          )}
                          <circle
                            cx={normX}
                            cy={normY}
                            r={isSelected ? 10 : 7}
                            fill={isSelected ? "#FF087D" : site.unescoStatus ? "#080808" : "#FFFFFF"}
                            stroke="#080808"
                            strokeWidth="2.5"
                            className="transition-all duration-150 group-hover:scale-125"
                          />
                          <circle cx={normX} cy={normY} r={isSelected ? 4 : 3} fill={isSelected ? "#FFFFFF" : site.unescoStatus ? "#FFFC00" : "#FF087D"} />
                          <text
                            x={normX + 12}
                            y={normY + 4}
                            fontFamily="monospace"
                            fontSize={isSelected ? "11" : "9"}
                            fontWeight="bold"
                            fill={isSelected ? "#FF087D" : "#080808"}
                            className="pointer-events-none transition-all drop-shadow-sm"
                          >
                            {site.name.split(" ")[0]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>

            {/* Quick-Site Selector Pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {filteredSites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => handleSelectSite(site)}
                  className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border-2 border-brandBlack transition cursor-pointer ${
                    selectedSite.id === site.id
                      ? "bg-brandPink text-white shadow-[2px_2px_0px_#080808]"
                      : "bg-neutral-50 text-brandBlack hover:bg-brandYellow"
                  }`}
                >
                  📍 {site.name.split("&")[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Deep-Dive Provenance & Custodian Record */}
          <div className="lg:col-span-5 p-6 bg-[#FFFDE0] flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Category Badge & UNESCO Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-black bg-brandPink text-white px-2.5 py-0.5 rounded border border-brandBlack shadow-[2px_2px_0px_#080808]">
                  {selectedSite.categoryLabel}
                </span>
                {selectedSite.unescoStatus && (
                  <span className="font-mono text-[10px] font-black bg-brandYellow text-brandBlack px-2.5 py-0.5 rounded border border-brandBlack shadow-[2px_2px_0px_#080808]">
                    ★ UNESCO LIVING HERITAGE
                  </span>
                )}
              </div>

              {/* Title & Malayalam Script */}
              <div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-black text-brandBlack leading-tight">
                  {selectedSite.name}
                </h3>
                <span className="font-malayalam text-lg font-bold text-brandPink block mt-0.5">
                  {selectedSite.nameMalayalam}
                </span>
                <span className="font-mono text-xs text-neutral-600 block mt-1">
                  📍 {selectedSite.district} • {selectedSite.coordinates.lat.toFixed(4)}°N, {selectedSite.coordinates.lng.toFixed(4)}°E
                </span>
              </div>

              {/* Historical Significance Card */}
              <div className="bg-white p-4 rounded-xl border-2 border-brandBlack shadow-[3px_3px_0px_#080808] space-y-2">
                <span className="font-mono text-[10px] font-black uppercase text-brandPink block">
                  ✦ Historical Topography
                </span>
                <p className="text-xs sm:text-sm font-semibold text-brandBlack leading-relaxed">
                  {selectedSite.historicalSignificance}
                </p>
              </div>

              {/* Oral Tradition & Custodian Lineage */}
              <div className="bg-white p-4 rounded-xl border-2 border-brandBlack shadow-[3px_3px_0px_#080808] space-y-2">
                <span className="font-mono text-[10px] font-black uppercase text-brandPink block">
                  ✦ Living Custodians &amp; Oral Lineage
                </span>
                <p className="text-xs text-neutral-800 leading-relaxed font-semibold">
                  {selectedSite.oralTraditionSummary}
                </p>
                <div className="pt-2 border-t border-neutral-200 text-[11px] font-mono text-neutral-600">
                  <span className="font-black text-brandBlack">Custodians: </span>
                  {selectedSite.custodian}
                </div>
              </div>

              {/* Source Verification Citation */}
              <div className="text-[11px] font-mono bg-neutral-100 p-3 rounded-lg border border-neutral-300 text-neutral-700">
                <span className="font-bold text-brandBlack block">Academic Citation:</span>
                <span>{selectedSite.sourceCitation}</span>
                <a
                  href={selectedSite.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brandPink font-bold block mt-1 hover:underline"
                >
                  Verify at Source Portal ↗
                </a>
              </div>
            </div>

            {/* Jump to Connected Story Button */}
            <div className="pt-4 border-t-2 border-brandBlack">
              <button
                onClick={() => {
                  Soundtrack.playModalPop();
                  const targetStory = stories.find(
                    (s) => s.id === selectedSite.associatedStoryId
                  );
                  if (targetStory) {
                    onSelectStory(targetStory);
                    onClose();
                  }
                }}
                className="w-full bg-brandPink hover:bg-brandBlack text-white font-mono text-xs sm:text-sm font-black py-3 px-4 rounded-xl border-2 border-brandBlack shadow-[4px_4px_0px_#080808] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📖</span>
                <span>Read Story: {selectedSite.associatedStoryTitle} →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
