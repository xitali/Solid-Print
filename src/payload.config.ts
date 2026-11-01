import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig, type CollectionConfig, type Field, type Access } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { r2Storage } from '@payloadcms/storage-r2'
import { onCloudflare, bindings } from './lib/cloudflare'
import { pl } from '@payloadcms/translations/languages/pl'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

const cloud = onCloudflare ? await bindings() : null
const dirname = path.dirname(fileURLToPath(import.meta.url))
const owner: Access = ({ req }) => Boolean(req.user && req.user.role === 'owner')
const published: Access = ({req}) => req.user ? true : { published: { equals: true } }
const title: Field = {name:'title',label:'Nazwa / tytuł',type:'text',required:true}
const slug: Field = {name:'slug',label:'Adres (np. uchwyt-do-lampy)',type:'text',required:true,unique:true,index:true,validate:(value:unknown)=> typeof value==='string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || 'Użyj małych liter bez polskich znaków, cyfr i myślników.'}
const description: Field = {name:'description',label:'Opis',type:'textarea',required:true}
const publication: Field = {name:'published',label:'Opublikowane',type:'checkbox',defaultValue:false,admin:{position:'sidebar'}}
const applications: Field = {name:'applications',label:'Zastosowania',labels:{singular:'Zastosowanie',plural:'Zastosowania'},type:'array',fields:[{name:'value',label:'Zastosowanie',type:'text',required:true}]}
const image: Field = {name:'image',label:'Zdjęcie',type:'upload',relationTo:'media'}
const content = (slugName:string, singular:string, plural:string,fields:Field[]): CollectionConfig => ({
  slug:slugName, labels:{singular,plural}, admin:{useAsTitle:'title',group:'Treści strony',defaultColumns:['title','published','updatedAt']},
  access:{read:published,create:owner,update:owner,delete:owner},fields:[title,slug,...fields,publication],
})
const privateCollection = (slugName:string,label:string,fields:Field[]): CollectionConfig => ({
  slug:slugName, labels:{singular:label,plural:label},admin:{group:'Obsługa zapytań'},
  access:{read:owner,create:()=>false,update:owner,delete:owner},fields,
})
export default buildConfig({
  secret:process.env.PAYLOAD_SECRET || 'build-only-secret-not-for-production',
  serverURL:process.env.NEXT_PUBLIC_SERVER_URL || 'http://127.0.0.1:3000',
  i18n:{fallbackLanguage:'pl',supportedLanguages:{pl}},
  admin:{user:'users',importMap:{baseDir:dirname},meta:{titleSuffix:' — Solid Print'},components:{graphics:{Logo:'/components/admin/Logo#Logo',Icon:'/components/admin/Logo#Icon'},beforeLogin:['/components/admin/Welcome#Welcome'],beforeDashboard:['/components/admin/Dashboard#Dashboard']}},
  typescript:{outputFile:path.resolve(dirname,'payload-types.ts')},
  db:cloud ? sqliteD1Adapter({binding:cloud.D1, migrationDir:path.resolve(dirname,'migrations-d1'),push:false}) : postgresAdapter({pool:{connectionString:process.env.DATABASE_URL},push:process.env.ALLOW_SCHEMA_PUSH==='true'}),
  ...(cloud ? {} : {sharp}),
  logger: cloud ? {options:{enabled:true},destination:{write:(line:string)=>console.log(line.trim())}} : undefined,
  email:cloud ? (()=>({name:'unconfigured',defaultFromAddress:'noreply@solidprint.emanuelwloch.pl',defaultFromName:'Solid Print',sendEmail:async()=>{throw new Error('Poczta nie została jeszcze skonfigurowana.')}})) : nodemailerAdapter({defaultFromAddress:process.env.SMTP_FROM?.match(/<([^>]+)>/)?.[1]||'powiadomienia@solidprint.local',defaultFromName:'Solid Print',transportOptions:{host:process.env.SMTP_HOST||'127.0.0.1',port:Number(process.env.SMTP_PORT||51025),secure:process.env.SMTP_SECURE==='true',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined}}),
  collections:[
    {slug:'users',labels:{singular:'Właściciel',plural:'Właściciele'},auth:{maxLoginAttempts:5,lockTime:600000},admin:{useAsTitle:'email',group:'Ustawienia'},access:{read:owner,create:owner,update:owner,delete:owner},fields:[{name:'name',label:'Imię',type:'text'},{name:'role',type:'select',defaultValue:'owner',required:true,options:[{label:'Właściciel',value:'owner'}],access:{update:()=>false}}]},
    {slug:'media',labels:{singular:'Zdjęcie',plural:'Zdjęcia'},admin:{group:'Treści strony'},access:{read:()=>true,create:owner,update:owner,delete:owner},upload:{staticDir:path.resolve('.data/public-media'),mimeTypes:['image/jpeg','image/png','image/webp'],...(cloud?{}:{imageSizes:[{name:'card' as const,width:800,height:600,position:'centre' as const}]})},fields:[{name:'alt',label:'Opis zdjęcia dla czytników ekranu',type:'text',required:true}]},
    content('products','Produkt','Gotowe projekty',[
      description,{name:'category',label:'Kategoria',type:'text'},applications,
      {name:'material',label:'Materiał',type:'text'},{name:'dimensions',label:'Wymiary (z jednostką)',type:'text'},
      {name:'layerHeight',label:'Wysokość warstwy',type:'text'},{name:'priceFrom',label:'Cena od (PLN, brutto)',type:'number',min:0},
      {name:'leadTime',label:'Orientacyjny termin',type:'text'},{name:'personalization',label:'Możliwości personalizacji',type:'textarea'},
      {name:'available',label:'Przyjmuj zapytania o ten produkt',type:'checkbox',defaultValue:true},
      {name:'featured',label:'Wyróżnij na stronie głównej',type:'checkbox'},
      {name:'variants',label:'Warianty',labels:{singular:'Wariant',plural:'Warianty'},type:'array',fields:[{name:'name',label:'Nazwa wariantu',type:'text',required:true},{name:'color',label:'Kolor',type:'text'}]},
      {name:'images',label:'Galeria',labels:{singular:'Zdjęcie',plural:'Zdjęcia'},type:'array',fields:[{...image,required:true},{name:'caption',label:'Podpis',type:'text'}]},
    ]),
    content('materials','Materiał','Materiały',[description,{name:'limitations',label:'Ograniczenia',type:'textarea'},applications,{name:'colors',label:'Dostępne kolory',type:'text'},{name:'group',label:'Grupa',type:'select',options:[{label:'Dekoracyjne',value:'decorative'},{label:'Techniczne',value:'technical'},{label:'Elastyczne',value:'flexible'},{label:'Na zewnątrz',value:'outdoor'}]},{name:'available',label:'Dostępny',type:'checkbox',defaultValue:true}]),
    content('services','Usługa','Usługi',[description,{name:'body',label:'Szczegóły (akapity oddziel pustą linią)',type:'textarea'},{name:'applications',label:'Zastosowania',type:'textarea'},{name:'relatedProjects',label:'Powiązane realizacje',type:'relationship',relationTo:'projects',hasMany:true},{name:'kind',label:'Rodzaj formularza',type:'select',required:true,defaultValue:'print',options:[{label:'Druk z pliku',value:'print'},{label:'Projektowanie',value:'design'}]}]),
    content('projects','Realizacja','Realizacje',[{name:'problem',label:'Problem',type:'textarea',required:true},{name:'solution',label:'Projekt / rozwiązanie',type:'textarea',required:true},{name:'result',label:'Efekt',type:'textarea',required:true},image,{name:'material',label:'Materiał',type:'text'},{name:'dimensions',label:'Wymiary',type:'text'}]),
    content('articles','Artykuł','Poradnik',[description,{name:'body',label:'Treść (akapity oddziel pustą linią)',type:'textarea',required:true},image]),
    {slug:'faqs',labels:{singular:'Pytanie',plural:'FAQ'},admin:{useAsTitle:'question',group:'Treści strony'},access:{read:published,create:owner,update:owner,delete:owner},fields:[{name:'question',label:'Pytanie',type:'text',required:true},{name:'answer',label:'Odpowiedź',type:'textarea',required:true},{name:'order',label:'Kolejność',type:'number',defaultValue:0},publication]},
    {...privateCollection('inquiries','Zapytania',[
      {name:'number',label:'Numer',type:'text',unique:true,index:true,admin:{readOnly:true}},
      {name:'idempotencyKey',type:'text',unique:true,index:true,admin:{hidden:true}},
      {name:'sessionId',type:'text',unique:true,index:true,admin:{hidden:true}},
      {name:'type',label:'Rodzaj',type:'select',options:[{label:'Druk z pliku',value:'print'},{label:'Projektowanie',value:'design'},{label:'Gotowy produkt',value:'product'},{label:'Kontakt',value:'contact'}]},
      {name:'status',label:'Status',type:'select',defaultValue:'new',options:[{label:'Nowe',value:'new'},{label:'W ocenie',value:'review'},{label:'Oferta wysłana',value:'quoted'},{label:'W realizacji',value:'production'},{label:'Zamknięte',value:'closed'},{label:'Odrzucone',value:'rejected'}]},
      ...['name','email','phone','company','nip','material','color','unit','deadline','delivery'].map((name):Field=>({name,label:({name:'Imię',email:'E-mail',phone:'Telefon',company:'Firma',nip:'NIP',material:'Materiał',color:'Kolor',unit:'Jednostka',deadline:'Oczekiwany termin',delivery:'Dostawa'} as Record<string,string>)[name],type:'text'})),
      {name:'quantity',label:'Liczba sztuk',type:'number'},{name:'description',label:'Opis i zastosowanie',type:'textarea'},
      {name:'productSnapshot',label:'Produkt w chwili zapytania',type:'json',admin:{readOnly:true}},
      {name:'files',label:'Załączniki',type:'relationship',relationTo:'quote-files',hasMany:true},
      {name:'notes',label:'Notatki wewnętrzne',type:'textarea'},{name:'closedAt',label:'Data zamknięcia',type:'date',admin:{readOnly:true}},
    ]),hooks:{beforeChange:[({data,originalDoc})=>{if(['closed','rejected'].includes(data.status)&&!originalDoc?.closedAt)data.closedAt=new Date().toISOString();else if(data.status&&!['closed','rejected'].includes(data.status))data.closedAt=null;return data}]}},
    privateCollection('quote-files','Prywatne pliki',[
      {name:'name',label:'Nazwa pliku',type:'text',required:true},{name:'size',label:'Rozmiar w bajtach',type:'number',required:true},
      {name:'kind',label:'Typ',type:'select',options:['model','reference'],required:true},
      {name:'sessionId',type:'text',index:true,admin:{hidden:true}},{name:'objectKey',type:'text',admin:{hidden:true}},
      {name:'contentHash',label:'SHA-256 zawartości',type:'text',admin:{readOnly:true}},
      {name:'status',label:'Stan',type:'select',defaultValue:'pending',options:[{label:'Oczekiwanie na przesłanie',value:'pending'},{label:'Przesyłanie',value:'uploading'},{label:'Kwarantanna — oczekuje na skan',value:'quarantined'},{label:'Bezpieczny — pobierz',value:'clean'},{label:'Wykryto zagrożenie',value:'infected'}]},
      {name:'scanMessage',label:'Wynik skanowania',type:'text'},{name:'inquiryId',type:'text',index:true,admin:{hidden:true}},
      {name:'download',type:'ui',admin:{components:{Field:'/components/admin/Download#Download'}}},
    ]),
    {...privateCollection('upload-sessions','Sesje plików',[{name:'tokenHash',type:'text',index:true},{name:'expiresAt',type:'date'},{name:'ipHash',type:'text',index:true},{name:'inquiryId',type:'text'}]),admin:{hidden:true}},
    {...privateCollection('outbox','Kolejka pocztowa',[{name:'to',label:'Odbiorca',type:'email',required:true},{name:'subject',label:'Temat',type:'text',required:true},{name:'text',type:'textarea',required:true},{name:'state',label:'Stan',type:'select',defaultValue:'pending',options:['pending','sent','failed']},{name:'attempts',type:'number',defaultValue:0},{name:'nextAttemptAt',type:'date'},{name:'lastError',type:'text'}]),admin:{group:'Obsługa zapytań',defaultColumns:['to','subject','state','attempts']}},
    {...privateCollection('rate-limits','Limity',[{name:'key',type:'text',index:true},{name:'expiresAt',type:'date'}]),admin:{hidden:true}},
  ],
  globals:[{slug:'website',label:'Ustawienia strony',access:{read:()=>true,update:owner},fields:[
    {type:'tabs',tabs:[
      {label:'Strona główna',fields:[{name:'heroTitle',label:'Nagłówek',type:'text',defaultValue:'Od pomysłu do gotowego wydruku 3D'},{name:'heroDescription',label:'Wprowadzenie',type:'textarea',defaultValue:'Projektowanie i druk 3D dla Twojego pomysłu. Od pojedynczej części po gotowy produkt — porozmawiajmy o tym, czego potrzebujesz.'},{name:'heroImage',label:'Prawdziwe zdjęcie wydruku',type:'upload',relationTo:'media'},{name:'heroMaterial',label:'Materiał na zdjęciu',type:'text'},{name:'heroLayer',label:'Warstwa na zdjęciu',type:'text'}]},
      {label:'Pracownia',fields:[{name:'aboutTitle',label:'Nagłówek',type:'text',defaultValue:'Za każdym wydrukiem stoi człowiek.'},{name:'aboutText',label:'Opis doświadczenia',type:'textarea'},{name:'ownerImage',label:'Zdjęcie właściciela',type:'upload',relationTo:'media'},{name:'workshopImages',label:'Zdjęcia pracowni i drukarek',type:'array',fields:[{...image,required:true}]}]},
      {label:'Kontakt i profile',fields:[...['phone','email','hours','area','address','sellerName','nip'].map((name):Field=>({name,label:({phone:'Telefon',email:'E-mail',hours:'Godziny dostępności',area:'Obszar obsługi',address:'Adres do odwiedzin',sellerName:'Pełna nazwa sprzedawcy',nip:'NIP'} as Record<string,string>)[name],type:name==='email'?'email':'text'} as Field)),{name:'pickupEnabled',label:'Umożliwiaj odbiór osobisty',type:'checkbox'},{name:'instagram',label:'Adres profilu Instagram (https://...)',type:'text',validate:(v:unknown)=>!v || (typeof v==='string' && /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/.test(v)) || 'Wpisz poprawny adres profilu Instagram.'},{name:'facebook',label:'Adres strony Facebook (https://...)',type:'text',validate:(v:unknown)=>!v || (typeof v==='string' && /^https:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9_.\/-]+$/.test(v)) || 'Wpisz poprawny adres Facebook.'}]},
      {label:'Dokumenty i publikacja',fields:[{name:'privacyText',label:'Polityka prywatności',type:'textarea'},{name:'termsText',label:'Zasady zamówień',type:'textarea'},{name:'cookiesText',label:'Informacje o cookies',type:'textarea'},{name:'launchReady',label:'Dane i dokumenty sprawdzone — gotowe do publikacji',type:'checkbox',defaultValue:false}]},
    ]},
  ]}],
  plugins:cloud ? [r2Storage({bucket:cloud.MEDIA as unknown as Parameters<typeof r2Storage>[0]['bucket'],collections:{media:{prefix:'public-media'}}})] : process.env.S3_ENDPOINT ? [s3Storage({bucket:process.env.S3_BUCKET || 'solid-print-private',collections:{media:{prefix:'public-media'}},config:{endpoint:process.env.S3_ENDPOINT,region:process.env.S3_REGION||'us-east-1',forcePathStyle:true,credentials:{accessKeyId:process.env.S3_ACCESS_KEY!,secretAccessKey:process.env.S3_SECRET_KEY!}}})] : [],
})
