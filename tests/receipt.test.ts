import {it,expect,vi} from 'vitest'
import {withReceipt} from '../src/lib/receipt'
it('ponawia wyłącznie kolizję numeru, z ograniczoną liczbą prób',async()=>{
  const save=vi.fn().mockRejectedValueOnce(new Error('D1_ERROR',{cause:new Error('UNIQUE constraint failed: inquiries.number')})).mockResolvedValueOnce('ok')
  const numbers=vi.fn().mockReturnValueOnce('A').mockReturnValueOnce('B')
  expect(await withReceipt(save,numbers)).toBe('ok')
  expect(save.mock.calls.map(a=>a[0])).toEqual(['A','B'])
  const offline=vi.fn().mockRejectedValue(new Error('offline'))
  await expect(withReceipt(offline)).rejects.toThrow('offline')
  expect(offline).toHaveBeenCalledTimes(1)
  const collision=vi.fn().mockRejectedValue(new Error('duplicate',{cause:{constraint:'inquiries_number_idx'}}))
  await expect(withReceipt(collision)).rejects.toThrow('duplicate')
  expect(collision).toHaveBeenCalledTimes(3)
})
