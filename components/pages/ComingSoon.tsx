'use client'

interface ComingSoonProps {
  onBack: () => void
  title: string
}

export default function ComingSoon({ onBack, title }: ComingSoonProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
      <div className="text-center space-y-6 max-w-2xl w-full">
        <div className="bg-black/50 border-4 border-yellow-500 rounded-lg p-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-4">
              <img src="/1.png" alt="Coming Soon" className="w-16 h-16 object-contain" />
            </div>
            <h1 
              className="text-4xl font-bold text-yellow-300 mb-4"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '32px', lineHeight: '1.5' }}
            >
              {title}
            </h1>
            <div className="space-y-4">
              <p 
                className="text-2xl font-bold text-white"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '24px' }}
              >
                Coming Soon
              </p>
              <p 
                className="text-yellow-200 text-lg"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px', lineHeight: '1.6' }}
              >
                This feature is currently under development and will be available soon.
              </p>
              <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-lg p-4 mt-6">
                <p 
                  className="text-yellow-300 text-sm"
                  style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                >
                  Stay tuned for exciting updates!
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 border-4 border-black shadow-lg"
          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px' }}
        >
          Back
        </button>
      </div>
    </div>
  )
}

