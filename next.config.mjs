import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack(config) {
    // ย้ำ alias @ ให้ชี้ root เสมอ
    config.resolve.alias['@'] = path.resolve(process.cwd())
    return config
  },
}
