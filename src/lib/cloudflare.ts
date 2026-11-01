import { getCloudflareContext } from '@opennextjs/cloudflare'
export const onCloudflare = process.env.PLATFORM === 'cloudflare'
export async function bindings() {
  if(process.argv?.some(value=>/payload[\\/]bin\.js$/.test(value))){
    const {getPlatformProxy}=await import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_','')}`)
    const {env}=await getPlatformProxy({envFiles:[]})
    return env as unknown as CloudflareEnv
  }
  const {env} = await getCloudflareContext({async:true})
  return env
}
