/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.vercel-blob.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }
    ]
  }
}

export default nextConfig
