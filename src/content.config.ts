import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Each blog post is a Markdown (.md) or MDX (.mdx) file in src/content/blog/.
// The file name becomes the URL: src/content/blog/my-post.md → /blog/my-post
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      // drafts show up while you run `npm run dev`, but are left out of the live site
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
