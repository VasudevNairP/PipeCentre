'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { Download, Upload, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react'

export function ImportExportClient({ categories }: { categories: { id: string; name: string }[] }) {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null)
  const [error, setError] = useState('')

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/products')
      const json = await res.json()
      const data = json.data || []

      const csvData = data.map((p: any) => ({
        name: p.name,
        category: p.category?.name || '',
        brand: p.brand || '',
        price: p.price ?? '',
        unit: p.unit,
        stock_qty: p.stock_qty,
        low_stock_threshold: p.low_stock_threshold,
        description: p.description || '',
        featured: p.featured ? 'true' : 'false',
        active: p.active ? 'true' : 'false',
      }))

      const csv = Papa.unparse(csvData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pipe-centre-inventory-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setError('')
    setImportResult(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let success = 0
        let failed = 0

        for (const row of results.data as any[]) {
          try {
            if (!row.name) continue

            // Find category id
            const cat = categories.find(c => c.name.toLowerCase() === (row.category || '').toLowerCase())
            const category_id = cat?.id || categories[0]?.id

            if (!category_id) {
              failed++
              continue
            }

            const res = await fetch('/api/products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: row.name,
                category_id,
                brand: row.brand || null,
                price: row.price ? parseFloat(row.price) : null,
                unit: row.unit || 'piece',
                description: row.description || null,
                stock_qty: parseInt(row.stock_qty) || 0,
                low_stock_threshold: parseInt(row.low_stock_threshold) || 5,
                featured: row.featured === 'true',
                active: row.active !== 'false',
              }),
            })

            if (res.ok) success++
            else failed++
          } catch {
            failed++
          }
        }

        setImportResult({ success, failed })
        setImporting(false)
      },
      error: (err) => {
        setError(err.message)
        setImporting(false)
      },
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Export */}
      <div className="card p-6 flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mb-4">
            <Download className="w-5 h-5 text-brand-600" />
          </div>
          <h2 className="font-bold text-gray-900 text-lg mb-1">Export Inventory to CSV</h2>
          <p className="text-sm text-gray-500 mb-6">
            Download your entire current inventory, including stock quantities and prices, as a CSV spreadsheet.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-primary w-full"
        >
          <FileSpreadsheet className="w-4 h-4" />
          {exporting ? 'Generating CSV…' : 'Download CSV'}
        </button>
      </div>

      {/* Import */}
      <div className="card p-6 flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
            <Upload className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="font-bold text-gray-900 text-lg mb-1">Import Products from CSV</h2>
          <p className="text-sm text-gray-500 mb-4">
            Upload a CSV with columns: <code className="text-xs bg-gray-100 p-1 rounded">name, category, brand, price, unit, stock_qty</code>
          </p>

          {importResult && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Imported {importResult.success} products. {importResult.failed > 0 && `(${importResult.failed} failed)`}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div>
          <label className={`btn-secondary w-full cursor-pointer text-center ${importing ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-4 h-4" />
            {importing ? 'Importing products…' : 'Choose CSV File'}
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
