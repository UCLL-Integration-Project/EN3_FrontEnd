
import type { NextConfig } from "next";
import withNextIntl from "next-intl/plugin";
const withNextIntlPlugin = withNextIntl("./i18n.ts");

const nextConfig: NextConfig = {};

export default withNextIntlPlugin(nextConfig);