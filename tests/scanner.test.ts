import { afterEach,describe,it,expect } from 'vitest'
import net from 'node:net'
import { Readable } from 'node:stream'
import { scanStream } from '../src/lib/clamav'
let server:net.Server|undefined
afterEach(async()=>{if(server)await new Promise<void>(r=>server!.close(()=>r()));delete process.env.CLAMAV_PORT})
describe('protokół skanowania pliku',()=>{
  it('przesyła pełny strumień i rozróżnia wynik OK od FOUND',async()=>{
    let calls=0
    server=net.createServer(socket=>{let data=Buffer.alloc(0);socket.on('data',chunk=>{data=Buffer.concat([data,chunk]);if(data.length>=10&&data.subarray(-4).equals(Buffer.alloc(4))){expect(data.subarray(0,10).toString()).toBe('zINSTREAM\0');calls++;socket.end(calls===1?'stream: OK\0':'stream: Test-Signature FOUND\0')}})})
    await new Promise<void>(r=>server!.listen(0,'127.0.0.1',r));const port=(server!.address() as net.AddressInfo).port;process.env.CLAMAV_PORT=String(port)
    expect(await scanStream(Readable.from(['test data']))).toEqual({clean:true,message:'ClamAV: OK'})
    expect((await scanStream(Readable.from(['test data']))).clean).toBe(false)
  })
  it('nie traktuje braku odpowiedzi detektora jako bezpiecznego wyniku',async()=>{
    server=net.createServer(socket=>{socket.resume();socket.end('stream: scanner unavailable ERROR\0')});await new Promise<void>(r=>server!.listen(0,'127.0.0.1',r));process.env.CLAMAV_PORT=String((server!.address() as net.AddressInfo).port)
    await expect(scanStream(Readable.from(['data']))).rejects.toThrow('nie potwierdził')
  })
})
