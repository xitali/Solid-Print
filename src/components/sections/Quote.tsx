import { SectionLabel } from '@/components/Brand'
import { QuoteForm } from '@/components/QuoteForm'
import { list } from '@/lib/cms'
import type { Material,Product } from '@/lib/types'
type SectionProps = {section:string;query:Record<string,string|undefined>;settings:import("@/lib/types").Website;title:string}
export default async function Quote({query,settings:s}:SectionProps){

    const [products, materials] = await Promise.all([list<Product>('products'), list<Material>('materials')])
    const product = products.find((p) => String(p.id) === query.product)
    return (
      <div className="quote-page">
        <header className="page-head container">
          <SectionLabel>TWÓJ POMYSŁ ZACZYNA SIĘ TUTAJ</SectionLabel>
          <h1>Nadajmy mu kształt.</h1>
          <p>
            Prześlij model lub opowiedz, czego potrzebujesz. Sprawdzimy możliwości i przygotujemy indywidualną
            wycenę.
          </p>
          <div className="form-legend mono">
            <span className="req">*</span> pola wymagane do przygotowania wyceny
          </div>
        </header>
        <div className="container">
          <QuoteForm
            initialType={query.type}
            product={product}
            variant={query.variant}
            materials={materials}
            pickupEnabled={s.pickupEnabled}
            application={query.application}
            initialQuantity={Number(query.quantity) || 1}
            phone={s.phone}
          />
        </div>
      </div>
    )
  
}
