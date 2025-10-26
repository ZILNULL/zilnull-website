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

const logs = defineCollection({
  type: 'content',
  schema: z.object({
    // Index:
    title: z.string().optional(),
    type: z.enum(["game","movie","series","book","other"]).optional(),
    description: z.string().optional(),
    cover: z.string().optional(),

    // For parts:
    partTitle: z.string().optional(),
    order: z.number().optional(),
    date: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
  })
});

export const collections = { blogs, logs };
