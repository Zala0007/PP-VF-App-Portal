'use client'
import { useEffect } from 'react'

export default function GlobalError({ error }: { error: Error }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="card">
      <h1 className="text-2xl font-semibold">500 — Server Error</h1>
      <p className="mt-2 text-sm text-slate-600">An unexpected error occurred.</p>
      <div className="mt-4"><a href="/" className="text-ldceBlue">Back to Home</a></div>
    </div>
  )
}
