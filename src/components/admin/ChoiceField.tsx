'use client'
import {useField} from '@payloadcms/ui'
import type {TextFieldClientComponent} from 'payload'
const delivery={discuss:'Do ustalenia',shipping:'Wysyłka',pickup:'Odbiór osobisty'}
const unit={unknown:'Do ustalenia',mm:'Milimetry',cm:'Centymetry',m:'Metry'}
export const ChoiceField:TextFieldClientComponent=({path,field,readOnly})=>{
  const {value,setValue}=useField<string>({path})
  const options:Record<string,string>=field.name==='delivery'?delivery:unit
  return <div className="field-type text"><label htmlFor={path}>{String(field.label||field.name)}</label>
    <select id={path} value={value||''} onChange={e=>setValue(e.target.value)} disabled={Boolean(readOnly)} style={{width:'100%',padding:12,color:'inherit',background:'var(--theme-elevation-50)',border:'1px solid var(--theme-elevation-200)'}}>
      <option value="">Do ustalenia</option>{Object.entries(options).map(([key,label])=><option key={key} value={key}>{label}</option>)}
      {value&&!options[value]&&<option value={value}>{value}</option>}
    </select>
  </div>
}
