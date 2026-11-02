import type { Metadata } from 'next'
import { ViewTransition } from 'react'
import '@fontsource/space-grotesk/latin-600.css'
import '@fontsource/space-grotesk/latin-ext-600.css'
import '@fontsource/space-grotesk/latin-700.css'
import '@fontsource/space-grotesk/latin-ext-700.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-ext-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-ext-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-ext-600.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import '@fontsource/jetbrains-mono/latin-ext-500.css'
import './tokens.css'
import './styles.css'
import './motion.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { website } from '@/lib/cms'
import { RevealEffects } from '@/components/RevealEffects'
export const dynamic='force-dynamic'
export const metadata:Metadata={
  metadataBase:new URL(process.env.NEXT_PUBLIC_SERVER_URL||'http://127.0.0.1:3000'),
  title:{default:'Solid Print — projektowanie i druk 3D',template:'%s | Solid Print'},
  description:'Od pomysłu do gotowego wydruku 3D. Projektowanie, druk z pliku i gotowe projekty na zamówienie. Prześlij model lub opisz swój pomysł.',
  openGraph:{type:'website',locale:'pl_PL',siteName:'Solid Print',images:[{url:'/opengraph-image',width:1200,height:630}]},
  robots:{index:process.env.SITE_INDEXABLE==='true',follow:process.env.SITE_INDEXABLE==='true'},
}
export default async function Layout({children}:{children:React.ReactNode}){
  const settings=await website()
  return <html lang="pl" data-scroll-behavior="smooth"><body id="top"><a className="skip-link" href="#main">Przejdź do treści</a><Header phone={settings.phone}/><ViewTransition name="page-content" default="sp-page"><main id="main">{children}</main></ViewTransition><Footer settings={settings}/><RevealEffects/></body></html>
}
