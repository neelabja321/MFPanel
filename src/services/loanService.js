import { loansData } from '@/mock-data/loans'
import { delay, generateId } from '@/lib/utils'

let _loans = [...loansData]

export const loanService = {
  async getAll(filters = {}) {
    await delay()
    let result = [..._loans]
    if (filters.groupId) result = result.filter((l) => l.groupId === filters.groupId)
    if (filters.customerId) result = result.filter((l) => l.customerId === filters.customerId)
    if (filters.status) result = result.filter((l) => l.status === filters.status)
    if (filters.search) {
      const s = filters.search.toLowerCase()
      result = result.filter(
        (l) => l.id.toLowerCase().includes(s) || l.purpose.toLowerCase().includes(s)
      )
    }
    return result
  },

  async getById(id) {
    await delay()
    return _loans.find((l) => l.id === id) || null
  },

  async create(data) {
    await delay()
    const emi = Math.ceil((data.amount * (1 + (data.interestRate / 100))) / data.durationMonths)
    const newLoan = {
      ...data,
      id: 'LOAN' + generateId(),
      paidEmis: 0,
      outstandingAmount: data.amount,
      emiAmount: emi,
      disbursedDate: new Date().toISOString().split('T')[0],
    }
    _loans.push(newLoan)
    return newLoan
  },

  async update(id, data) {
    await delay()
    const idx = _loans.findIndex((l) => l.id === id)
    if (idx === -1) throw new Error('Loan not found')
    _loans[idx] = { ..._loans[idx], ...data }
    return _loans[idx]
  },

  async delete(id) {
    await delay()
    const idx = _loans.findIndex((l) => l.id === id)
    if (idx === -1) throw new Error('Loan not found')
    _loans.splice(idx, 1)
    return true
  },

  async getEmiSchedule(loanId) {
    await delay(400)
    const loan = _loans.find((l) => l.id === loanId)
    if (!loan) return []
    const schedule = []
    const start = new Date(loan.disbursedDate)
    for (let i = 1; i <= loan.durationMonths; i++) {
      const dueDate = new Date(start)
      dueDate.setMonth(dueDate.getMonth() + i)
      schedule.push({
        emiNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: loan.emiAmount,
        status: i <= loan.paidEmis ? 'paid' : 'pending',
      })
    }
    return schedule
  },
}
