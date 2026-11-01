import { describe,it,expect } from 'vitest'
import { createDownloadGrant,verifyDownloadGrant } from '../src/lib/download-grants'
describe('krótkotrwałe uprawnienie do pobrania',()=>{
 it('wiąże odnośnik z plikiem, zawartością i pięcioma minutami',()=>{
  const grant=createDownloadGrant('12','hash-a','secret',1000000)
  expect(verifyDownloadGrant('12','hash-a','secret',grant.expires,grant.signature,1000001)).toBe(true)
  expect(verifyDownloadGrant('13','hash-a','secret',grant.expires,grant.signature,1000001)).toBe(false)
  expect(verifyDownloadGrant('12','hash-b','secret',grant.expires,grant.signature,1000001)).toBe(false)
  expect(verifyDownloadGrant('12','hash-a','secret',grant.expires,grant.signature,1300001)).toBe(false)
 })
})
