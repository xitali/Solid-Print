import config from '@payload-config'
import '@payloadcms/next/css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-ext-400.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-ext-600.css'
import './custom.css'
import './workspace.css'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'
import { importMap } from './admin/importMap'
const serverFunction:ServerFunctionClient = async args => {
  'use server'
  return handleServerFunctions({...args,config,importMap})
}
export default function Layout({children}:{children:React.ReactNode}) {
  return RootLayout({children,config,importMap,serverFunction})
}
