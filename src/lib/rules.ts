import { z } from 'zod'
export const MODEL_EXTENSIONS = ['step','stp','stl','3mf','obj','igs','iges','dxf','dwg','acad','wrl','glb','gltf','3ds','ply','off','3dm','fbx','dae','ifc','brep','fcstd','bim','amf'] as const
export type FileMeta = {name:string;size:number;kind:string}
export const extensionOf = (name:string) => name.split('.').pop()?.toLowerCase() || ''
export function validateFiles(files:FileMeta[]):string[] {
  const errors:string[]=[]
  if(files.filter(f=>f.kind==='model').length>5)errors.push('Możesz dodać maksymalnie 5 modeli.')
  if(files.filter(f=>f.kind==='reference').length>3)errors.push('Możesz dodać maksymalnie 3 materiały pomocnicze.')
  if(files.filter(f=>f.kind==='model').reduce((n,f)=>n+f.size,0)>250*1024*1024) errors.push('Modele mogą mieć łącznie do 250 MiB.')
  for(const f of files){
    const allowed = f.kind==='model' ? MODEL_EXTENSIONS as readonly string[] : f.kind==='reference' ? ['jpg','jpeg','png','pdf'] : []
    if(!allowed.includes(extensionOf(f.name))) errors.push(`${f.name}: ten format nie jest obsługiwany.`)
    if(!Number.isSafeInteger(f.size)||f.size<=0||f.size>(f.kind==='model'?100:10)*1024*1024)errors.push(`${f.name}: plik jest pusty lub przekracza limit ${f.kind==='model'?100:10} MiB.`)
    if(f.name.length>180||/[\x00-\x1f/\\]/.test(f.name)) errors.push('Nieprawidłowa nazwa pliku.')
  }
  return errors
}
export const inquirySchema = z.object({
  type:z.enum(['print','design','product','contact']),name:z.string().trim().min(2).max(100),email:z.email().max(254),
  phone:z.string().trim().max(40).optional().default(''),company:z.string().trim().max(150).optional().default(''),nip:z.string().trim().max(30).optional().default(''),
  quantity:z.coerce.number().int().min(1).max(100000).default(1),material:z.string().trim().max(100).default('Doradź mi'),color:z.string().trim().max(100).default('Doradź mi'),
  unit:z.enum(['mm','cm','m','unknown']).default('unknown'),description:z.string().trim().min(10).max(10000),
  deadline:z.string().max(80).optional().default(''),delivery:z.enum(['shipping','pickup','discuss']).default('discuss'),
  productId:z.string().max(50).optional(),variant:z.string().max(200).optional(),privacy:z.literal(true),
})
export function validateInquiry(input:unknown,files:FileMeta[]=[]){
  return inquirySchema.superRefine((data,ctx)=>{
    if(data.type==='print'&&!files.some(f=>f.kind==='model'))ctx.addIssue({code:'custom',path:['files'],message:'Dodaj przynajmniej jeden model do wydruku.'})
    if(data.type==='product'&&!data.productId)ctx.addIssue({code:'custom',path:['productId'],message:'Wybierz produkt z katalogu.'})
  }).safeParse(input)
}
export function selectProducts<T extends {title:string;description:string;category?:string;applications?:string[]|{value:string}[]}>(products:T[],filters:{q?:string;category?:string;application?:string}):T[]{
  const q=filters.q?.trim().toLocaleLowerCase('pl')||''
  return products.filter(p=>(!q||`${p.title} ${p.description}`.toLocaleLowerCase('pl').includes(q))&&(!filters.category||p.category===filters.category)&&(!filters.application||p.applications?.some(a=>(typeof a==='string'?a:a.value)===filters.application)))
}
export const canDownload = (user:{role?:string}|null|undefined,status:string)=>user?.role==='owner'&&status==='clean'
export const previewEligibility = (name:string,size:number)=>['stl','obj','glb'].includes(extensionOf(name))&&size<=25*1024*1024
