import net from 'node:net'
import type { Readable } from 'node:stream'
export async function scanStream(stream:Readable):Promise<{clean:boolean;message:string}>{
  return new Promise((resolve,reject)=>{
    const socket=net.createConnection({host:process.env.CLAMAV_HOST||'127.0.0.1',port:Number(process.env.CLAMAV_PORT||3310)})
    let answer='';let finished=false
    const fail=(e:Error)=>{if(finished)return;finished=true;socket.destroy();stream.destroy();reject(e)}
    socket.setTimeout(120000,()=>fail(new Error('Skaner przekroczył czas oczekiwania.')))
    socket.on('error',fail)
    socket.on('data',d=>{answer+=d.toString();if(answer.length>4096)fail(new Error('Nieprawidłowa odpowiedź skanera.'))})
    socket.on('end',()=>{if(finished)return;finished=true;socket.destroy();stream.destroy();if(answer.includes(' FOUND'))resolve({clean:false,message:answer.replace(/\0/g,'').slice(0,200)});else if(answer.includes(': OK'))resolve({clean:true,message:'ClamAV: OK'});else reject(new Error('Skaner nie potwierdził wyniku.'))})
    socket.on('connect',async()=>{
      try{
        socket.write('zINSTREAM\0')
        for await(const raw of stream){const chunk=Buffer.from(raw);for(let pos=0;pos<chunk.length;pos+=65536){const part=chunk.subarray(pos,pos+65536);const size=Buffer.alloc(4);size.writeUInt32BE(part.length);socket.write(size);if(!socket.write(part))await new Promise<void>((res,rej)=>{socket.once('drain',res);socket.once('error',rej)})}}
        socket.write(Buffer.alloc(4))
      }catch(e){fail(e as Error)}
    })
    stream.on('error',fail)
  })
}
