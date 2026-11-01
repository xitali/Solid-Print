import dotenv from 'dotenv'
dotenv.config({quiet:true})
const {getPayload}=await import('payload');const {default:config}=await import('../src/payload.config');const {createBackup,pruneBackups}=await import('../src/lib/backup')
const p=await getPayload({config});const dir=await createBackup(p);await pruneBackups();console.log(`Utworzono i sprawdzono manifest kopii: ${dir}`);await p.destroy();process.exit(0)
