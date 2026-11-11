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
      // Barguiden gäller hela Sverige sedan 2026-11-11.
      { source: "/basta-naturvinsbarer-stockholm", destination: "/naturvinsbarer#stockholm", permanent: true },
      ...["matbaren-mathias-dahlgren-stockholm", "tranan-stockholm", "bar-oas-stockholm", "fabelbar-stockholm", "stockholm-ost-chark"]
        .map((slug) => ({ source: `/naturvinsbarer/${slug}`, destination: "/naturvinsbarer", permanent: true })),
    ];
  },
};

export default nextConfig;
