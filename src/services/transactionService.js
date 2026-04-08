import { transactionsData } from '@/mock-data/transactions'
import { delay } from '@/lib/utils'

let _transactions = [...transactionsData]

export const transactionService = {
  async getAll(filters = {}) {
    await delay()
    let result = [..._transactions]
    if (filters.groupId) result = result.filter((t) => t.groupId === filters.groupId)
    if (filters.customerId) result = result.filter((t) => t.customerId === filters.customerId)
    if (filters.type) result = result.filter((t) => t.type === filters.type)
    if (filters.dateFrom) result = result.filter((t) => t.date >= filters.dateFrom)
    if (filters.dateTo) result = result.filter((t) => t.date <= filters.dateTo)
    // Sort by date descending
    result.sort((a, b) => new Date(b.date) - new Date(a.date))
    return result
  },

  async getById(id) {
    await delay()
    return _transactions.find((t) => t.id === id) || null
  },

  async getSummary() {
    await delay(300)
    const totalLoanPayments = _transactions
      .filter((t) => t.type === 'loan_payment')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalDeposits = _transactions
      .filter((t) => t.type === 'savings_deposit')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalWithdrawals = _transactions
      .filter((t) => t.type === 'savings_withdrawal')
      .reduce((sum, t) => sum + t.amount, 0)
    return { totalLoanPayments, totalDeposits, totalWithdrawals }
  },
}
