import Link from 'next/link'
import {ArrowUpRight} from 'lucide-react'
import {PrintLoader} from '../PrintLoader'
export function SubmissionSuccess({number}:{number:string}){
    return (
      <section className="submission-success form-card" role="status">
        <div className="submission-success__badge">
          <PrintLoader success />
        </div>
        <h2 tabIndex={-1}>Twój pomysł jest już u nas.</h2>
        <p className="submission-success__intro">
          Zapisaliśmy Twoje zapytanie. Odpowiemy na podany adres e-mail z dokładną oceną technologiczną, wyceną oraz terminem wykonania.
        </p>

        <div className="submission-number-box">
          <span className="mono muted">NUMER TWOJEGO ZAPYTANIA</span>
          <div className="submission-number">{number}</div>
        </div>

        {/* Krótka oś „co dalej” (ocena → wycena → wykonanie → odbiór) */}
        <div className="next-steps-timeline">
          <h3 className="mono muted">CO DZIEJE SIĘ DALEJ?</h3>
          <div className="timeline-grid">
            <div className="timeline-step">
              <span className="step-num mono">01</span>
              <h4>Ocena techniczna</h4>
              <p>Sprawdzamy geometrię modelu, grubość ścianek i dobór dyszy.</p>
            </div>
            <div className="timeline-step">
              <span className="step-num mono">02</span>
              <h4>Wycena i dobór materiału</h4>
              <p>Przesyłamy konkretną cenę, propozycję materiału i termin.</p>
            </div>
            <div className="timeline-step">
              <span className="step-num mono">03</span>
              <h4>Realizacja po Twojej zgodzie</h4>
              <p>Drukujemy dopiero po Twojej pełnej akceptacji ustaleń.</p>
            </div>
            <div className="timeline-step">
              <span className="step-num mono">04</span>
              <h4>Odbiór lub wysyłka</h4>
              <p>Bezpiecznie pakujemy i wysyłamy lub przygotowujemy do odbioru.</p>
            </div>
          </div>
        </div>

        <div className="submission-success__actions">
          <Link className="btn btn--primary" href="/">
            Wróć do strony głównej <ArrowUpRight size={18} />
          </Link>
          <Link className="btn btn--secondary" href="/projekty">
            Zobacz gotowe projekty
          </Link>
        </div>
      </section>
    )
}
