import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface FeatureCardProps {
  title: string
  description: string
  href: string
  Icon: LucideIcon
  accentBg: string
  accentText: string
  accentBorder: string
}

export default function FeatureCard({ title, description, href, Icon, accentBg, accentText, accentBorder }: FeatureCardProps) {
  return (
    <Link to={href} className="block h-full">
      <Card className={`h-full cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all border-t-2 ${accentBorder}`}>
        <CardHeader className="items-center text-center p-8">
          <div className={`rounded-lg p-3 ${accentBg}`}>
            <Icon className={`h-6 w-6 ${accentText}`} />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
