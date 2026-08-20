import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

try {
  initOpenNextCloudflareForDev();
} catch (e) {
  // Ignore in standard next dev if Cloudflare dev proxy context is unavailable
}

const nextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

