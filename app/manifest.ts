import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PCS Eco-System',
    short_name: 'PCS',
    description: 'Hệ sinh thái số tái chế nhựa - Plastic Circularity Station Recycling Hub',
    start_url: '/landing',
    scope: '/',
    display: 'standalone',
    theme_color: '#059669',
    background_color: '#059669',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['lifestyle', 'productivity'],
    screenshots: [
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        form_factor: 'wide',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        form_factor: 'narrow',
      },
    ],
  };
}
