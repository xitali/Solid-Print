import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
if(process.env.PLATFORM==='cloudflare') initOpenNextCloudflareForDev()
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingExcludes:{'*':['./.env','./.env.*','.data/**/*','backups/**/*']},
  serverExternalPackages: ['nodemailer','pg-cloudflare'],
  async headers() {
    return [{ source: '/:path*', headers: [
      {key: 'X-Content-Type-Options', value: 'nosniff'},
      {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
      {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
      {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()'},
    ]}]
  },
}
export default withPayload(config,{devBundleServerPackages:false})
