/** @type {import('next').NextConfig} */
const nextConfig = {
    presets: ["next/babel"],
    plugins: [["styled-components", { ssr: true }]],
    pageExtensions: ["ts", "tsx", "mdx"],
    experimental: {
        mdxRs: true,
    },
};

module.exports = nextConfig;
