import {afterEach,it,expect,vi} from 'vitest'
import {createHash} from 'node:crypto'
import {uploadR2} from '../src/lib/upload-r2'
afterEach(()=>vi.unstubAllGlobals())
it('przesyła strumień bez pliku tymczasowego, liczy hash i usuwa niekompletny obiekt',async()=>{
  vi.stubGlobal('FixedLengthStream',class extends TransformStream {constructor(_size:number){super()}})
  const bucket={put:vi.fn(async(_key:string,body:ReadableStream)=>{await new Response(body).arrayBuffer()}),delete:vi.fn()}
  const stream=()=>new Blob(['solidprint']).stream()
  expect(await uploadR2(stream(),10,'quote/test',bucket as any)).toBe(createHash('sha256').update('solidprint').digest('hex'))
  await expect(uploadR2(stream(),11,'quote/test',bucket as any)).rejects.toThrow('niekompletny')
  expect(bucket.delete).toHaveBeenCalledWith('quote/test')
})
