import { savingsData } from '@/mock-data/savings'
import { transactionsData } from '@/mock-data/transactions'
import { delay, generateId } from '@/lib/utils'

let _savings = [...savingsData]
let _transactions = [...transactionsData]

export const savingsService = {
  async getAll(filters = {}) {
    await delay()
    let result = [..._savings]
    if (filters.groupId) result = result.filter((s) => s.groupId === filters.groupId)
    if (filters.customerId) result = result.filter((s) => s.customerId === filters.customerId)
    if (filters.status) result = result.filter((s) => s.status === filters.status)
    return result
  },

  async getById(id) {
    await delay()
    return _savings.find((s) => s.id === id) || null
  },

  async getByCustomer(customerId) {
    await delay(300)
    return _savings.find((s) => s.customerId === customerId) || null
  },

  async create(data) {
    await delay()
    const newAccount = { ...data, id: 'SAV' + generateId(), balance: 0, openedDate: new Date().toISOString().split('T')[0], lastTransactionDate: null, status: 'active' }
    _savings.push(newAccount)
    return newAccount
  },

  async deposit(savingsId, amount, note) {
    await delay()
    const idx = _savings.findIndex((s) => s.id === savingsId)
    if (idx === -1) throw new Error('Savings account not found')
    _savings[idx].balance += amount
    _savings[idx].lastTransactionDate = new Date().toISOString().split('T')[0]
    const txn = {
      id: 'TXN' + generateId(),
      type: 'savings_deposit',
      customerId: _savings[idx].customerId,
      groupId: _savings[idx].groupId,
      savingsId,
      amount,
      date: new Date().toISOString().split('T')[0],
      note: note || 'Deposit',
      method: 'cash',
    }
    _transactions.push(txn)
    return _savings[idx]
  },

  async withdraw(savingsId, amount, note) {
    await delay()
    const idx = _savings.findIndex((s) => s.id === savingsId)
    if (idx === -1) throw new Error('Savings account not found')
    if (_savings[idx].balance < amount) throw new Error('Insufficient balance')
    _savings[idx].balance -= amount
    _savings[idx].lastTransactionDate = new Date().toISOString().split('T')[0]
    const txn = {
      id: 'TXN' + generateId(),
      type: 'savings_withdrawal',
      customerId: _savings[idx].customerId,
      groupId: _savings[idx].groupId,
      savingsId,
      amount,
      date: new Date().toISOString().split('T')[0],
      note: note || 'Withdrawal',
      method: 'cash',
    }
    _transactions.push(txn)
    return _savings[idx]
  },
}
