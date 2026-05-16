import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DashboardLoading() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-400 animate-pulse">Loading projects...</p>
    </div>
  )
}
