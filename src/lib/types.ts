export type ImageDoc = { id: number; url?: string; alt?: string; width?: number; height?: number }
export type Product = { id: number; title: string; slug: string; description: string; category?: string; applications?: {value: string}[]; material?: string; dimensions?: string; layerHeight?: string; priceFrom?: number; leadTime?: string; personalization?: string; available: boolean; featured?: boolean; variants?: {id?: string; name: string; color?: string}[]; images?: {image: ImageDoc; caption?: string}[] }
export type Material = {id:number; title:string; slug:string; description:string; limitations?:string; available:boolean; applications?:{value:string}[]; colors?:string; group?:string}
export type Service = {id:number; title:string; slug:string; description:string; body?:string; kind:'print'|'design'; applications?:string;relatedProjects?:Project[]}
export type Project = {id:number; title:string; slug:string; problem:string; solution:string; result:string; image?:ImageDoc; material?:string; dimensions?:string}
export type Article = {id:number; title:string; slug:string; description:string; body:string; image?:ImageDoc}
export type FAQ = {id:number; question:string; answer:string}
export type Website = {
  heroTitle?:string; heroDescription?:string; heroImage?:ImageDoc; heroMaterial?:string; heroLayer?:string;
  aboutTitle?:string; aboutText?:string; ownerImage?:ImageDoc; workshopImages?:{image:ImageDoc}[];
  phone?:string; email?:string; hours?:string; area?:string; address?:string; pickupEnabled?:boolean;
  instagram?:string; facebook?:string; sellerName?:string; nip?:string;
  privacyText?:string; termsText?:string; cookiesText?:string; launchReady?:boolean;
}
