import dotenv from 'dotenv'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { isDeepStrictEqual } from 'node:util'
dotenv.config({quiet:true})
const dir=process.argv[2];if(!dir)throw new Error('Podaj katalog kopii i ustaw DATABASE_URL na pustą bazę solidprint_restore_*.')
const {getPayload}=await import('payload');const {default:config}=await import('../src/payload.config');const {restoreBackup}=await import('../src/lib/backup')
const p=await getPayload({config});const counts=await restoreBackup(p,dir)
for(const [collection,count] of Object.entries(counts)){const result=await p.count({collection:collection as never});if(result.totalDocs!==count)throw new Error(`Niezgodna liczba rekordów: ${collection}`)}
const snapshot=JSON.parse(await readFile(path.join(dir,'snapshot.json'),'utf8'))
for(const [collection,docs] of Object.entries(snapshot.collections) as [string,Record<string,unknown>[]][]){for(const expected of docs){const actual=await p.findByID({collection:collection as never,id:expected.id as number,depth:0,showHiddenFields:true});for(const [field,value] of Object.entries(expected)){if(['createdAt','updatedAt'].includes(field))continue;if(!isDeepStrictEqual((actual as Record<string,unknown>)[field],value))throw new Error(`Niezgodne dane po odtworzeniu: ${collection}, rekord ${expected.id}, pole ${field}`)}}}
if(process.env.RESTORE_VERIFY_QA==='true'){const credentials=JSON.parse(await readFile('.data/qa/access.json','utf8'));const login=await p.login({collection:'users',data:{email:credentials.email,password:credentials.password}});if(!login.token)throw new Error('Odzyskane konto testowe nie umożliwia logowania.')}
console.log('Odtwarzanie: zgodne rekordy, relacje oraz sumy kontrolne odzyskanych plików. Pliki lokalne znajdują się w .data/restored/<nazwa-bazy>.')
await p.destroy();process.exit(0)
