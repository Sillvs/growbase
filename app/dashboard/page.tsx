"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { ProtectedRoute } from "@/components/protected-route"
import { OnboardingDialog } from "@/components/onboarding-dialog"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import type { GSCMetrics, GSCTimeSeriesData, GSCPageData } from "@/lib/gsc/types"

import data from "./data.json"

export default function Page() {
  const { user } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [gscMetrics, setGscMetrics] = useState<GSCMetrics | null>(null)
  const [gscTimeSeries, setGscTimeSeries] = useState<GSCTimeSeriesData[]>([])
  const [gscTopPages, setGscTopPages] = useState<GSCPageData[]>([])
  const [hasGSCConnection, setHasGSCConnection] = useState(false)
  const [loadingGSC, setLoadingGSC] = useState(true)

  useEffect(() => {
    if (user) {
      // Check if user has completed onboarding
      const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`)
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true)
      }

      // Check GSC connection and fetch data
      const fetchGSCData = async () => {
        try {
          setLoadingGSC(true)

          // Check if user has GSC connected
          const statusResponse = await fetch('/api/gsc/status')
          const { connected } = await statusResponse.json()
          setHasGSCConnection(connected)

          if (connected) {
            // Calculate date range (last 28 days)
            const endDate = new Date()
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - 28)

            const formatDate = (date: Date) => date.toISOString().split('T')[0]

            // Fetch all GSC data
            const dataResponse = await fetch(
              `/api/gsc/data?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`
            )

            if (dataResponse.ok) {
              const data = await dataResponse.json()
              setGscMetrics(data.metrics)
              setGscTimeSeries(data.timeSeries)
              setGscTopPages(data.topPages)
            }
          }
        } catch (error) {
          console.error('Error fetching GSC data:', error)
        } finally {
          setLoadingGSC(false)
        }
      }

      fetchGSCData()
    }
  }, [user])

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true')
    }
    setShowOnboarding(false)
  }

  return (
    <ProtectedRoute>
      <div className={showOnboarding ? 'blur-sm' : ''}>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <SectionCards
                    gscMetrics={gscMetrics}
                    hasGSCConnection={hasGSCConnection}
                    loadingGSC={loadingGSC}
                  />
                  <div className="px-4 lg:px-6">
                    <ChartAreaInteractive
                      gscTimeSeries={gscTimeSeries}
                      hasGSCConnection={hasGSCConnection}
                    />
                  </div>
                  <DataTable
                    data={hasGSCConnection && gscTopPages.length > 0 ? gscTopPages : data}
                    isGSCData={hasGSCConnection && gscTopPages.length > 0}
                  />
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>

      <OnboardingDialog
        open={showOnboarding}
        onOpenChange={(open) => {
          if (!open) {
            handleOnboardingComplete()
          }
        }}
      />
    </ProtectedRoute>
  )
}
