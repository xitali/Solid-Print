import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { r2Storage } from '@payloadcms/storage-r2'
import path from 'node:path'
import type { Config } from 'payload'
import { bindings,onCloudflare } from './cloudflare'
export async function platformConfig():Promise<Pick<Config,'db'|'email'|'plugins'|'logger'|'sharp'>>{
const cloud = onCloudflare ? await bindings() : null

// Native Node packages are loaded only by the local PostgreSQL deployment.
const local = cloud
  ? null
  : {
      postgresAdapter: (await import('@payloadcms/db-postgres')).postgresAdapter,
      s3Storage: (await import('@payloadcms/storage-s3')).s3Storage,
      nodemailerAdapter: (await import('@payloadcms/email-nodemailer')).nodemailerAdapter,
      sharp: (await import('sharp')).default,
    }


const dirname=path.resolve('src')
return {db: cloud
    ? sqliteD1Adapter({
        binding: cloud.D1,
        migrationDir: path.resolve(dirname, 'migrations-d1'),
        push: false,
      })
    : local!.postgresAdapter({
        pool: { connectionString: process.env.DATABASE_URL },
        push: process.env.ALLOW_SCHEMA_PUSH === 'true',
      }),
...(local ? { sharp: local.sharp } : {}),
logger: cloud
    ? {
        options: { enabled: true },
        destination: { write: (line: string) => console.log(line.trim()) },
      }
    : undefined,
email: cloud
    ? () => ({
        name: 'unconfigured',
        defaultFromAddress: 'noreply@solidprint.emanuelwloch.pl',
        defaultFromName: 'Solid Print',
        sendEmail: async () => {
          throw new Error('Poczta nie została jeszcze skonfigurowana.')
        },
      })
    : local!.nodemailerAdapter({
        defaultFromAddress:
          process.env.SMTP_FROM?.match(/<([^>]+)>/)?.[1] || 'powiadomienia@solidprint.local',
        defaultFromName: 'Solid Print',
        transportOptions: {
          host: process.env.SMTP_HOST || '127.0.0.1',
          port: Number(process.env.SMTP_PORT || 51025),
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
            : undefined,
        },
      }),
plugins: cloud
    ? [
        r2Storage({
          bucket: cloud.MEDIA as unknown as Parameters<typeof r2Storage>[0]['bucket'],
          collections: { media: { prefix: 'public-media' } },
        }),
      ]
    : process.env.S3_ENDPOINT
      ? [
          local!.s3Storage({
            bucket: process.env.S3_BUCKET || 'solid-print-private',
            collections: { media: { prefix: 'public-media' } },
            config: {
              endpoint: process.env.S3_ENDPOINT,
              region: process.env.S3_REGION || 'us-east-1',
              forcePathStyle: true,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY!,
                secretAccessKey: process.env.S3_SECRET_KEY!,
              },
            },
          }),
        ]
      : []}
}
