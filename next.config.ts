import type { NextConfig } from 'next'
import { version } from './package.json'

// MST = UTC-7 (Arizona never observes DST)
const _now = new Date(Date.now() - 7 * 60 * 60 * 1000)
const _p   = (n: number) => String(n).padStart(2, '0')
const APP_VERSION = `v${version}-${_p(_now.getUTCDate())}${_p(_now.getUTCMonth() + 1)}${String(_now.getUTCFullYear()).slice(-2)}`

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: APP_VERSION,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
