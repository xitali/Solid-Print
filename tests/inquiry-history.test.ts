import {it,expect} from 'vitest'
import {inquiryHistory} from '../src/lib/inquiry-history'
import {usageLevel} from '../src/lib/usage'
it('historia nie powiela wpisów podczas zapisu innych pól i zachowuje oryginał',()=>{
  const history=[{at:'2026-01-01T00:00:00Z',status:'new'}]
  expect(inquiryHistory(history,{status:'new',notes:'a'},{status:'new',notes:'a'})).toEqual(history)
  const next=inquiryHistory(history,{status:'new'},{status:'review',notes:'Sprawdzone'},'2026-11-01T00:00:00Z')
  expect(next).toHaveLength(3)
  expect(next[1]).toEqual({at:'2026-11-01T00:00:00Z',status:'review'})
  expect(history).toHaveLength(1)
})
it('ostrzeżenie obejmuje dokładnie 75%, a brak danych nie udaje 0%',()=>{
  expect(usageLevel(74,100)).toBe('ok')
  expect(usageLevel(75,100)).toBe('warning')
  expect(usageLevel(100,100)).toBe('full')
  expect(usageLevel(null,100)).toBe('unknown')
})
