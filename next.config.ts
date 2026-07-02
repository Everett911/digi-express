import type { NextConfig } from "next";

// Define a lightweight type for webpack rule objects used here
type RuleWithTest = {
  test?: RegExp | { test: (value: string) => boolean };
  [key: string]: unknown;
};

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack(config) {
    // 1. Find the existing rule that handles SVG assets in Next.js
    const fileLoaderRule = config.module.rules.find((rule: RuleWithTest) =>
      // rule.test can be a RegExp or an object with a test method
      Boolean(
        (rule.test as RegExp | { test?: (v: string) => boolean })?.test?.(
          ".svg",
        ),
      ),
    );

    if (fileLoaderRule) {
      // 2. Instruct the default file-loader rule to IGNORE any SVG containing '?react'
      fileLoaderRule.exclude = /\.svg$/i;

      // 3. Re-apply the old loader ONLY when '?react' is NOT present
      config.module.rules.push({
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: { not: /react/ },
      });
    }

    // 4. Transform files explicitly appended with '?react' into standard React Components
    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: /react/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  reactCompiler: true,
};

export default nextConfig;
