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
  comingSoon?: boolean
}

export default function FeatureCard({ title, description, href, Icon, accentBg, accentText, accentBorder, comingSoon }: FeatureCardProps) {
  if (comingSoon) {
    return (
      <div className="block h-full cursor-not-allowed">
        <Card className={`h-full border-t-2 ${accentBorder} opacity-60`}>
          <CardHeader className="items-center text-center p-8">
            <div className="relative">
              <div className={`rounded-lg p-3 ${accentBg}`}>
                <Icon className={`h-6 w-6 ${accentText}`} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{title}</CardTitle>
              <span className="text-xs font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">Soon</span>
            </div>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

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
