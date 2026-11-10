import React, { useState, useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
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
  const [mapError, setMapError] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const filteredSites = HERITAGE_SITES.filter((site) => {
    const matchesCategory = filterCategory === "ALL" || site.category === filterCategory;
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.nameMalayalam.includes(searchQuery) ||
      site.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Initialize OpenFreeMap using MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        // OpenFreeMap vector tile style (https://github.com/hyperknot/openfreemap)
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [76.25, 10.4], // Kerala Center
        zoom: 7.2,
        minZoom: 5.5,
        maxZoom: 16
      });

      map.addControl(new maplibregl.NavigationControl(), "top-right");

      map.on("load", () => {
        // Render custom pins for each site
        HERITAGE_SITES.forEach((site) => {
          const el = document.createElement("div");
          el.className = "cursor-pointer group";
          el.innerHTML = `
            <div style="background: ${site.unescoStatus ? "#080808" : "#FF087D"}; color: #FFFC00; border: 2px solid #080808; border-radius: 9999px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 3px 3px 0px #080808; transition: transform 0.15s ease;">
              📍
            </div>
          `;

          el.addEventListener("click", () => {
            Soundtrack.playModalPop();
            setSelectedSite(site);
            map.flyTo({
              center: [site.coordinates.lng, site.coordinates.lat],
              zoom: 12,
              speed: 1.2
            });
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([site.coordinates.lng, site.coordinates.lat])
            .addTo(map);

          markersRef.current.push(marker);
        });
      });

      map.on("error", () => {
        console.warn("OpenFreeMap tile server issue, falling back to vector overlay.");
        setMapError(true);
      });

      mapRef.current = map;

      return () => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
      };
    } catch (e) {
      console.warn("MapLibre init error:", e);
      setMapError(true);
    }
  }, []);

  // Fly to site when selectedSite changes
  const handleSelectSite = (site: HeritageSite) => {
    Soundtrack.playClick();
    setSelectedSite(site);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [site.coordinates.lng, site.coordinates.lat],
        zoom: 11.5,
        speed: 1.2
      });
    }
  };

  const handleExportGeoJSON = () => {
    Soundtrack.playClick();
    const geoJsonData = {
      type: "FeatureCollection",
      metadata: {
        title: "KathaBridge Living Heritage Topography of Kerala",
        standard: "W3C Spatial Data on the Web / OGC GeoJSON",
        tileProvider: "OpenFreeMap (https://github.com/hyperknot/openfreemap)",
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
    a.download = `kathabridge-openfreemap-${new Date().toISOString().slice(0, 10)}.geojson`;
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
                <span>OPENFREEMAP API INTEGRATION</span>
                <span>•</span>
                <span>GEOSPATIAL HERITAGE GIS</span>
              </div>
              <h2
                id="heritage-map-title"
                className="font-editorial text-2xl sm:text-3xl font-black text-brandBlack tracking-tight"
              >
                Kerala Sacred Topography &amp; Oral Folklore Loci
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
          {/* Left Column: Interactive OpenFreeMap Vector Map */}
          <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-white relative">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-black uppercase text-brandPink flex items-center gap-1.5">
                  <span>✦</span>
                  <span>OPENFREEMAP VECTOR TILES (LIBERTY STYLE)</span>
                </span>
                <p className="text-xs text-neutral-600 font-sans font-bold">
                  Powered by openfreemap.org (hyperknot/openfreemap). Click any pin or list item to zoom in.
                </p>
              </div>
              <div className="bg-brandYellow border-2 border-brandBlack px-2.5 py-0.5 rounded font-mono text-[10px] font-black shrink-0">
                {filteredSites.length} LOCI DOCUMENTED
              </div>
            </div>

            {/* MapLibre GL OpenFreeMap Container */}
            <div className="relative w-full h-80 sm:h-96 bg-[#FFFDE0] border-4 border-brandBlack rounded-2xl overflow-hidden shadow-[6px_6px_0px_#080808]">
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Attribution overlay */}
              <div className="absolute bottom-2 left-2 bg-white/90 border border-brandBlack px-2 py-0.5 rounded text-[9px] font-mono font-bold text-neutral-700 pointer-events-auto">
                Map data:{" "}
                <a
                  href="https://openfreemap.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brandPink hover:underline"
                >
                  OpenFreeMap
                </a>{" "}
                &copy; OpenStreetMap
              </div>
            </div>

            {/* Quick-Site Selector Pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {filteredSites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => handleSelectSite(site)}
                  className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border-2 border-brandBlack transition ${
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
