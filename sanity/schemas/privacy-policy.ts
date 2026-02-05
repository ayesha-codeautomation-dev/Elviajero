// schemas/privacyPolicy.js

export default {
    name: 'privacyPolicy',
    title: 'Privacy Policy',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
            description: 'The main title of the privacy policy page',
        },
        {
            name: 'description',
            title: 'Description',
            type: 'text',
            description: 'A short description or introductory paragraph for the privacy policy page',
        },
        {
            name: 'content',
            title: 'Content',
            type: 'array',
            of: [{ type: 'block' }],
            description: 'The content of the section, written in Portable Text format',
        },
    ],
}
