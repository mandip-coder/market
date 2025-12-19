"use client"

import { logoutAction } from "@/lib/actions/signOut"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

function formatTime(ms: number) {
  if (ms <= 0) return "00:00"

  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}` // HH:MM:SS
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}` // MM:SS
}

export function SessionCountdown() {
  const { data: session } = useSession()
  const [remaining, setRemaining] = useState<number | null>(null)
  useEffect(() => {
    if (!session?.expires) {
      setRemaining(null)
      return
    }

    const expiresAt = session.accessTokenExpires || 0// ms timestamp
    const calcRemaining = () => expiresAt - Date.now()

    // initial set
    setRemaining(calcRemaining())

    const intervalId = setInterval(async () => {
      const r = calcRemaining()
      setRemaining(r)

      // optional: auto logout jab expire ho jaye
      if (r <= 0) {
        clearInterval(intervalId)
        const res = await logoutAction()
        if (res.success) {
          toast.success('Logout successful');
        } else {
          toast.error(res.error);
        }
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [session])


  if (!session) {
    return null
  }

  if (!session.accessTokenExpires || remaining === null) {
    return <span>Session time: unknown</span>
  }

  const isExpired = remaining <= 0
  return null
  // return (
  //   <div style={{ fontSize: 14 }}>
  //     {isExpired ? (
  //       <span>Session expired (please sign in again)</span>
  //     ) : (
  //       <span>
  //         Session logout in: <strong>{formatTime(remaining)}</strong>
  //       </span>
  //     )}
  //   </div>
  // )
}
