import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { Project } from '@/lib/types'
import { RealizationImage } from './RealizationImage'

export function RealizationCard({ project }: { project: Project }) {
  const image = project.cardImage?.url ? project.cardImage : project.image

  return (
    <Link href={`/realizacje/${project.slug}`} className="realization-card" prefetch={false}>
      <RealizationImage key={`${image?.url}-${project.image?.url}`} src={image?.url} fallbackSrc={project.image?.url} alt={project.image?.alt || image?.alt || project.title} />
      <span className="mono muted">{[project.material, project.dimensions].filter(Boolean).join(' / ')}</span>
      <h3>{project.title}</h3>
      <p>{project.result}</p>
      <ArrowUpRight size={20} aria-hidden="true" />
    </Link>
  )
}
