import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
test('hero i katalog na telefonie: treść, brak poziomego przewijania, dostępność',async({page})=>{
  for(const path of ['/','/projekty']){
    await page.goto(path)
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
    expect(results.violations).toEqual([])
  }
})
test('formularz zapisuje zapytanie bez plików i pokazuje numer',async({page})=>{
  await page.goto('/wycena?type=design')
  await page.locator('[name="name"]').fill('Test przeglądarkowy QA')
  await page.locator('[name="email"]').fill('qa-browser@solidprint.local')
  await page.locator('textarea[name="description"]').fill('TEST QA — projekt obudowy testowej bez załączników.')
  await page.locator('[name="privacy"]').check()
  await page.locator('button[type="submit"]:visible').first().click()
  await expect(page.locator('.submission-number')).toHaveText(/^SP-\d{4}-[A-F0-9]{8}$/)
})
