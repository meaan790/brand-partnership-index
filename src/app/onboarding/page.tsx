"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  name: string;
  city: string;
  region: string;
  country: string;
  place_id: string;
}

function extractPlaceDetails(
  place: google.maps.places.PlaceResult,
  placeId: string,
): PlaceDetails {
  const components = place.address_components || [];
  let city = "";
  let region = "";
  let country = "";

  for (const c of components) {
    if (c.types.includes("locality")) city = c.long_name;
    else if (c.types.includes("sublocality_level_1") && !city) city = c.long_name;
    else if (c.types.includes("administrative_area_level_1")) region = c.short_name;
    else if (c.types.includes("country")) country = c.short_name;
  }

  return {
    name: place.name || "",
    city,
    region,
    country,
    place_id: placeId,
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<"retailer" | "brand" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Retailer fields
  const [storeQuery, setStoreQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const placesDiv = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Brand fields
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [placesReady, setPlacesReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/");
        return;
      }
      const r = data.user.user_metadata?.role;
      setRole(r === "brand" ? "brand" : "retailer");
      setLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (role !== "retailer") return;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey) return;

    if (typeof google !== "undefined" && google.maps?.places) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      if (placesDiv.current) {
        placesService.current = new google.maps.places.PlacesService(placesDiv.current);
      }
      setPlacesReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      if (placesDiv.current) {
        placesService.current = new google.maps.places.PlacesService(placesDiv.current);
      }
      setPlacesReady(true);
    };
    document.head.appendChild(script);
  }, [role]);

  const searchPlaces = useCallback(
    (query: string) => {
      if (!autocompleteService.current || query.length < 2) {
        setPredictions([]);
        return;
      }
      autocompleteService.current.getPlacePredictions(
        { input: query, types: ["establishment"] },
        (results) => {
          setPredictions(
            (results || []).slice(0, 6) as PlacePrediction[],
          );
        },
      );
    },
    [],
  );

  function handleStoreInput(value: string) {
    setStoreQuery(value);
    setSelectedPlace(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlaces(value), 250);
  }

  function selectPrediction(prediction: PlacePrediction) {
    if (!placesService.current) return;
    placesService.current.getDetails(
      { placeId: prediction.place_id, fields: ["name", "address_components"] },
      (place) => {
        if (!place) return;
        const details = extractPlaceDetails(place, prediction.place_id);
        setSelectedPlace(details);
        setStoreQuery(prediction.description);
        setPredictions([]);
      },
    );
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    if (role === "retailer" && selectedPlace) {
      await supabase.from("profiles").update({
        company_name: selectedPlace.name,
        store_city: selectedPlace.city,
        store_region: selectedPlace.region,
        country: selectedPlace.country,
        place_id: selectedPlace.place_id,
      }).eq("id", user.id);
    } else if (role === "brand") {
      await supabase.from("profiles").update({
        company_name: companyName,
      }).eq("id", user.id);
    }

    router.replace("/dashboard");
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
          <h1 className="font-display-lg text-display-lg text-white mb-3">
            Complete your profile
          </h1>
          <p className="font-body-lg text-body-lg text-white/70">
            {role === "retailer"
              ? "Tell us where your store is so your reviews show the right region."
              : "Tell us about your company."}
          </p>
        </div>
      </section>

      <div className="max-w-lg mx-auto px-margin-mobile md:px-margin-desktop py-12">
        {role === "retailer" ? (
          <div>
            <label className="font-body-md text-body-md font-semibold text-primary block mb-2">
              Where&apos;s your store?
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-caption text-xl">
                storefront
              </span>
              <input
                type="text"
                value={storeQuery}
                onChange={(e) => handleStoreInput(e.target.value)}
                placeholder={placesReady ? "Start typing your store name or address…" : "Loading Google Places…"}
                disabled={!placesReady}
                className="w-full rounded-xl pl-12 pr-4 py-4 font-body-md text-body-md text-text-main placeholder:text-text-caption bg-surface-card border border-border-hairline focus:ring-2 focus:ring-accent focus:outline-none transition-shadow disabled:opacity-50"
                autoFocus
              />
              {predictions.length > 0 && (
                <div className="absolute z-20 top-full mt-1 w-full bg-white border border-border-hairline rounded-xl shadow-xl max-h-72 overflow-y-auto">
                  {predictions.map((p) => (
                    <button
                      key={p.place_id}
                      onClick={() => selectPrediction(p)}
                      className="w-full flex flex-col px-4 py-3 hover:bg-surface-container-low transition-colors cursor-pointer text-left border-b border-border-hairline last:border-b-0"
                    >
                      <span className="font-body-md text-body-md text-on-background">
                        {p.structured_formatting.main_text}
                      </span>
                      <span className="font-caption text-caption text-text-caption">
                        {p.structured_formatting.secondary_text}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY && (
              <p className="font-caption text-caption text-text-caption mt-3">
                Google Places is not configured. You can skip this step for now.
              </p>
            )}

            {selectedPlace && (
              <div className="mt-6 bg-surface-container-low rounded-lg p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-accent text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <div>
                  <p className="font-body-md text-body-md font-semibold text-primary">
                    {selectedPlace.name}
                  </p>
                  <p className="font-caption text-caption text-text-caption">
                    {[selectedPlace.city, selectedPlace.region, selectedPlace.country].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-body-md text-body-md font-semibold text-primary block mb-2">
                Company name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Brooks Running"
                className="w-full rounded-xl px-4 py-4 font-body-md text-body-md text-text-main placeholder:text-text-caption bg-surface-card border border-border-hairline focus:ring-2 focus:ring-accent focus:outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="font-body-md text-body-md font-semibold text-primary block mb-2">
                Your role / title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. VP of Sales"
                className="w-full rounded-xl px-4 py-4 font-body-md text-body-md text-text-main placeholder:text-text-caption bg-surface-card border border-border-hairline focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <button
            onClick={handleSave}
            disabled={saving || (role === "retailer" && !selectedPlace && !!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY) || (role === "brand" && !companyName.trim())}
            className="flex-1 bg-primary text-on-primary font-semibold py-4 rounded-full hover:opacity-90 transition-opacity active:scale-[0.98] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Continue"}
          </button>
          <button
            onClick={() => router.replace("/dashboard")}
            className="px-6 py-4 border border-border-hairline text-primary font-semibold rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Skip
          </button>
        </div>
      </div>
    </>
  );
}
