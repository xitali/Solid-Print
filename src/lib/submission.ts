export type UploadItem={id:string;file:Blob&{name:string};kind:'model'|'reference'}
export type SubmissionSession={id:number;token:string;files:{id:number;clientId:string}[];uploaded:Set<string>}
export type SubmissionState={key:string;session:SubmissionSession|null}
export class SubmissionError extends Error{constructor(message:string,public code?:string){super(message)}}
type SendFile=(item:UploadItem,serverId:number,session:SubmissionSession)=>Promise<void>
type Fetcher=(url:string,init:RequestInit)=>Promise<Response>
export async function sendInquiry(state:SubmissionState,payload:Record<string,unknown>,files:UploadItem[],sendFile?:SendFile,fetcher:Fetcher=fetch):Promise<string>{
  async function post(url:string,body:unknown,token?:string){const response=await fetcher(url,{method:'POST',headers:{'Content-Type':'application/json',...(token?{'x-upload-token':token}:{})},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw new SubmissionError(result.error||'Nie udało się wysłać zapytania.',result.code);return result}
  for(let attempt=0;attempt<2;attempt++){
    try{
      if(!state.session){const result=await post('/api/quote/sessions',{files:files.map(f=>({name:f.file.name,size:f.file.size,kind:f.kind})),website:payload.website});state.session={id:result.sessionId,token:result.token,files:result.files.map((f:{id:number},i:number)=>({id:f.id,clientId:files[i].id})),uploaded:new Set()}}
      const session=state.session
      for(const item of files){if(session.uploaded.has(item.id))continue;const server=session.files.find(f=>f.clientId===item.id);if(!server||!sendFile)throw new SubmissionError('Nie udało się przygotować pliku. Dodaj go ponownie.');await sendFile(item,server.id,session);session.uploaded.add(item.id)}
      const result=await post('/api/quote/inquiries',{...payload,idempotencyKey:state.key,sessionId:session.id},session.token)
      return result.number
    }catch(e){if(e instanceof SubmissionError&&e.code==='SESSION_EXPIRED'&&attempt===0){state.session=null;continue}throw e}
  }
  throw new SubmissionError('Nie udało się odnowić sesji. Spróbuj ponownie.')
}
