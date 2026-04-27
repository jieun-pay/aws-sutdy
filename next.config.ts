import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* 빌드 시 타입 체크 오류 무시 */
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
