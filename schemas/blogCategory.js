// not used in script, reference only

export default {
  name: 'blogCategory',
  title: 'Blog Category',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => [Rule.required()],
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => [Rule.required()],
      options: {
        source: 'title',
      },
    },
    {
      name: 'shouldDisplayInNav',
      title: 'Should display in navigation?',
      description: 'Set to true if you want it to display this blog category as subcategory in navigation',
      type: 'boolean',
    },
  ],
};
