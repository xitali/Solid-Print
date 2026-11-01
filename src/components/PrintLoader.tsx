export function PrintLoader({success=false}:{success?:boolean}) {
  return <svg className={`print-loader ${success?'print-loader-success':''}`} viewBox="0 0 64 56" width="64" height="56" aria-hidden="true">
    <path d="M5 47V5h54v42M5 15h54M2 50h60" fill="none" stroke="currentColor" strokeWidth="2"/>
    {[0,1,2,3,4,5].map(i=><rect key={i} className="print-loader-layer" style={{animationDelay:`${i*100}ms`}} x={19+i*1.5} y={43-i*4} width={26-i*3} height="3" rx="1" fill="currentColor"/>)}
    <path d="M29 15h6v6l-3 4-3-4Z" fill="currentColor"/>
  </svg>
}
