import { useInfiniteGetDemands } from "@/api/demands/hooks"
import { FeedFilter, type DemandsFilterValue } from "./components/feed-filter"
import { useEffect, useRef, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { DialogDemandForm } from "../private/demands/components/dialog-demand-form"
import { FeedEmptyState } from "./components/feed-empty-state"
import { Post } from "@/components/post"
import { Loading } from "@/components/loading"
import { useNavigationCity } from "@/contexts/navigation-city-context"

export function Feed() {
  const { navigationCity } = useNavigationCity()

  const [filters, setFilters] = useState<DemandsFilterValue>({
    search: "",
    status: [],
    categories: [],
    priority: null,
    dateRange: undefined,
    neighborhood: null,
    unassignedOnly: false,
  })

  const sentinelRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [filters])

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteGetDemands({
    search: filters.search.trim() || undefined,
    priority: filters.priority ?? undefined,
    statuses: filters.status.length > 0 ? filters.status : undefined,
    categories: filters.categories.length > 0 ? filters.categories : undefined,
    startDate: filters.dateRange?.from?.toISOString(),
    endDate: filters.dateRange?.to?.toISOString(),
    neighborhood: filters.neighborhood ?? undefined,
    unassignedOnly: filters.unassignedOnly || undefined,
    city: navigationCity?.city,
    state: navigationCity?.state,
    limit: 20,
  })

  const demands = data?.pages.flatMap((p) => p.items) ?? []

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="max-w-4xl mx-auto md:flex items-start gap-6">
      <FeedFilter value={filters} onChange={setFilters} resultCount={demands.length} />

      <Separator className="my-4 md:hidden" />

      <div className="flex-1 flex flex-col gap-4">
        <DialogDemandForm />

        {isLoading ? (
          <div className="items-center justify-center flex py-4">
            <Loading className="text-primary size-6" />
          </div>
        ) : demands.length === 0 ? (
          <FeedEmptyState search={filters.search} />
        ) : (
          <>
            {demands.map((demand, i) => (
              <div
                key={demand.id}
                className="animate-fade-slide-in"
                style={{ animationDelay: `${Math.min(i, 9) * 40}ms` }}
              >
                <Post demand={demand} />
              </div>
            ))}

            <div ref={sentinelRef} className="py-2 flex justify-center">
              {isFetchingNextPage && (
                <div className="items-center justify-center flex-col gap-2 flex py-10">
                  <Loading className="text-primary size-6" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
