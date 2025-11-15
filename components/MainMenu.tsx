'use client'

interface MainMenuProps {
  onStartGame: () => void
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900 animate-fadeIn">
      <div className="text-center space-y-6">
        <h1 
          className="text-6xl font-bold text-yellow-300 mb-4 drop-shadow-lg"
          style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '48px', lineHeight: '1.4' }}
        >
          🦍 Ape Run 🦍
        </h1>
        <p 
          className="text-xl text-yellow-200" 
          style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', lineHeight: '1.8' }}
        >
          Climb the tree!<br/>
          Dodge the branches!<br/>
          Collect the bananas!
        </p>
      </div>

      <div className="space-y-4 w-full max-w-md px-4">
        <button
          onClick={onStartGame}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-6 px-8 rounded-lg transition-all duration-200 border-4 border-yellow-700 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
          style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '20px' }}
        >
          Play Game
        </button>

        <div 
          className="bg-black/50 border-4 border-yellow-500 rounded-lg p-6 text-center"
          style={{ fontFamily: '"Press Start 2P", cursive' }}
        >
          <p className="text-yellow-300 text-xs mb-2">How to Play:</p>
          <p className="text-white text-xs leading-relaxed">
            Swipe left/right or use arrow keys to move your ape. Avoid branches and collect bananas!
          </p>
        </div>

        <div className="text-center text-gray-400 text-xs pt-4">
          <p style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px' }}>
            Use the menu button ☰ to access more features
          </p>
        </div>
      </div>

      {/* Animated decorations */}
      <div className="absolute top-10 left-10 text-4xl animate-bounce">🍌</div>
      <div className="absolute top-20 right-20 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🍌</div>
      <div className="absolute bottom-20 left-20 text-4xl animate-bounce" style={{ animationDelay: '1s' }}>🦍</div>
      <div className="absolute bottom-10 right-10 text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}>🌴</div>
    </div>
  )
}

