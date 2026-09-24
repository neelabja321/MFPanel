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

export function delay(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function generateId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}
