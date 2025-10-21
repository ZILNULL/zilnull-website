import { defineCollection, z } from 'astro:content';

const blogs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    thumbnail: z.string(),
  }),
});

export const collections = { blogs };
