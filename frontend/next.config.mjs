import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
  try {
    initOpenNextCloudflareForDev();
  } catch (err) {
    console.warn("Could not initialize OpenNext Cloudflare dev proxy:", err?.message);
  }
}

const nextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
