import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import type { GSCMetrics } from "@/lib/gsc/types"

interface SectionCardsProps {
  gscMetrics?: GSCMetrics | null
  hasGSCConnection?: boolean
  loadingGSC?: boolean
}

export function SectionCards({ gscMetrics, hasGSCConnection, loadingGSC }: SectionCardsProps) {
  if (loadingGSC) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (!hasGSCConnection) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Verbinden Sie Ihre Google Search Console</CardTitle>
            <CardDescription>
              Um Ihre SEO-Metriken zu sehen, verbinden Sie bitte Ihre Google Search Console.
            </CardDescription>
            <div className="pt-4">
              <Button onClick={() => window.location.href = '/api/gsc/auth'}>
                Google Search Console verbinden
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    )
  }
  const clicks = gscMetrics?.clicks || 0
  const impressions = gscMetrics?.impressions || 0
  const ctr = gscMetrics?.ctr ? (gscMetrics.ctr * 100).toFixed(2) : '0.00'
  const position = gscMetrics?.position ? gscMetrics.position.toFixed(1) : '0.0'

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Klicks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {clicks.toLocaleString('de-DE')}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Letzte 28 Tage
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Google Search Console
          </div>
          <div className="text-muted-foreground">
            Gesamte Klicks aus der Suche
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Impressionen</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {impressions.toLocaleString('de-DE')}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Letzte 28 Tage
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Sichtbarkeit in der Suche
          </div>
          <div className="text-muted-foreground">
            Wie oft Ihre Seite angezeigt wurde
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>CTR (Klickrate)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {ctr}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {parseFloat(ctr) >= 3 ? <IconTrendingUp /> : <IconTrendingDown />}
              {parseFloat(ctr) >= 3 ? 'Gut' : 'Verbesserbar'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Engagement-Metrik
          </div>
          <div className="text-muted-foreground">Klicks ÷ Impressionen</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Durchschn. Position</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {position}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {parseFloat(position) <= 10 ? <IconTrendingUp /> : <IconTrendingDown />}
              {parseFloat(position) <= 10 ? 'Erste Seite' : 'Optimierung nötig'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Ranking-Performance
          </div>
          <div className="text-muted-foreground">Durchschnittliches Ranking</div>
        </CardFooter>
      </Card>
    </div>
  )
}
