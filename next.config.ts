
import type { NextConfig } from "next";
const withNextIntl = require("next-intl/plugin")("./i18n.ts");

const nextConfig: NextConfig = {
  output: "standalone",
};

export default withNextIntl(nextConfig);