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
      // Topp 100 blev Veckans topplista 2026-11-16.
      { source: "/topp-100", destination: "/topplista", permanent: true },
      { source: "/basta-orangevin-systembolaget", destination: "/orange", permanent: true },
      { source: "/basta-pet-nat-systembolaget", destination: "/pet-nat", permanent: true },
      // Barguiden gäller hela Sverige sedan 2026-11-11.
      { source: "/basta-naturvinsbarer-stockholm", destination: "/naturvinsbarer#stockholm", permanent: true },
      ...["tranan-stockholm", "stockholm-ost-chark"]
        .map((slug) => ({ source: `/naturvinsbarer/${slug}`, destination: "/naturvinsbarer", permanent: true })),
    ];
  },
};

export default nextConfig;
