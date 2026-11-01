export const slugify = (value:string) => value.replace(/ł/g,'l').replace(/Ł/g,'L')
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
