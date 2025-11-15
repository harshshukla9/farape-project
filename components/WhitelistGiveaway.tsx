'use client'

import { useFrame } from '@/components/farcaster-provider'
import { useState, useEffect } from 'react'

interface WhitelistTask {
  id: string
  title: string
  description: string
  completed: boolean
  isLoading: boolean
  action: () => void
}

export function WhitelistGiveaway() {
  const { context, actions } = useFrame()
  const [tasks, setTasks] = useState<WhitelistTask[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const fid = context?.user?.fid
  const username = context?.user?.username
  const pfpUrl = context?.user?.pfpUrl

  // Initialize tasks
  useEffect(() => {
    const initialTasks: WhitelistTask[] = [
      {
        id: 'follow',
        title: 'Follow Account',
        description: 'Follow @recess account',
        completed: false,
        isLoading: false,
        action: () => {
          actions?.viewProfile({ fid: 1317071 })
        },
      },
      {
        id: 'miniapp',
        title: 'Add Mini App',
        description: 'Add FarApe to your mini apps',
        completed: false,
        isLoading: false,
        action: () => {
          actions?.addMiniApp()
        },
      },
      {
        id: 'cast',
        title: 'Cast About App',
        description: 'Share a cast about FarApe',
        completed: false,
        isLoading: false,
        action: () => {
          actions?.composeCast({
            text: 'Just discovered FarApe! 🐵\n\nGet Exclusive NFTs + 100x Utilities + Airdrops. Join the whitelist now! to get the NEW META',
            embeds: ['https://farcaster.xyz/miniapps/sqYk09wRm676/farape'],
          })
        },
      },
      {
        id: 'like',
        title: 'Like Post',
        description: 'Like our announcement post',
        completed: false,
        isLoading: false,
        action: () => {
          actions?.viewCast({ hash: '0xf8978e1b' as `0x${string}` })
        },
      },
      {
        id: 'quote',
        title: 'Quote Cast',
        description: 'Quote our announcement with your excitement',
        completed: false,
        isLoading: false,
        action: () => {
          actions?.viewCast({ hash: '0xc756f567' as `0x${string}` })
        },
      },
    ]

    setTasks(initialTasks)

    // Check if user already submitted (localStorage)
    if (fid) {
      const submittedKey = `whitelist_submitted_${fid}`
      const submitted = localStorage.getItem(submittedKey)
      if (submitted === 'true') {
        setHasSubmitted(true)
      }
    }
  }, [fid, actions])

  const handleTaskAction = async (taskId: string) => {
    // Set loading state
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, isLoading: true } : task
      )
    )

    // Find the task and execute its action
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      task.action()
      
      // After 3 seconds, automatically mark as completed
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, isLoading: false, completed: true } : t
          )
        )
      }, 3000)
    }
  }

  const allTasksCompleted = tasks.every((task) => task.completed)
  const completedCount = tasks.filter((task) => task.completed).length

  const handleSubmit = async () => {
    if (!allTasksCompleted) {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000)
      return
    }

    setIsSubmitting(true)
    try {
      // Call API to register whitelist entry
      const response = await fetch('/api/whitelist-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fid,
          username,
          pfpUrl,
          tasks: tasks.map((t) => ({ id: t.id, completed: t.completed })),
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setHasSubmitted(true)
        if (fid) {
          localStorage.setItem(`whitelist_submitted_${fid}`, 'true')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit')
      }
    } catch (error) {
      console.error('Error submitting whitelist entry:', error)
      alert('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900">
      <div className="w-full max-w-2xl">
        <div className="bg-black/50 border-4 border-yellow-500 rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-red-600 text-white px-4 py-1 rounded-full mb-3 animate-pulse">
              <p 
                className="text-xs font-bold uppercase"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
              >
                Limited Spots Available
              </p>
            </div>
            <h1 
              className="text-4xl font-bold text-yellow-300 mb-4"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '32px', lineHeight: '1.5' }}
            >
              Ape Run  Whitelist            </h1>
            <p 
              className="text-white text-lg mb-3"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '18px', fontWeight: '600' }}
            >
              Get First Access to the Game Launch
            </p>
            <p 
              className="text-yellow-200 text-base mb-4"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '15px' }}
            >
              Be among the first players • Exclusive early access • Get ahead of everyone
            </p>
            <div className="inline-block bg-yellow-500/20 border-2 border-yellow-500 rounded-lg px-6 py-3">
              <p 
                className="text-yellow-300 text-sm font-bold"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
              >
                Complete All Tasks to Secure Your Spot
              </p>
            </div>
          </div>

          {fid ? (
            <div className="space-y-6">
              {/* User Info Card */}
              <div className="bg-purple-800/50 rounded-xl p-4 border-2 border-yellow-500">
                <div className="flex items-center gap-3">
                  {pfpUrl && (
                    <img
                      src={pfpUrl}
                      alt="User PFP"
                      className="w-14 h-14 rounded-full border-2 border-yellow-500 object-cover"
                    />
                  )}
                  <div>
                    <p 
                      className="text-white font-semibold"
                      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                    >
                      @{username || 'user'}
                    </p>
                    <p 
                      className="text-gray-400 text-xs mt-1"
                      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                    >
                      {hasSubmitted ? 'Entry Submitted ✓' : 'Complete tasks to enter'}
                    </p>
                  </div>
                </div>
              </div>

              {hasSubmitted ? (
                /* Success State */
                <div className="space-y-4">
                  <div className="bg-green-800/60 rounded-xl p-6 border-2 border-green-500">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex justify-center">
                      <img src="/2.png" alt="Success" className="w-16 h-16 object-contain" />
                    </div>
                    <div>
                        <h3 
                          className="text-2xl font-bold text-green-200 mb-2"
                          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                        >
                          You're Whitelisted!
                        </h3>
                        <p 
                          className="text-green-100 text-lg mb-2"
                          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px', fontWeight: '600' }}
                        >
                          You'll get first access when the game launches
                        </p>
                        <p 
                          className="text-green-200"
                          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                        >
                          Be ready to play before everyone else!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-800/50 rounded-xl p-4 border-2 border-purple-500">
                    <h4 
                      className="text-purple-200 font-bold mb-2 text-center"
                      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px' }}
                    >
                      What You Get
                    </h4>
                    <div className="space-y-2 text-left">
                      <p 
                        className="text-purple-100 text-sm"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '13px' }}
                      >
                        • First access to the game before public launch
                      </p>
                      <p 
                        className="text-purple-100 text-sm"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '13px' }}
                      >
                        • Early bird advantages and bonuses
                      </p>
                      <p 
                        className="text-purple-100 text-sm"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '13px' }}
                      >
                        • Get ahead of the competition
                      </p>
                      <p 
                        className="text-purple-100 text-sm"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '13px' }}
                      >
                        • Top leaderboard positions available
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-500/20 rounded-xl p-4 border-2 border-yellow-500 text-center">
                    <p 
                      className="text-yellow-200 font-bold"
                      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '15px' }}
                    >
                      Game launching soon. You'll be notified first!
                    </p>
                  </div>
                </div>
              ) : (
                /* Tasks State */
                <div className="space-y-6">
                  {/* FOMO Banner */}
                  <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-4 border-2 border-red-500 animate-pulse">
                    <h3 
                      className="text-white font-bold mb-2 text-center"
                      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '18px' }}
                    >
                      Don't Miss Out!
                    </h3>
                    <p 
                      className="text-white text-sm text-center"
                      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px', lineHeight: '1.6' }}
                    >
                      Be among the FIRST players • Secure top leaderboard spots • Get exclusive early advantages
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="bg-yellow-500/20 rounded-xl p-4 border-2 border-yellow-500">
                    <h3 
                      className="text-yellow-200 font-bold mb-2"
                      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px' }}
                    >
                      Get Whitelisted in 3 Easy Steps:
                    </h3>
                    <p 
                      className="text-yellow-100 text-sm"
                      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '13px', lineHeight: '1.6' }}
                    >
                      Complete all 5 tasks below and submit to secure your first access to the game launch!
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-purple-800/50 rounded-xl p-4 border-2 border-purple-600">
                    <div className="flex items-center justify-between mb-2">
                      <p 
                        className="text-yellow-300 font-semibold"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                      >
                        Your Progress
                      </p>
                      <p 
                        className="text-yellow-200 font-bold"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                      >
                        {completedCount}/{tasks.length}
                      </p>
                    </div>
                    <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`bg-purple-800/40 rounded-xl p-4 border-2 transition-all ${
                          task.completed
                            ? 'border-green-500 bg-green-900/20'
                            : task.isLoading
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-purple-600 hover:border-purple-500'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                task.completed
                                  ? 'border-green-500 bg-green-500/20'
                                  : task.isLoading
                                  ? 'border-blue-500 bg-blue-500/20'
                                  : 'border-yellow-500'
                              }`}
                            >
                              {task.isLoading ? (
                                <div className="animate-spin text-blue-400 text-xs">⟳</div>
                              ) : task.completed ? (
                                <span className="text-green-400 text-sm">✓</span>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex-1">
                            <h4
                              className={`font-bold mb-1 ${
                                task.completed ? 'text-green-200' : task.isLoading ? 'text-blue-200' : 'text-yellow-200'
                              }`}
                              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}
                            >
                              {task.title}
                            </h4>
                            <p 
                              className="text-gray-300 text-xs mb-2"
                              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                            >
                              {task.description}
                            </p>
                            {task.isLoading ? (
                              <span 
                                className="text-blue-300 text-xs font-semibold"
                                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                              >
                                Completing task... Please wait
                              </span>
                            ) : task.completed ? (
                              <span 
                                className="text-green-400 text-xs font-semibold"
                                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                              >
                                Completed
                              </span>
                            ) : (
                              <button
                                onClick={() => handleTaskAction(task.id)}
                                className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold underline transition-colors"
                                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                              >
                                Complete Task →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Warning Message */}
                  {showWarning && (
                    <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-3 animate-pulse">
                      <p 
                        className="text-red-200 text-sm text-center font-semibold"
                        style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
                      >
                        Please complete all tasks before submitting
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!allTasksCompleted || isSubmitting}
                    className={`w-full py-5 font-bold text-lg rounded-xl border-4 border-black transition-all shadow-lg ${
                      allTasksCompleted
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transform hover:scale-105'
                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    }`}
                    style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '18px' }}
                  >
                    {isSubmitting ? 'Securing Your Spot...' : allTasksCompleted ? 'Get First Access Now!' : 'Complete All Tasks First'}
                  </button>

                  {/* Benefits Notice */}
                  <div className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 rounded-xl p-5 border-2 border-purple-500">
                    <h4 
                      className="text-purple-200 font-bold mb-3 text-center"
                      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '16px' }}
                    >
                      Why Join the Whitelist?
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 font-bold">✓</span>
                        <p 
                          className="text-purple-100 text-sm flex-1"
                          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '13px', lineHeight: '1.5' }}
                        >
                          <strong>First Access:</strong> Play before public launch
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 font-bold">✓</span>
                        <p 
                          className="text-purple-100 text-sm flex-1"
                          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '13px', lineHeight: '1.5' }}
                        >
                          <strong>Competitive Edge:</strong> Dominate the leaderboard early
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 font-bold">✓</span>
                        <p 
                          className="text-purple-100 text-sm flex-1"
                          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '13px', lineHeight: '1.5' }}
                        >
                          <strong>Exclusive Perks:</strong> Early bird bonuses & rewards
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 font-bold">✓</span>
                        <p 
                          className="text-purple-100 text-sm flex-1"
                          style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '13px', lineHeight: '1.5' }}
                        >
                          <strong>VIP Status:</strong> Be recognized as an early supporter
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p 
                className="text-white text-lg"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
              >
                Please login to participate in the whitelist giveaway
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Shimmer animation CSS */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-20deg);
          }
          100% {
            transform: translateX(200%) skewX(-20deg);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}

