import type { NextConfig } from "next";
import path from "path";

type RuleWithTest = {
  test?: RegExp | { test: (value: string) => boolean };
  [key: string]: unknown;
};

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  typedRoutes: true,
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: RuleWithTest) =>
      Boolean(
        (rule.test as RegExp | { test?: (v: string) => boolean })?.test?.(
          ".svg",
        ),
      ),
    );

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;

      config.module.rules.push({
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: { not: /react/ },
      });
    }

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
