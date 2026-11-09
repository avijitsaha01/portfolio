import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    alt: z.string(),
    liveUrl: z.url(),
    repoUrl: z.url().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(true),
    order: z.number().default(0),
  }),
});

const experience = defineCollection({
  loader: glob({ base: './src/content/experience', pattern: '**/*.md' }),
  schema: z.object({
    role: z.string(),
    company: z.string(),
    location: z.string(),
    period: z.string(),
    tags: z.array(z.string()).default([]),
    order: z.number().default(0),
  }),
});

const education = defineCollection({
  loader: glob({ base: './src/content/education', pattern: '**/*.md' }),
  schema: z.object({
    school: z.string(),
    url: z.url(),
    kind: z.string(),
    location: z.string(),
    program: z.string(),
    icon: z.enum(['graduation', 'code']).default('graduation'),
    coursework: z.array(z.string()).default([]),
    order: z.number().default(0),
  }),
});

const skills = defineCollection({
  loader: glob({ base: './src/content/skills', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    order: z.number().default(0),
    items: z
      .array(
        z.object({
          name: z.string(),
          icon: z.string(),
        }),
      )
      .default([]),
  }),
});

export const collections = { projects, experience, education, skills };
