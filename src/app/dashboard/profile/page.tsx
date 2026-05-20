"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: { main_text: string; secondary_text: string };
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [role, setRole] = useState<string>("");
  const [email, setEmail] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [storeCity, setStoreCity] = useState("");
  const [storeRegion, setStoreRegion] = useState("");
  const [country, setCountry] = useState("");
  const [placeId, setPlaceId] = useState("");

  // Places autocomplete
  const [storeQuery, setStoreQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [placesReady, setPlacesReady] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const placesDiv = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/profile");
      if (!res.ok) { router.replace("/"); return; }
      const p = await res.json();
      setEmail(p.email || "");
      setRole(p.role || "retailer");
      setCompanyName(p.company_name || "");
      setStoreCity(p.store_city || "");
      setStoreRegion(p.store_region || "");
      setCountry(p.country || "");
      setPlaceId(p.place_id || "");
      setStoreQuery(p.company_name || "");
      setLoading(false);
    }
    load();
  }, [router]);

  useEffect(() => {
    if (role !== "retailer") return;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey) return;
    if (typeof google !== "undefined" && google.maps?.places) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      if (placesDiv.current) placesService.current = new google.maps.places.PlacesService(placesDiv.current);
      setPlacesReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      if (placesDiv.current) placesService.current = new google.maps.places.PlacesService(placesDiv.current);
      setPlacesReady(true);
    };
    document.head.appendChild(script);
  }, [role]);

  const searchPlaces = useCallback((query: string) => {
    if (!autocompleteService.current || query.length < 2) { setPredictions([]); return; }
    autocompleteService.current.getPlacePredictions(
      { input: query, types: ["establishment"] },
      (results) => setPredictions((results || []).slice(0, 6) as PlacePrediction[]),
    );
  }, []);

  function handleStoreInput(value: string) {
    setStoreQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlaces(value), 250);
  }

  function selectPrediction(prediction: PlacePrediction) {
    if (!placesService.current) return;
    placesService.current.getDetails(
      { placeId: prediction.place_id, fields: ["name", "address_components"] },
      (place) => {
        if (!place) return;
        const components = place.address_components || [];
        let city = "", region = "", ctry = "";
        for (const c of components) {
          if (c.types.includes("locality")) city = c.long_name;
          else if (c.types.includes("sublocality_level_1") && !city) city = c.long_name;
          else if (c.types.includes("administrative_area_level_1")) region = c.short_name;
          else if (c.types.includes("country")) ctry = c.short_name;
        }
        setCompanyName(place.name || "");
        setStoreCity(city);
        setStoreRegion(region);
        setCountry(ctry);
        setPlaceId(prediction.place_id);
        setStoreQuery(prediction.description);
        setPredictions([]);
      },
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const body: Record<string, string> = { company_name: companyName };
    if (role === "retailer") {
      body.store_city = storeCity;
      body.store_region = storeRegion;
      body.country = country;
      body.place_id = placeId;
    }
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div ref={placesDiv} className="hidden" />

      <section className="bg-primary pt-16 md:pt-20 pb-12 md:pb-14">
        <div className="max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <h1 className="font-display-lg text-display-lg text-white mb-3">Your Profile</h1>
          <p className="font-body-lg text-body-lg text-white/70">
            Manage your account details.
          </p>
        </div>
      </section>

      <div className="max-w-lg mx-auto px-margin-mobile md:px-margin-desktop py-12">
        {/* Email (read-only) */}
        <div className="mb-6">
          <label className="font-body-md text-body-md font-semibold text-primary block mb-2">Email</label>
          <input type="email" value={email} disabled
            className="w-full rounded-xl px-4 py-3 font-body-md text-body-md text-text-caption bg-surface-container-low border border-border-hairline cursor-not-allowed" />
        </div>

        {/* Role badge */}
        <div className="mb-6">
          <label className="font-body-md text-body-md font-semibold text-primary block mb-2">Role</label>
          <span className="inline-flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              {role === "brand" ? "corporate_fare" : "storefront"}
            </span>
            <span className="font-data-tabular text-data-tabular text-primary capitalize">{role}</span>
          </span>
        </div>

        {/* Company / Store Name */}
        <div className="mb-6">
          <label className="font-body-md text-body-md font-semibold text-primary block mb-2">
            {role === "retailer" ? "Store Name" : "Company Name"}
          </label>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-xl px-4 py-3 font-body-md text-body-md text-text-main bg-surface-card border border-border-hairline focus:ring-2 focus:ring-accent focus:outline-none" />
        </div>

        {/* Retailer-specific: store location */}
        {role === "retailer" && (
          <>
            <div className="mb-6">
              <label className="font-body-md text-body-md font-semibold text-primary block mb-2">
                Store Location
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-caption text-xl">storefront</span>
                <input type="text" value={storeQuery} onChange={(e) => handleStoreInput(e.target.value)}
                  placeholder={placesReady ? "Search for your store…" : "Loading Google Places…"}
                  disabled={!placesReady}
                  className="w-full rounded-xl pl-12 pr-4 py-3 font-body-md text-body-md text-text-main placeholder:text-text-caption bg-surface-card border border-border-hairline focus:ring-2 focus:ring-accent focus:outline-none disabled:opacity-50" />
                {predictions.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-white border border-border-hairline rounded-xl shadow-xl max-h-72 overflow-y-auto">
                    {predictions.map((p) => (
                      <button key={p.place_id} onClick={() => selectPrediction(p)}
                        className="w-full flex flex-col px-4 py-3 hover:bg-surface-container-low transition-colors cursor-pointer text-left border-b border-border-hairline last:border-b-0">
                        <span className="font-body-md text-body-md text-on-background">{p.structured_formatting.main_text}</span>
                        <span className="font-caption text-caption text-text-caption">{p.structured_formatting.secondary_text}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {storeCity && (
                <p className="font-caption text-caption text-text-caption mt-2">
                  {[storeCity, storeRegion, country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </>
        )}

        {/* Save */}
        <div className="flex items-center gap-3 mt-8">
          <button onClick={handleSave} disabled={saving}
            className="bg-primary text-on-primary font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-30">
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <Link href="/dashboard" className="px-6 py-3 border border-border-hairline text-primary font-semibold rounded-full hover:bg-surface-container-low transition-colors">
            Back to Dashboard
          </Link>
          {saved && (
            <span className="font-caption text-caption text-score-high flex items-center gap-1">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Saved
            </span>
          )}
        </div>
      </div>
    </>
  );
}
