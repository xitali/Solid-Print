import { describe, expect, it } from 'vitest'
import { validateFiles, validateInquiry, selectProducts, canDownload, previewEligibility } from '../src/lib/rules'

describe('załączniki zapytania', () => {
  it('przyjmuje każdy format z planu, również wielkie litery', () => {
    for (const extension of ['step','stp','stl','3mf','obj','igs','iges','dxf','dwg','acad','wrl','glb','gltf','3ds','ply','off','3dm','fbx','dae','ifc','brep','fcstd','bim','amf']) {
      expect(validateFiles([{name: `część.${extension.toUpperCase()}`, size: 100, kind: 'model'}])).toEqual([])
    }
  })
  it('odrzuca pliki wykonywalne, zbyt duże oraz przekroczoną sumę', () => {
    expect(validateFiles([{name:'part.stl.exe',size:2,kind:'model'}]).length).toBeGreaterThan(0)
    expect(validateFiles([{name:'part.stl',size:104857601,kind:'model'}]).length).toBeGreaterThan(0)
    expect(validateFiles([1,2,3].map(i=>({name:`part${i}.stl`,size:90*1024*1024,kind:'model'}))).length).toBeGreaterThan(0)
  })
  it('ogranicza liczbę modeli i rozdziela materiały pomocnicze', () => {
    expect(validateFiles(Array.from({length:6},(_,i)=>({name:`p${i}.obj`,size:1,kind:'model'}))).length).toBeGreaterThan(0)
    expect(validateFiles([{name:'szkic.pdf',size:100,kind:'reference'}])).toEqual([])
    expect(validateFiles([{name:'szkic.pdf',size:100,kind:'model'}]).length).toBeGreaterThan(0)
    expect(validateFiles([{name:'p.stl',size:0,kind:'model'}]).length).toBeGreaterThan(0)
  })
})

describe('trzy ścieżki klienta', () => {
  const base = {name:'Anna', email:'anna@example.org', quantity:1, material:'Doradź mi', color:'Doradź mi', unit:'unknown', description:'Uchwyt do niewielkiej lampki', delivery:'shipping', privacy:true}
  it('projektowanie nie wymaga pliku, druk z pliku wymaga modelu', () => {
    expect(validateInquiry({...base,type:'design'},[]).success).toBe(true)
    expect(validateInquiry({...base,type:'print'},[]).success).toBe(false)
    expect(validateInquiry({...base,type:'print'},[{name:'p.stl',size:1,kind:'model'}]).success).toBe(true)
  })
  it('nie pozwala wysłać niepoprawnego emaila lub zerowej ilości', () => {
    expect(validateInquiry({...base,type:'design',email:'x'}).success).toBe(false)
    expect(validateInquiry({...base,type:'design',quantity:0}).success).toBe(false)
    expect(validateInquiry({...base,type:'design',privacy:false}).success).toBe(false)
  })
  it('zapytanie produktowe wymaga identyfikatora produktu', () => {
    expect(validateInquiry({...base,type:'product'}).success).toBe(false)
    expect(validateInquiry({...base,type:'product',productId:'12'}).success).toBe(true)
  })
})

describe('katalog i prywatność', () => {
  it('wyszukuje po opisie i łączy filtr kategorii z zastosowaniem', () => {
    const products = [
      {id:1,title:'Uchwyt',description:'Do lampki',category:'dom',applications:['organizacja']},
      {id:2,title:'Obudowa',description:'Element do lampki',category:'techniczne',applications:['elektronika']},
    ]
    expect(selectProducts(products,{q:'LAMPKI',category:'dom',application:'organizacja'}).map(p=>p.id)).toEqual([1])
    expect(selectProducts(products,{q:'brak'})).toEqual([])
  })
  it('tylko administrator pobiera plik po czystym wyniku skanowania', () => {
    expect(canDownload(null,'clean')).toBe(false)
    expect(canDownload({role:'owner'},'quarantined')).toBe(false)
    expect(canDownload({role:'owner'},'infected')).toBe(false)
    expect(canDownload({role:'owner'},'clean')).toBe(true)
  })
  it('podgląd nie obejmuje CAD i odmawia za dużych plików', () => {
    expect(previewEligibility('model.STL',100)).toBe(true)
    expect(previewEligibility('model.step',100)).toBe(false)
    expect(previewEligibility('model.glb',26*1024*1024)).toBe(false)
  })
})
