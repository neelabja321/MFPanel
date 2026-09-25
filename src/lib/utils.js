import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  // Guard against invalid or placeholder dates (e.g. "-000001-11-30...").
  if (isNaN(date.getTime()) || date.getFullYear() < 1900) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/**
 * Readable message out of an axios error. Server-side crashes (500s) are
 * reported as-is by Laravel, which is useful for debugging but not for users,
 * so the raw text is returned separately from the friendly summary.
 */
export function getApiError(err) {
  if (!err) return { message: '', detail: '', status: undefined, isServerFault: false }

  const status = err.response?.status
  const detail =
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    'Unknown error'
  const isServerFault = status >= 500 || /array_column|SQLSTATE|Undefined|TypeError/i.test(detail)

  let message = detail
  if (status === 401) message = 'Your session has expired. Please sign in again.'
  else if (status === 403) message = 'You do not have permission to do this.'
  else if (status === 404) message = 'Not found.'
  else if (isServerFault) message = 'The server could not process this request.'

  return { message, detail, status, isServerFault }
}

export function delay(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function generateId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}
