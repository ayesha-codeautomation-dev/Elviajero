import { Rule } from "sanity";

export default {
  name: "gallery",
  type: "document",
  title: "Gallery",
  fields: [
    {
        name: "galleryHeading",
        title: "Gallery Heading",
        type: "string",
      },
    {
      name: "locations",
      type: "array",
      title: "Locations",
      description: "Add up to 6 locations for the gallery.",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              type: "string",
              title: "Location Name",
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: "image",
              type: "image",
              title: "Image",
              options: {
                hotspot: true, // Enable hotspot cropping
              },
              fields: [
                {
                  name: "alt",
                  type: "string",
                  title: "Alt Text",
                  description: "Alternative text for the image (important for accessibility).",
                  validation: (Rule: Rule) => Rule.required(),
                },
              ],
              validation: (Rule: Rule) => Rule.required(),
            },
          ],
        },
      ],
      validation: (Rule: Rule) =>
        Rule.required()
          .min(6)
          .max(6)
          .error("You must add exactly 6 locations to the gallery."),
    },
  ],
};
