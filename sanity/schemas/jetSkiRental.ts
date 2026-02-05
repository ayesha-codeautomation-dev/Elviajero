export default {
    name: "jetSkiRental",
    type: "document",
    title: "JetSkis Rental",
    fields: [
      {
        name: "sectionTitle",
        type: "string",
        title: "Section Title",
        description: "Title for the JetSkis rental section (e.g., 'JetSkis Rental').",
      },
      {
        name: "sectionDescription",
        type: "text",
        title: "Section Description",
        description: "A brief description of the JetSkis rental section.",
      },
      {
        name: "jetSkis",
        type: "array",
        title: "JetSkis",
        description: "List of JetSkis available for rent.",
        of: [
          {
            type: "object",
            fields: [
              {
                name: "title",
                type: "string",
                title: "JetSkis Title",
                description: "The name or model of the JetSkis.",
              },
              {
                name: "description",
                type: "text",
                title: "Description",
                description: "A brief description of the JetSkis.",
              },
              {
                name: "image",
                type: "image",
                title: "Image",
                description: "An image of the JetSki.",
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
                description: "The rental price (e.g., '$100/hour').",
              },
            ],
          },
        ],
      },
    ],
  };
  