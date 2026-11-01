import {createHash} from 'node:crypto'
import type {R2Bucket,ReadableStream as CFReadableStream} from '@cloudflare/workers-types'

// Stream to R2 without storing a 100 MiB upload in the Worker's in-memory filesystem.
export async function uploadR2(body:ReadableStream<Uint8Array>,size:number,key:string,bucket:R2Bucket){
  const digest=createHash('sha256')
  let received=0
  const checked=body.pipeThrough(new TransformStream<Uint8Array,Uint8Array>({
    transform(chunk,controller){
      received+=chunk.byteLength
      if(received>size)throw new Error('Plik przekracza zadeklarowany rozmiar.')
      digest.update(chunk);controller.enqueue(chunk)
    },
    flush(){if(received!==size)throw new Error('Plik jest niekompletny. Spróbuj ponownie.')},
  }))
  const {FixedLengthStream}=globalThis as unknown as {FixedLengthStream:new(n:number)=>{readable:ReadableStream<Uint8Array>;writable:WritableStream<Uint8Array>}}
  const fixed=new FixedLengthStream(size)
  const abort=new AbortController()
  const writes=[bucket.put(key,fixed.readable as unknown as CFReadableStream,{httpMetadata:{contentType:'application/octet-stream'}}),checked.pipeTo(fixed.writable,{signal:abort.signal})]
  try{await Promise.all(writes);return digest.digest('hex')}
  catch(error){abort.abort();await Promise.allSettled(writes);await bucket.delete(key);throw error}
  finally{abort.abort()}
}
