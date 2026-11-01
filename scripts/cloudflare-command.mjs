import { spawnSync } from 'node:child_process'
const args=process.argv.slice(2)
const mode=args.shift()
const env={...process.env,PLATFORM:'cloudflare',NEXT_PUBLIC_SERVER_URL:process.env.CLOUD_SITE_URL||'https://solidprint.emanuelwloch.pl',SITE_INDEXABLE:'false',ALLOW_SCHEMA_PUSH:'false',DATABASE_URL:'',PAYLOAD_SECRET:'build-only-secret-not-for-production'}
const commands={build:['node_modules/@opennextjs/cloudflare/dist/cli/index.js','build'],migration:['node_modules/payload/bin.js','migrate:create'],migrate:['node_modules/payload/bin.js','migrate']}
if(!commands[mode])throw new Error('Unknown Cloudflare command')
const r=spawnSync(process.execPath,[...(mode==='build'&&process.platform==='win32'?['--import','./scripts/windows-build.mjs']:[]),...commands[mode],...args],{env,stdio:'inherit'});process.exit(r.status??1)
