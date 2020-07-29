// not used in script, reference only

export default {
  name: 'employee',
  title: 'Employee',
  type: 'document',
  description: 'Name Surname',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => [Rule.required()],
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'position',
      title: 'Position',
      type: 'string',
      validation: (Rule) => [Rule.required()],
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
};
