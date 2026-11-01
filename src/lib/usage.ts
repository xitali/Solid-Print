export type UsageMetric = { label: string; used: number | null; limit: number; note: string }
export function usageLevel(used: number | null, limit: number): 'unknown'|'ok'|'warning'|'full' {
  if(used===null || !Number.isFinite(used))return 'unknown'
  return used>=limit?'full':used>=limit*.75?'warning':'ok'
}
export async function cloudUsage() {
  const { bindings } = await import('./cloudflare')
  const {D1}=await bindings()
  const [budget,states]=await Promise.all([
    D1.prepare('SELECT bytes FROM sp_storage_budget WHERE id=1').all<{bytes:number}>(),
    D1.prepare('SELECT key,value,updated_at FROM sp_system_state').all<{key:string;value:string;updated_at:string}>(),
  ])
  const metrics:UsageMetric[]=[
    {label:'Baza D1',used:budget.meta.size_after || null,limit:500*1000*1000,note:'Rozmiar tej bazy. Limit Free na pojedynczą bazę.'},
    {label:'Pliki i zdjęcia Solid Print',used:budget.results[0]?.bytes??null,limit:10*1000*1000*1000,note:'Rezerwacje z bazy, także oczekujące pliki. Budżet aplikacji 7,5 GB; darmowy limit R2 10 GB dotyczy całego konta.'},
  ]
  return {metrics,states:states.results}
}
