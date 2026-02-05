export const fetchSuggestions = async (query: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&autocomplete=true&types=place,region,postcode,locality`
      );
      const data = await response.json();
      return data.features || [];
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
    }
  };
  
