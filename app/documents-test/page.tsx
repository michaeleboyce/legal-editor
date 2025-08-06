export default function DocumentsTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Documents Test Page</h1>
      <p>This is a static test page to verify routing works.</p>
      <p>If you can see this, the routing is working correctly.</p>
      <p className="mt-4">Timestamp: {new Date().toISOString()}</p>
    </div>
  )
}