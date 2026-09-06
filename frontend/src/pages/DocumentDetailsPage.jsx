import { useParams } from 'react-router-dom'
import { RoutePlaceholder } from '@/components/ui/route-placeholder.jsx'

export function DocumentDetailsPage() {
  const { id } = useParams()
  return (
    <RoutePlaceholder
      title="Document Analysis"
      description={`Detailed compliance analysis for document ${id}.`}
    />
  )
}
