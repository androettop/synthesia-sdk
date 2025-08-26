import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://androettop.github.io',
  base: '/synthesia-sdk',
  integrations: [
    starlight({
      title: 'Synthesia SDK',
      description: 'Complete TypeScript SDK for the Synthesia API - Create AI-generated videos programmatically.',
      logo: {
        src: './src/assets/synthesia-logo.svg',
        replacesTitle: true,
      },
      social: {
        github: 'https://github.com/synthesia-io/@androettop/synthesia-sdk',
        discord: 'https://discord.gg/synthesia',
      },
      sidebar: [
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
        },
        {
          label: 'API Reference',
          autogenerate: { directory: 'api-reference' },
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Examples',
          autogenerate: { directory: 'examples' },
        },
        {
          label: 'Resources',
          autogenerate: { directory: 'resources' },
        },
      ],
      components: {
        // Override the default `SocialIcons` component.
        SocialIcons: './src/components/SocialIcons.astro',
      },
      editLink: {
        baseUrl: 'https://github.com/synthesia-io/@androettop/synthesia-sdk/edit/main/docs/',
      },
      lastUpdated: true,
      pagination: true,
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
    }),
  ],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});