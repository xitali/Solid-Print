import {DatabaseSync} from 'node:sqlite'
import {readFileSync,readdirSync} from 'node:fs'
import {it,expect} from 'vitest'
import type {Field} from 'payload'
import {Inquiries} from '../src/collections/inquiries'
import {Products} from '../src/collections/products'
import {Website} from '../src/globals/website'
import {catalogCollections} from '../src/collections/catalog'
import {systemCollections} from '../src/collections/system'
const snake=(v:string)=>v.replace(/([a-z0-9])([A-Z])/g,'$1_$2').replaceAll('-','_').toLowerCase()
function columns(fields:Field[]):string[]{return fields.flatMap(f=>{
  if(f.type==='ui')return []
  if(f.type==='tabs')return f.tabs.flatMap(t=>columns(t.fields))
  if(f.type==='row'||f.type==='collapsible')return columns(f.fields)
  if(!('name' in f)||f.type==='array'||f.type==='join')return []
  if(f.type==='relationship'&&f.hasMany)return []
  return [snake(f.name)+(f.type==='upload'||f.type==='relationship'?'_id':'')]
})}
it('każde przechowywane pole CMS istnieje w migracjach produkcyjnego D1',()=>{
  const db=new DatabaseSync(':memory:')
  try{
    for(const file of readdirSync('migrations-d1').filter(f=>f.endsWith('.sql')).sort())db.exec(readFileSync('migrations-d1/'+file,'utf8'))
    for(const collection of [Inquiries,Products,Website,...catalogCollections(true),...systemCollections]){
      const table=snake(collection.slug)
      const actual=db.prepare(`PRAGMA table_info("${table}")`).all().map(c=>c.name)
      expect(actual,table+' istnieje').not.toHaveLength(0)
      for(const column of columns(collection.fields))expect(actual,`${table}.${column} wymaga migracji D1`).toContain(column)
    }
  }finally{db.close()}
})
