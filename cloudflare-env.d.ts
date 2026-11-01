interface CloudflareEnv {
  D1: import('@cloudflare/workers-types').D1Database
  PRIVATE_FILES: import('@cloudflare/workers-types').R2Bucket
  FORM_LIMIT: {limit(input:{key:string}):Promise<{success:boolean}>}
  MEDIA: import('@cloudflare/workers-types').R2Bucket
}
