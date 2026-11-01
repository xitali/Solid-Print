import dotenv from 'dotenv'
dotenv.config({quiet:true})
const {getPayload}=await import('payload');const {default:config}=await import('../src/payload.config')
const {processMail,processScans,cleanup}=await import('../src/lib/jobs')
const {createBackup,pruneBackups}=await import('../src/lib/backup')
const p=await getPayload({config});let stop=false;let lastCleanup=0
let lastBackup=0
process.on('SIGINT',()=>{stop=true});process.on('SIGTERM',()=>{stop=true})
console.log('Solid Print: kolejka pocztowa, skanowanie i retencja aktywne.')
while(!stop){try{await processMail(p);await processScans(p);if(Date.now()-lastCleanup>3600000){await cleanup(p);lastCleanup=Date.now()}if(Date.now()-lastBackup>86400000){await createBackup(p);await pruneBackups();lastBackup=Date.now()}}catch(e){console.error('Zadanie zostanie ponowione:',(e as Error).message)}await new Promise(resolve=>setTimeout(resolve,15000))}
await p.destroy()
