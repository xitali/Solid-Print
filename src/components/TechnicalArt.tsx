export function TechnicalArt({small=false}:{small?:boolean}) {
  return <div className={`technical-art ${small?'technical-art-small':''}`}>
    <div className="art-grid"/>
    <div className="art-meta mono"><span>SOLID PRINT / 3D</span><span>RYS. 01</span></div>
    <svg viewBox="0 0 600 500" role="img" aria-label="Autorski schemat warstwowej bryły 3D. Ilustracja poglądowa, nie zdjęcie realizacji.">
      <defs>
        <linearGradient id="side" x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--ink)"/><stop offset="1" stopColor="var(--charcoal)"/></linearGradient>
        <linearGradient id="top" x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--tone-3e3c36)"/><stop offset="1" stopColor="var(--charcoal)"/></linearGradient>
      </defs>
      <g className="art-guides" fill="none" stroke="var(--tone-3e3c36)" strokeWidth="1"><path d="m87 328 223 127 216-124M310 455v-38M87 328l30-17M526 331l-28-17"/><path d="M98 128v179m-7-177h14m-14 177h14"/><path d="m126 116 173-99 212 123" strokeDasharray="4 5"/></g>
      <g className="art-object">
        <path d="m153 197 145-83 152 87v132l-145 83-152-87Z" fill="url(#side)"/>
        <path d="m153 197 145-83 152 87-145 83Z" fill="url(#top)"/>
        <path d="M305 284v132" stroke="var(--ink-soft)" strokeWidth="1.5"/>
        {Array.from({length:23},(_,i)=><path key={i} d={`m153 ${202+i*5.4} 152 87 145-83`} fill="none" stroke="var(--accent)" strokeOpacity=".35" strokeWidth=".8"/>)}
        <path d="m217 195 81-46 86 49-81 47Z" fill="var(--charcoal)" stroke="var(--accent)"/>
        <path d="m217 195 86 49v40l-86-49Z" fill="var(--ink)"/>
        <path d="m303 244 81-46v40l-81 46Z" fill="var(--charcoal)"/>
        <path d="m153 197 145-83 152 87-145 83Z" fill="none" stroke="var(--light-accent)"/>
      </g>
      <g className="art-callouts" fill="none" stroke="var(--accent)" strokeWidth="1.4"><circle cx="431" cy="269" r="4" fill="var(--accent)"/><path d="m435 269 63-37h39"/><circle cx="189" cy="175" r="4" fill="var(--accent)"/><path d="m185 175-48-29H70"/></g>
      <g fill="var(--tone-b0aca0)" fontFamily="monospace" fontSize="10" letterSpacing="1"><text x="68" y="135">WARSTWA PO WARSTWIE</text><text x="475" y="219">FORMA 3D</text><text x="70" y="286" transform="rotate(-90 70 286)">OD KONCEPCJI DO FORMY</text></g>
      <g fill="none" stroke="var(--ink-soft)" strokeWidth="1.3"><path d="M30 63V35h28M542 35h28v28M30 436v28h28M542 464h28v-28"/></g>
    </svg>
    <div className="art-bottom mono"><span><i/> PROJEKT + WYDRUK</span><span>SCHEMAT</span></div>
    <div className="art-stamp"><span className="stamp-plus">+</span><span>Pomysł nabiera<br/><strong>kształtu.</strong></span></div>
  </div>
}
