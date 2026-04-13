import type { NextConfig } from "next";

/**
 * Next.js configuration with security headers.
 *
 * Applies OWASP-recommended response headers to all routes:
 *   - X-Content-Type-Options: prevents MIME-type sniffing
 *   - X-Frame-Options: prevents clickjacking via iframe embedding
 *   - Referrer-Policy: limits referrer leakage to same-origin
 */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
