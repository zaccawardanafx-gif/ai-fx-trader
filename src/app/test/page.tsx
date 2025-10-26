export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">🧪 Test Center</h1>
        <p className="text-blue-200 text-center mb-8">
          ✅ If you can see this page, the AI FX Trader app is working correctly!
        </p>
        
        <div className="space-y-4">
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Available Tests</h2>
            <div className="space-y-3">
              <a 
                href="/test-email" 
                className="block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                📧 Email Test
                <span className="block text-sm text-purple-200 mt-1">
                  Test basic email notification system
                </span>
              </a>
              
              <a 
                href="/settings" 
                className="block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                ⚙️ Auto-Generation Settings
                <span className="block text-sm text-green-200 mt-1">
                  Configure automatic trade idea generation
                </span>
              </a>
            </div>
          </div>

          <div className="bg-gray-500/20 border border-gray-400/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Next.js App:</span>
                <span className="text-green-300 font-semibold">✅ Running</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">React Components:</span>
                <span className="text-green-300 font-semibold">✅ Loaded</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Tailwind CSS:</span>
                <span className="text-green-300 font-semibold">✅ Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Timestamp:</span>
                <span className="text-blue-300 font-mono">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a 
              href="/dashboard" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

