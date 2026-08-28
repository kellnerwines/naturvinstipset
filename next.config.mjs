/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.blob.vercel-storage.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      { source: "/basta-orangevin-systembolaget", destination: "/orange", permanent: true },
      { source: "/basta-pet-nat-systembolaget", destination: "/pet-nat", permanent: true },
    ];
  },
};

export default nextConfig;
