export default {
  name: "boatRental",
  type: "document",
  title: "Boat Rental",
  fields: [
    {
      name: "sectionTitle",
      type: "string",
      title: "Section Title",
      description: "Title for the boat rental section (e.g., 'Boat Rental').",
    },
    {
      name: "sectionDescription",
      type: "text",
      title: "Section Description",
      description: "A brief description of the boat rental section.",
    },
    {
      name: "boats",
      type: "array",
      title: "Boats",
      description: "List of boats available for rent.",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "title",
              type: "string",
              title: "Boat Title",
              description: "The name or model of the boat.",
            },
            {
              name: "description",
              type: "text",
              title: "Description",
              description: "A brief description of the boat.",
            },
            {
              name: "image",
              type: "image",
              title: "Image",
              description: "An image of the boat.",
              options: {
                hotspot: true, // Enables hotspot cropping
              },
              fields: [
                {
                  name: "alt",
                  type: "string",
                  title: "Alt Text",
                  description: "Alternative text for the image (important for accessibility).",
                },
              ],
            },
            {
              name: "price",
              type: "string",
              title: "Price",
              description: "The rental price (e.g., '$150/hour').",
            },
          ],
        },
      ],
    },
  ],
};
