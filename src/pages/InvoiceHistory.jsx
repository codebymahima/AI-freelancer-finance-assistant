import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'

function InvoiceHistory({ userEmail }) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!userEmail) return

      setLoading(true)

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
        setInvoices([])
      } else {
        setInvoices(data || [])
      }

      setLoading(false)
    }

    fetchInvoices()
  }, [userEmail])

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not set'

    return new Date(dateValue).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const generateInvoiceNumber = (invoice) => {
  if (invoice.invoice_number) {
    return invoice.invoice_number
  }

  if (invoice.id) {
    return `INV-${String(invoice.id).padStart(6, '0')}`
  }

  return `INV-${String(Date.now()).slice(-6)}`
}

  const downloadSavedInvoice = (invoice) => {
    if (downloadingId) return

    setDownloadingId(invoice.id)

    try {
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pageWidth = pdf.internal.pageSize.getWidth()
      const margin = 18
      let y = 20

      const invoiceNumber = generateInvoiceNumber(invoice)
      const items = Array.isArray(invoice.items) ? invoice.items : []

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(26)
      pdf.setTextColor(2, 132, 199)
      pdf.text('INVOICE', margin, y)

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.setTextColor(107, 114, 128)
      pdf.text('Professional freelance billing document', margin, y + 7)

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.setTextColor(17, 24, 39)
      pdf.text('FreelanceAI', pageWidth - margin, y, { align: 'right' })

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)
      pdf.setTextColor(107, 114, 128)
      pdf.text('Finance Assistant', pageWidth - margin, y + 6, { align: 'right' })
      pdf.text(userEmail || 'freelancer@email.com', pageWidth - margin, y + 12, {
        align: 'right'
      })

      y += 25

      pdf.setDrawColor(2, 132, 199)
      pdf.setLineWidth(0.6)
      pdf.line(margin, y, pageWidth - margin, y)

      y += 16

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(107, 114, 128)
      pdf.text('BILL TO', margin, y)

      pdf.setFontSize(14)
      pdf.setTextColor(17, 24, 39)
      pdf.text(invoice.client_name || 'Client Name', margin, y + 8)

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.setTextColor(107, 114, 128)
      pdf.text(invoice.client_email || 'client@email.com', margin, y + 15)

      const boxX = pageWidth - margin - 70
      const boxY = y - 4

      pdf.setFillColor(248, 250, 252)
      pdf.setDrawColor(229, 231, 235)
      pdf.roundedRect(boxX, boxY, 70, 32, 3, 3, 'FD')

      pdf.setFontSize(9)
      pdf.setTextColor(107, 114, 128)
      pdf.text('Invoice No.', boxX + 5, boxY + 8)
      pdf.text('Issue Date', boxX + 5, boxY + 17)
      pdf.text('Due Date', boxX + 5, boxY + 26)

      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(17, 24, 39)
      pdf.text(invoiceNumber, boxX + 65, boxY + 8, { align: 'right' })
      pdf.text(formatDate(invoice.created_at), boxX + 65, boxY + 17, { align: 'right' })
      pdf.text(formatDate(invoice.due_date), boxX + 65, boxY + 26, { align: 'right' })

      y += 48

      pdf.setFillColor(248, 250, 252)
      pdf.rect(margin, y, pageWidth - margin * 2, 10, 'F')

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(107, 114, 128)
      pdf.text('DESCRIPTION', margin + 4, y + 7)
      pdf.text('HOURS', pageWidth - 80, y + 7, { align: 'right' })
      pdf.text('RATE', pageWidth - 52, y + 7, { align: 'right' })
      pdf.text('AMOUNT', pageWidth - margin, y + 7, { align: 'right' })

      y += 14

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.setTextColor(17, 24, 39)

      if (items.length === 0) {
        pdf.text('Saved invoice item', margin + 4, y)
        pdf.text('-', pageWidth - 80, y, { align: 'right' })
        pdf.text('-', pageWidth - 52, y, { align: 'right' })
        pdf.text(`$${Number(invoice.amount || 0).toFixed(2)}`, pageWidth - margin, y, {
          align: 'right'
        })
        y += 10
      } else {
        items.forEach((item) => {
          const amount =
            (parseFloat(item.hours) || 0) * (parseFloat(item.rate) || 0)

          pdf.text(item.description || '-', margin + 4, y)
          pdf.text(String(item.hours || '-'), pageWidth - 80, y, { align: 'right' })
          pdf.text(`$${item.rate || '0'}`, pageWidth - 52, y, { align: 'right' })
          pdf.text(`$${amount.toFixed(2)}`, pageWidth - margin, y, {
            align: 'right'
          })

          y += 10
        })
      }

      y += 8

      const totalBoxX = pageWidth - margin - 75

      pdf.setFillColor(248, 250, 252)
      pdf.setDrawColor(229, 231, 235)
      pdf.roundedRect(totalBoxX, y, 75, 30, 3, 3, 'FD')

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.setTextColor(107, 114, 128)
      pdf.text('Subtotal', totalBoxX + 5, y + 10)
      pdf.text(`$${Number(invoice.amount || 0).toFixed(2)}`, totalBoxX + 70, y + 10, {
        align: 'right'
      })

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.setTextColor(17, 24, 39)
      pdf.text('Total Due', totalBoxX + 5, y + 23)

      pdf.setFontSize(14)
      pdf.setTextColor(2, 132, 199)
      pdf.text(`$${Number(invoice.amount || 0).toFixed(2)}`, totalBoxX + 70, y + 23, {
        align: 'right'
      })

      y += 46

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(11)
      pdf.setTextColor(17, 24, 39)
      pdf.text('Notes', margin, y)

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)
      pdf.setTextColor(107, 114, 128)

      const notes =
        invoice.notes ||
        'Thank you for your business. Payment is requested by the due date mentioned above.'

      const splitNotes = pdf.splitTextToSize(notes, 75)
      pdf.text(splitNotes, margin, y + 7)

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(11)
      pdf.setTextColor(17, 24, 39)
      pdf.text('Payment Terms', pageWidth / 2 + 8, y)

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)
      pdf.setTextColor(107, 114, 128)

      const terms =
        'Please complete the payment before the due date. Late payments may be subject to follow-up.'
      const splitTerms = pdf.splitTextToSize(terms, 75)
      pdf.text(splitTerms, pageWidth / 2 + 8, y + 7)

      pdf.setDrawColor(229, 231, 235)
      pdf.line(margin, 280, pageWidth - margin, 280)

      pdf.setFontSize(9)
      pdf.setTextColor(107, 114, 128)
      pdf.text('Generated using FreelanceAI Finance Assistant', pageWidth / 2, 287, {
        align: 'center'
      })

      const safeClientName = invoice.client_name || 'client'
      pdf.save(`${invoiceNumber}-${safeClientName}.pdf`)
    } catch (error) {
      console.error(error)
      alert('Invoice PDF could not be downloaded')
    } finally {
      setDownloadingId(null)
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const clientName = invoice.client_name?.toLowerCase() || ''
    const clientEmail = invoice.client_email?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()

    return clientName.includes(search) || clientEmail.includes(search)
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Invoice History</h2>
        <p className="text-gray-400 mt-1">
          View, search, and download all saved invoices.
        </p>
      </div>

      <input
        type="text"
        placeholder="Search by client name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-slate-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-sky-500"
      />

      <Card>
        {loading ? (
          <p className="text-gray-400">Loading invoices...</p>
        ) : filteredInvoices.length === 0 ? (
          <p className="text-gray-400">No invoices found.</p>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="border border-slate-700 rounded-xl p-4"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {invoice.client_name}
                    </h3>

                    <p className="text-gray-400 text-sm">
                      {invoice.client_email || 'No email'}
                    </p>

                    <p className="text-gray-500 text-xs mt-1">
                      {formatDate(invoice.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:text-right">
                    <div>
                      <p className="text-green-400 font-bold text-xl">
                        ${Number(invoice.amount || 0).toFixed(2)}
                      </p>

                      <p className="text-gray-400 text-sm">
                        {invoice.items?.length || 0} item(s)
                      </p>
                    </div>

                    <button
                      onClick={() => downloadSavedInvoice(invoice)}
                      disabled={downloadingId === invoice.id}
                      className="bg-sky-600 hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      {downloadingId === invoice.id ? 'Downloading...' : 'Download PDF'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default InvoiceHistory