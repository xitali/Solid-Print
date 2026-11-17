import type { Service } from '@/lib/types'

export function ServiceExtraDetails({ service, detailPage }: { service: Service; detailPage?: boolean }) {
  const Heading = detailPage ? 'h2' : 'h3'

  return (
    <>
      {[
        { title: 'Wymagania', text: service.requirements?.trim() },
        { title: 'Dodatkowe informacje', text: service.additionalInfo?.trim() },
      ].map(({ title, text }) => text && (
        <section className="service-details" key={title}>
          <Heading className="service-details-heading">{title}</Heading>
          <div className="service-details-text">{text}</div>
        </section>
      ))}
    </>
  )
}
