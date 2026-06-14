import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import { useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

function InvoiceGenerator({ userEmail }) {
  const invoiceRef = useRef(null)

  const [invoice, setInvoice] = useState({
    clientName: '',
    clientEmail: '',
    items: [{ description: '', hours: '', rate: '' }],
    dueDate: '',
    notes: ''
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const [invoiceNumber] = useState(() => {
  return `INV-${String(Date.now()).slice(-6)}`
})

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: '', hours: '', rate: '' }]
    })
  }

  const updateItem = (index, field, value) => {
    const newItems = [...invoice.items]
    newItems[index][field] = value
    setInvoice({ ...invoice, items: newItems })
  }

  const removeItem = (index) => {
    const newItems = invoice.items.filter((_, i) => i !== index)
    setInvoice({ ...invoice, items: newItems })
  }

  const calculateTotal = () => {
    return invoice.items.reduce((total, item) => {
      return total + (parseFloat(item.hours) || 0) * (parseFloat(item.rate) || 0)
    }, 0)
  }

  const formatDate = (dateValue) => {
  if (!dateValue) return 'Not set'

  return new Date(dateValue).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

  const downloadInvoicePDF = async () => {
    if (!invoiceRef.current || isDownloading) return

    setIsDownloading(true)

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        onclone: (clonedDoc) => {
          const invoiceElement = clonedDoc.querySelector('#invoice-pdf-content')

          if (!invoiceElement) return

          invoiceElement.style.backgroundColor = '#ffffff'
          invoiceElement.style.color = '#111827'

          invoiceElement.querySelectorAll('*').forEach((el) => {
            el.style.backgroundColor = '#ffffff'
            el.style.color = '#111827'
            el.style.borderColor = '#e5e7eb'
          })

          invoiceElement.querySelectorAll('[data-pdf-color="blue"]').forEach((el) => {
            el.style.color = '#0284c7'
          })

          invoiceElement.querySelectorAll('[data-pdf-color="muted"]').forEach((el) => {
            el.style.color = '#6b7280'
          })
        }
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const safeClientName = invoice.clientName.trim() || 'client'
      pdf.save(`${invoiceNumber}-${safeClientName}.pdf`)
    } catch (error) {
      console.error(error)
      alert('PDF could not be downloaded')
    } finally {
      setIsDownloading(false)
    }
  }

  const generateInvoice = async () => {
    if (isSaving) return

    const total = calculateTotal()

    if (!userEmail) {
      alert('Please login first')
      return
    }

    if (!invoice.clientName.trim()) {
      alert('Please enter client name')
      return
    }

    if (total <= 0) {
      alert('Please add valid hours and rate')
      return
    }

    setIsSaving(true)

    const { error } = await supabase.from('invoices').insert([
      {
        user_email: userEmail,
        client_name: invoice.clientName,
        client_email: invoice.clientEmail,
        amount: total,
        due_date: invoice.dueDate,
        notes: invoice.notes,
        status: 'saved'
      }
    ])

    setIsSaving(false)

    if (error) {
      console.error(error)
      alert('Invoice could not be saved')
      return
    }

    alert('Invoice saved successfully!')

    setInvoice({
      clientName: '',
      clientEmail: '',
      items: [{ description: '', hours: '', rate: '' }],
      dueDate: '',
      notes: ''
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Invoice Generator</h2>
        <p className="text-gray-400 mt-1">
          Create professional invoices for your clients.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-xl font-semibold mb-6">Invoice Details</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Client Name</label>
              <input
                type="text"
                value={invoice.clientName}
                onChange={(e) => setInvoice({ ...invoice, clientName: e.target.value })}
                className="w-full bg-slate-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500"
                placeholder="Acme Corporation"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Client Email</label>
              <input
                type="email"
                value={invoice.clientEmail}
                onChange={(e) => setInvoice({ ...invoice, clientEmail: e.target.value })}
                className="w-full bg-slate-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500"
                placeholder="billing@acme.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Due Date</label>
              <input
                type="date"
                value={invoice.dueDate}
                onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                className="w-full bg-slate-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-3">Line Items</label>
              {invoice.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_90px_110px_auto] gap-2 mb-2"
                >
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="flex-1 bg-slate-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                    placeholder="Service description"
                  />

                  <input
                    type="number"
                    value={item.hours}
                    onChange={(e) => updateItem(index, 'hours', e.target.value)}
                    className="w-full bg-slate-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                    placeholder="Hrs"
                  />

                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', e.target.value)}
                    className="w-full bg-slate-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                    placeholder="$/hr"
                  />

                  {invoice.items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="w-full sm:w-auto px-3 py-2 text-red-400 hover:bg-red-400/20 rounded-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addItem}
                className="text-sky-400 text-sm hover:text-sky-300 mt-2"
              >
                + Add line item
              </button>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Notes</label>
              <textarea
                value={invoice.notes}
                onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                className="w-full bg-slate-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500 h-24 resize-none"
                placeholder="Payment terms, thank you message, etc."
              />
            </div>
          </div>
        </Card>

        <Card className="bg-white text-gray-900">
  <div
    id="invoice-pdf-content"
    ref={invoiceRef}
    style={{
      backgroundColor: '#ffffff',
      color: '#111827',
      padding: '28px',
      fontFamily: 'Arial, sans-serif',
      minHeight: '720px'
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '2px solid #0284c7',
        paddingBottom: '24px',
        marginBottom: '28px'
      }}
    >
      <div>
        <h3
          data-pdf-color="blue"
          style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#0284c7',
            margin: 0,
            letterSpacing: '1px'
          }}
        >
          INVOICE
        </h3>

        <p
          data-pdf-color="muted"
          style={{
            color: '#6b7280',
            fontSize: '13px',
            marginTop: '6px'
          }}
        >
          Professional freelance billing document
        </p>
      </div>

      <div style={{ textAlign: 'right' }}>
        <p
          style={{
            fontSize: '14px',
            fontWeight: '700',
            margin: 0
          }}
        >
          FreelanceAI
        </p>

        <p
          data-pdf-color="muted"
          style={{
            color: '#6b7280',
            fontSize: '12px',
            marginTop: '4px'
          }}
        >
          Finance Assistant
        </p>

        <p
          data-pdf-color="muted"
          style={{
            color: '#6b7280',
            fontSize: '12px',
            marginTop: '4px'
          }}
        >
          {userEmail || 'freelancer@email.com'}
        </p>
      </div>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: '32px',
        marginBottom: '32px'
      }}
    >
      <div>
        <p
          data-pdf-color="muted"
          style={{
            color: '#6b7280',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '8px'
          }}
        >
          Bill To
        </p>

        <p
          style={{
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '6px'
          }}
        >
          {invoice.clientName || 'Client Name'}
        </p>

        <p
          data-pdf-color="muted"
          style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0
          }}
        >
          {invoice.clientEmail || 'client@email.com'}
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '16px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}
        >
          <span
            data-pdf-color="muted"
            style={{ color: '#6b7280', fontSize: '13px' }}
          >
            Invoice No.
          </span>
          <span style={{ fontWeight: '600', fontSize: '13px' }}>
            {invoiceNumber}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}
        >
          <span
            data-pdf-color="muted"
            style={{ color: '#6b7280', fontSize: '13px' }}
          >
            Issue Date
          </span>
          <span style={{ fontWeight: '600', fontSize: '13px' }}>
            {formatDate(new Date())}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span
            data-pdf-color="muted"
            style={{ color: '#6b7280', fontSize: '13px' }}
          >
            Due Date
          </span>
          <span style={{ fontWeight: '600', fontSize: '13px' }}>
            {formatDate(invoice.dueDate)}
          </span>
        </div>
      </div>
    </div>

    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '28px'
      }}
    >
      <thead>
        <tr style={{ backgroundColor: '#f8fafc' }}>
          <th
            data-pdf-color="muted"
            style={{
              textAlign: 'left',
              padding: '12px',
              fontSize: '12px',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              borderBottom: '1px solid #e5e7eb'
            }}
          >
            Description
          </th>

          <th
            data-pdf-color="muted"
            style={{
              textAlign: 'right',
              padding: '12px',
              fontSize: '12px',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              borderBottom: '1px solid #e5e7eb'
            }}
          >
            Hours
          </th>

          <th
            data-pdf-color="muted"
            style={{
              textAlign: 'right',
              padding: '12px',
              fontSize: '12px',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              borderBottom: '1px solid #e5e7eb'
            }}
          >
            Rate
          </th>

          <th
            data-pdf-color="muted"
            style={{
              textAlign: 'right',
              padding: '12px',
              fontSize: '12px',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              borderBottom: '1px solid #e5e7eb'
            }}
          >
            Amount
          </th>
        </tr>
      </thead>

      <tbody>
        {invoice.items.map((item, index) => (
          <tr key={index}>
            <td
              style={{
                padding: '14px 12px',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '14px'
              }}
            >
              {item.description || '-'}
            </td>

            <td
              style={{
                textAlign: 'right',
                padding: '14px 12px',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '14px'
              }}
            >
              {item.hours || '-'}
            </td>

            <td
              style={{
                textAlign: 'right',
                padding: '14px 12px',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '14px'
              }}
            >
              ${item.rate || '0'}
            </td>

            <td
              style={{
                textAlign: 'right',
                padding: '14px 12px',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              ${((parseFloat(item.hours) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '28px'
      }}
    >
      <div
        style={{
          width: '260px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '18px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}
        >
          <span
            data-pdf-color="muted"
            style={{ color: '#6b7280', fontSize: '14px' }}
          >
            Subtotal
          </span>
          <span style={{ fontWeight: '600' }}>
            ${calculateTotal().toFixed(2)}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '12px',
            marginTop: '12px'
          }}
        >
          <span
            style={{
              fontSize: '16px',
              fontWeight: '700'
            }}
          >
            Total Due
          </span>

          <span
            data-pdf-color="blue"
            style={{
              color: '#0284c7',
              fontSize: '22px',
              fontWeight: '800'
            }}
          >
            ${calculateTotal().toFixed(2)}
          </span>
        </div>
      </div>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginTop: '32px'
      }}
    >
      <div>
        <p
          style={{
            fontSize: '14px',
            fontWeight: '700',
            marginBottom: '6px'
          }}
        >
          Notes
        </p>

        <p
          data-pdf-color="muted"
          style={{
            color: '#6b7280',
            fontSize: '13px',
            lineHeight: '1.5',
            margin: 0
          }}
        >
          {invoice.notes || 'Thank you for your business. Payment is requested by the due date mentioned above.'}
        </p>
      </div>

      <div>
        <p
          style={{
            fontSize: '14px',
            fontWeight: '700',
            marginBottom: '6px'
          }}
        >
          Payment Terms
        </p>

        <p
          data-pdf-color="muted"
          style={{
            color: '#6b7280',
            fontSize: '13px',
            lineHeight: '1.5',
            margin: 0
          }}
        >
          Please complete the payment before the due date. Late payments may be subject to follow-up.
        </p>
      </div>
    </div>

    <div
      style={{
        borderTop: '1px solid #e5e7eb',
        marginTop: '36px',
        paddingTop: '18px',
        textAlign: 'center'
      }}
    >
      <p
        data-pdf-color="muted"
        style={{
          color: '#6b7280',
          fontSize: '12px',
          margin: 0
        }}
      >
        Generated using FreelanceAI Finance Assistant
      </p>
    </div>
  </div>

  <button
    onClick={downloadInvoicePDF}
    disabled={isDownloading}
    className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {isDownloading ? 'Downloading PDF...' : 'Download PDF'}
  </button>

  <button
    onClick={generateInvoice}
    disabled={isSaving}
    className="w-full mt-3 bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {isSaving ? 'Saving Invoice...' : 'Save Invoice'}
  </button>
</Card>
      </div>
    </div>
  )
}

export default InvoiceGenerator
