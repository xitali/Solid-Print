import {randomBytes} from 'node:crypto'
export async function withReceipt<T>(save:(number:string)=>Promise<T>,generate=()=>`SP-${new Date().getUTCFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`):Promise<T>{
  for(let attempt=0;attempt<3;attempt++){
    const number=generate()
    try{return await save(number)}catch(error){
      // PostgreSQL exposes the unique constraint; D1 wraps the SQLite error in cause.
      let cause:unknown=error,collision=false
      for(let depth=0;cause&&depth<5;depth++){
        const e=cause as {message?:string;constraint?:string;cause?:unknown}
        collision ||= /unique constraint failed:\s*inquiries\.number/i.test(e.message||'') || e.constraint==='inquiries_number_idx'
        cause=e.cause
      }
      if(!collision||attempt===2)throw error
    }
  }
  throw new Error('Nie udało się nadać numeru zapytania.')
}
