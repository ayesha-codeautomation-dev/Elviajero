export default {
    name: "waterSports",
    type: "document",
    title: "Water Sports",
    fields: [
      {
        name: "sectionTitle",
        type: "string",
        title: "Section Title",
        description: "Title for the Water Sports section (e.g., 'skiing').",
      },
      {
        name: "sectionDescription",
        type: "text",
        title: "Section Description",
        description: "A brief description of the Water Sports section.",
      },
      {
        name: "waterSports",
        type: "array",
        title: "Water Sports",
        description: "List of Water Sports available.",
        of: [
          {
            type: "object",
            fields: [
              {
                name: "title",
                type: "string",
                title: "Water Sports Title",
                description: "The name of Water Sport.",
              },
              {
                name: "description",
                type: "text",
                title: "Description",
                description: "A brief description of the sport.",
              },
              {
                name: "image",
                type: "image",
                title: "Image",
                description: "An image of the Water Sport.",
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
                description: "The rental price (e.g., '$50/hour').",
              },
            ],
          },
        ],
      },
    ],
  };
  