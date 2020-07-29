module.exports = {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  initialValue: () => ({
    createdAt: new Date().toISOString(),
  }),
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
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => [Rule.required()],
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: { type: 'employee' },

      validation: (Rule) => [Rule.required()],
    },
    {
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => [Rule.required()],
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'blogCategory' } }],
      validation: (Rule) => [Rule.required()],
    },
    {
      name: 'createdAt',
      title: 'Created at',
      type: 'datetime',
      validation: (Rule) => [Rule.required()],
    },
    {
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      validation: (Rule) => [Rule.required()],
    },
    // https://www.sanity.io/plugins/sanity-plugin-seo-tools
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo-tools', 
      options: {
        baseUrl: 'YOUR-BASE-URL', // (REQUIRED) This is the baseUrl for your site
        slug(doc) {
          // (REQUIRED) a function to return the sug of the current page, which will be appended to the baseUrl
          return doc.slug.current;
        },
        fetchRemote: true, // Can be set to false to disable fetching the remote source (you will need to pass the content helpers for analysis)
        content(doc) {
          return doc.body; // (OPTIONAL) If your site is generated after Sanity content updates you can use this for better real time feedback
        },
        title(doc) {
          return doc.title; // (OPTIONAL) return page title otherwise inferred from scrape
        },
        description(doc) {
          return doc.seo.meta_description; // (OPTIONAL) return page description otherwise inferred from scrape
        },
      },
    },
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'featuredImage',
    },
    prepare(selection) {
      const { author } = selection;
      return Object.assign({}, selection, {
        subtitle: author && `by ${author}`,
      });
    },
  },
};
