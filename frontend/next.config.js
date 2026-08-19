const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");

initOpenNextCloudflareForDev();

const nextConfig = {
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
