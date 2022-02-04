export const docsRoutes = [
  {
    label: 'Getting Started',
    pages: [
      { title: 'Introduction', route: '/docs/intro/introduction' },
      { title: 'Installation', route: '/docs/intro/installation' },
      { title: 'Configuration', route: '/docs/intro/configuration' },
      { title: 'Themes', route: '/docs/intro/themes' },
      { title: 'Props', route: '/docs/intro/props' },
      { title: 'Benchmarks', route: '/docs/intro/benchmarks' },
      { title: 'Releases', route: 'https://github.com/tamagui/tamagui/releases' },
    ],
  },

  {
    label: 'Tamagui',
    pages: [
      { title: 'Stacks', route: '/docs/components/stacks' },
      { title: 'Text', route: '/docs/components/text' },
      { title: 'Button', route: '/docs/components/button' },
      { title: 'Linear Gradient', route: '/docs/components/linear-gradient' },
      { title: 'Headings', route: '/docs/components/headings' },
      { title: 'Visually Hidden', route: '/docs/components/visually-hidden' },
      { title: 'Forms', route: '/docs/components/forms' },
      { title: 'Tooltip', route: '/docs/components/tooltip' },
      { title: 'Drawer', route: '/docs/components/drawer' },
      // { title: 'Popover', route: '/docs/components/popover' },
      // { title: 'Grid', route: '/docs/components/grid' },
    ],
  },

  {
    label: 'Core',
    pages: [
      { title: 'styled', route: '/docs/core/styled' },
      { title: 'Stack & Text', route: '/docs/core/stack-and-text' },
      { title: 'Theme', route: '/docs/core/theme' },
      { title: 'useMedia', route: '/docs/core/use-media' },
      { title: 'useTheme', route: '/docs/core/use-theme' },
    ],
  },

  {
    label: 'Guides',
    pages: [
      { title: 'Design Systems', route: '/docs/guides/design-systems' },
      { title: 'Next.js', route: '/docs/guides/next-js' },
      { title: 'Expo', route: '/docs/guides/expo' },
    ],
  },
]

export const allDocsRoutes = docsRoutes.flatMap((x) => x.pages)
