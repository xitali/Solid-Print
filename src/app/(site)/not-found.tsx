import Link from 'next/link'
export default function NotFound(){return <div className="container error-page"><span className="eyebrow">404 / NIE TA ŚCIEŻKA</span><h1>Tu jeszcze nic<br/>nie wydrukowaliśmy.</h1><p>Ta strona nie istnieje albo zmieniła adres.</p><Link className="button" href="/">Wróć do pracowni ↗</Link></div>}
