// schemas/safetyInformation.js

export default {
    name: 'safetyInformation',
    title: 'Safety Information',
    type: 'document',
    fields: [
      {
        name: 'heading',
        title: 'Heading',
        type: 'string',
        description: 'Main heading for the Safety Information page',
      },
      {
        name: 'description',
        title: 'Description',
        type: 'text',
        description: 'Introduction text or description for the page',
      },
      {
        name: 'safetyDetails',
        title: 'Safety Details',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              {
                name: 'title',
                title: 'Title',
                type: 'string',
              },
              {
                name: 'description',
                title: 'Description',
                type: 'text',
              },
              {
                name: 'icon',
                title: 'Icon',
                type: 'string',
                description: 'Icon for the safety item (emoji or text)',
              },
            ],
          },
        ],
      },
    ],
  };
  