'use client'
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="container error-page"><h1>Chwila przerwy w pracowni.</h1><p>Nie udało się wczytać strony. Spróbuj ponownie za chwilę.</p><button className="button" onClick={reset}>Spróbuj ponownie ↗</button></div>}
