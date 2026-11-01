export type InquiryEvent = {at:string;status?:string;note?:string}
export function inquiryHistory(previous:InquiryEvent[]=[], original:Record<string,unknown>|undefined, change:Record<string,unknown>, now=new Date().toISOString()) {
  const events=[...previous]
  if(typeof change.status==='string' && change.status!==original?.status)events.push({at:now,status:change.status})
  if(typeof change.notes==='string' && change.notes!==original?.notes)events.push({at:now,note:change.notes||'Notatka usunięta.'})
  return events
}
