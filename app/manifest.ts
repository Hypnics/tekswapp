import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TekSwapp',
    short_name: 'TekSwapp',
    description:
      'Verified marketplace for buying and selling premium second-hand electronics.',
    start_url: '/',
    display: 'standalone',
    background_color: '#112a4d',
    theme_color: '#112a4d',
    icons: [
      {
        src: '/icon.png?v=2',
        sizes: '256x256',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png?v=2',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon.ico?v=2',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
