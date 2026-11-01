import { z } from 'zod'
export const MODEL_EXTENSIONS = ['step','stp','stl','3mf','obj','igs','iges','dxf','dwg','acad','wrl','glb','gltf','3ds','ply','off','3dm','fbx','dae','ifc','brep','fcstd','bim','amf'] as const
export type FileMeta = {name:string;size:number;kind:string}
export const extensionOf = (name:string) => name.split('.').pop()?.toLowerCase() || ''
export function validateFiles(files: FileMeta[]): string[] {
  const errors: string[] = []
  const modelFiles = files.filter((f) => f.kind === 'model')
  const refFiles = files.filter((f) => f.kind === 'reference')

  if (modelFiles.length > 5) {
    errors.push('Możesz dodać do 5 modeli. Usuń któryś, żeby dodać nowy.')
  }
  if (refFiles.length > 3) {
    errors.push('Możesz dodać maksymalnie 3 materiały pomocnicze.')
  }

  const totalModelSize = modelFiles.reduce((acc, f) => acc + (f.size || 0), 0)
  if (totalModelSize > 250 * 1024 * 1024) {
    const totalMb = Math.round((totalModelSize / (1024 * 1024)) * 10) / 10
    errors.push(`Wybrane pliki mają razem ${totalMb} MiB. Limit to 250 MiB.`)
  }

  const seen = new Set<string>()

  for (const f of files) {
    const key = `${f.kind}:${f.name.toLowerCase()}:${f.size}`
    if (seen.has(key)) {
      errors.push(`Plik \`${f.name}\` już jest na liście.`)
    }
    seen.add(key)

    const allowed =
      f.kind === 'model'
        ? (MODEL_EXTENSIONS as readonly string[])
        : f.kind === 'reference'
        ? ['jpg', 'jpeg', 'png', 'pdf']
        : []

    const ext = extensionOf(f.name)
    if (!allowed.includes(ext)) {
      errors.push(
        f.kind === 'model'
          ? `Plik \`${f.name}\` ma format, którego nie przyjmujemy. Wyślij model w jednym z obsługiwanych formatów.`
          : `Plik \`${f.name}\` ma format, którego nie przyjmujemy. Dozwolone są JPG, PNG oraz PDF.`
      )
    }

    if (!Number.isSafeInteger(f.size) || f.size <= 0) {
      errors.push(`Plik \`${f.name}\` jest pusty.`)
    } else {
      const maxMb = f.kind === 'model' ? 100 : 10
      const maxBytes = maxMb * 1024 * 1024
      if (f.size > maxBytes) {
        const sizeMb = Math.round((f.size / (1024 * 1024)) * 10) / 10
        errors.push(
          f.kind === 'model'
            ? `Plik \`${f.name}\` ma ${sizeMb} MiB. Limit to 100 MiB. Spróbuj uprościć siatkę lub wyślij \`.step\`.`
            : `Plik \`${f.name}\` ma ${sizeMb} MiB. Limit dla plików pomocniczych to 10 MiB.`
        )
      }
    }

    if (f.name.length > 150 || /[\x00-\x1f/\\]/.test(f.name)) {
      errors.push(`Plik \`${f.name}\` ma nieprawidłową nazwę (maks. 150 znaków bez znaków sterujących).`)
    }
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
