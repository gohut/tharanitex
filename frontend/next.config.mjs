import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
