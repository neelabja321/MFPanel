import * as XLSX from 'xlsx'

/**
 * Generic utility to export a dataset to Excel
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column configs { key, label, render? }
 * @param {String} filename - Name of downloaded file
 */
export function exportToExcel(data, columns, filename = 'export.xlsx') {
  // Map data to plain text format using column configs if possible, otherwise raw values.
  const exportedData = data.map(row => {
    const newRow = {}
    columns.forEach(col => {
      if (col.key !== 'actions') {
        const val = row[col.key]
        // If there's a simple mapping needed, we can do it here. 
        // Rendering complex JSX to string is tricky, so we export raw raw string vals if it's an object/number.
        newRow[col.label || col.key] = typeof val === 'object' && val !== null ? JSON.stringify(val) : val
      }
    })
    return newRow
  })

  const worksheet = XLSX.utils.json_to_sheet(exportedData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  
  XLSX.writeFile(workbook, filename)
}
