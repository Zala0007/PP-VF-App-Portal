"use client"

import { FormEvent, useState } from 'react'
import { CalendarDays, Clock, MapPin, X } from 'lucide-react'
import type { InterviewDetails } from '@/lib/candidateStatusEmail'

type InterviewDetailsModalProps = {
  candidateName: string
  onCancel: () => void
  onConfirm: (details: InterviewDetails) => void
}

export default function InterviewDetailsModal({ candidateName, onCancel, onConfirm }: InterviewDetailsModalProps) {
  const [details, setDetails] = useState<InterviewDetails>({ date: '', time: '', venue: '' })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onConfirm({ ...details, venue: details.venue.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Interview Details</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Enter details for {candidateName}&apos;s email.</p>
          </div>
          <button suppressHydrationWarning type="button" onClick={onCancel} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="label-field">Interview Date *</span>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input suppressHydrationWarning type="date" required value={details.date} onChange={(event) => setDetails({ ...details, date: event.target.value })} className="input-field pl-10" />
            </div>
          </label>

          <label className="block">
            <span className="label-field">Interview Time *</span>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input suppressHydrationWarning type="time" required value={details.time} onChange={(event) => setDetails({ ...details, time: event.target.value })} className="input-field pl-10" />
            </div>
          </label>

          <label className="block">
            <span className="label-field">Venue *</span>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea suppressHydrationWarning required rows={3} value={details.venue} onChange={(event) => setDetails({ ...details, venue: event.target.value })} className="input-field resize-none pl-10" placeholder="Department, building and room number" />
            </div>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button suppressHydrationWarning type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 font-medium dark:border-gray-700">Cancel</button>
            <button suppressHydrationWarning type="submit" className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700">Continue to Email</button>
          </div>
        </form>
      </div>
    </div>
  )
}
