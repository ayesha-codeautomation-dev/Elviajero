// schemas/faq.js
export default {
    name: 'faq',
    title: 'Frequently Asked Questions',
    type: 'document',
    fields: [
      {
        name: 'question',
        title: 'Question',
        type: 'string',
        description: 'The question that will be displayed in the FAQ.',
      },
      {
        name: 'answer',
        title: 'Answer',
        type: 'text',
        description: 'The answer to the FAQ.',
      },
    ],
    preview: {
      select: {
        title: 'question',
        subtitle: 'answer',
      },
    },
  };
  