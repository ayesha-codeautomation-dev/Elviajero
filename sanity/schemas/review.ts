// schemas/review.js
export default {
    name: "review",
    title: "Review",
    type: "document",
    fields: [
      {
        name: "image",
        title: "Profile Image",
        type: "image",
        options: {
            hotspot: true
        },
    },
      {
        name: "author",
        title: "Name",
        type: "string",
      },
      {
        name: "location",
        title: "Location",
        type: "string",
      },
      {
        name: "quote",
        title: "Review",
        type: "text",
      },
      {
        name: "customerPhotos",
        title: "Photos",
        type: "array",
        of: [{ type: "image" }],
      },
    ],
  };
