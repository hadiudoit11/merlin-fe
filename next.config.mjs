// next.config.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self';
  frame-src giscus.app
`;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\n/g, ""),
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  reactStrictMode: true,
  output: "standalone", // Enable standalone output for Docker
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  eslint: {
    dirs: ["pages", "components", "lib", "layouts", "scripts"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|mp4)$/i,
      use: [
        {
          loader: "file-loader",
          options: {
            publicPath: "/_next",
            name: "static/media/[name].[hash].[ext]",
          },
        },
      ],
    });

    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default withBundleAnalyzer(config);

// import withBundleAnalyzer from '@next/bundle-analyzer';

// const withBundleAnalyzerConfig = withBundleAnalyzer({
//   enabled: process.env.ANALYZE === 'true',
// });

// // You might need to insert additional domains in script-src if you are using external services
// const ContentSecurityPolicy = `
//   default-src 'self';
//   script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app;
//   style-src 'self' 'unsafe-inline';
//   img-src * blob: data:;
//   media-src 'none';
//   connect-src *;
//   font-src 'self';
//   frame-src giscus.app
// `;

// const securityHeaders = [
//   {
//     key: 'Content-Security-Policy',
//     value: ContentSecurityPolicy.replace(/\n/g, ''),
//   },
//   {
//     key: 'Referrer-Policy',
//     value: 'strict-origin-when-cross-origin',
//   },
//   {
//     key: 'X-Frame-Options',
//     value: 'DENY',
//   },
//   {
//     key: 'X-Content-Type-Options',
//     value: 'nosniff',
//   },
//   {
//     key: 'X-DNS-Prefetch-Control',
//     value: 'on',
//   },
//   {
//     key: 'Strict-Transport-Security',
//     value: 'max-age=31536000; includeSubDomains',
//   },
//   {
//     key: 'Permissions-Policy',
//     value: 'camera=(), microphone=(), geolocation=()',
//   },
// ];

// /**
//  * @type {import('next').NextConfig}
//  **/
// const nextConfig = {
//   reactStrictMode: true,
//   pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
//   eslint: {
//     dirs: ['pages', 'components', 'lib', 'layouts', 'scripts'],
//   },
//   async headers() {
//     return [
//       {
//         source: '/(.*)',
//         headers: securityHeaders,
//       },
//     ];
//   },
//   webpack: (config, { dev, isServer }) => {
//     config.module.rules.push({
//       test: /\.(png|jpe?g|gif|mp4)$/i,
//       use: [
//         {
//           loader: 'file-loader',
//           options: {
//             publicPath: '/_next',
//             name: 'static/media/[name].[hash].[ext]',
//           },
//         },
//       ],
//     });

//     config.module.rules.push({
//       test: /\.svg$/,
//       use: ['@svgr/webpack'],
//     });

//     if (!dev && !isServer) {
//       // Replace React with Preact only in client production build
//       Object.assign(config.resolve.alias, {
//         'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
//         react: 'preact/compat',
//         'react-dom/test-utils': 'preact/test-utils',
//         'react-dom': 'preact/compat',
//       });
//     }

//     return config;
//   },
//   images: {
//     deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
//     imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
//     domains: [],
//     path: '/_next/image',
//     loader: 'default',
//     loaderFile: '',
//     disableStaticImages: false,
//     minimumCacheTTL: 60,
//     formats: ['image/webp'],
//     dangerouslyAllowSVG: false,
//     contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
//     contentDispositionType: 'inline',
//     remotePatterns: [],
//     unoptimized: false,
//   },
// };

// export default withBundleAnalyzerConfig(nextConfig);
