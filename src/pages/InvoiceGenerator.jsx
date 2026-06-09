import { useState } from 'react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'

function InvoiceGenerator({ userEmail }) {
    const [invoice, setInvoice] = useState({
        clientName: '',
        clientEmail: '',
        items: [{ description: '', hours: '', rate: '' }],
        dueDate: '',
        notes: ''
    })
    const [isSaving, setIsSaving] = useState(false)

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

    //   const generateInvoice = async () => {
    //   const total = calculateTotal()

    //   if (!invoice.clientName.trim()) {
    //     alert('Please enter client name')
    //     return
    //   }

    //   if (total <= 0) {
    //     alert('Please add valid hours and rate')
    //     return
    //   }

    //   const { error } = await supabase.from('invoices').insert([
    //     {
    //       client_name: invoice.clientName,
    //       client_email: invoice.clientEmail,
    //       amount: total,
    //       due_date: invoice.dueDate,
    //       notes: invoice.notes,
    //       status: 'saved'
    //     }
    //   ])

    //   if (error) {
    //     console.error(error)
    //     alert('Invoice could not be saved')
    //     return
    //   }

    //   alert('Invoice saved to Supabase successfully!')
    // }
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
                <p className="text-gray-400 mt-1">Create professional invoices for your clients.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Invoice Form */}
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
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_90px_110px_auto] gap-2 mb-2">
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

                {/* Invoice Preview */}
                <Card className="bg-white text-gray-900">
                    <div className="border-b border-gray-200 pb-6 mb-6">
                        <h3 className="text-2xl font-bold text-sky-600">INVOICE</h3>
                        <p className="text-gray-500 text-sm mt-1">
                            #{String(Date.now()).slice(-6)}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <p className="text-sm text-gray-500">Bill To:</p>
                            <p className="font-semibold">{invoice.clientName || 'Client Name'}</p>
                            <p className="text-gray-600">{invoice.clientEmail || 'client@email.com'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Due Date:</p>
                            <p className="font-semibold">{invoice.dueDate || 'Not set'}</p>
                        </div>
                    </div>

                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 text-sm text-gray-500">Description</th>
                                <th className="text-right py-2 text-sm text-gray-500">Hours</th>
                                <th className="text-right py-2 text-sm text-gray-500">Rate</th>
                                <th className="text-right py-2 text-sm text-gray-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-3">{item.description || '-'}</td>
                                    <td className="text-right py-3">{item.hours || '-'}</td>
                                    <td className="text-right py-3">${item.rate || '0'}</td>
                                    <td className="text-right py-3 font-medium">
                                        ${((parseFloat(item.hours) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="text-right border-t border-gray-200 pt-4">
                        <p className="text-gray-500">Total Due</p>
                        <p className="text-3xl font-bold text-sky-600">
                            ${calculateTotal().toFixed(2)}
                        </p>
                    </div>

                    {invoice.notes && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500">Notes:</p>
                            <p className="text-gray-600">{invoice.notes}</p>
                        </div>
                    )}

                    <button
                        onClick={generateInvoice}
                        disabled={isSaving}
                        className="w-full mt-6 bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving Invoice...' : 'Generate & Save Invoice'}
                    </button>
                </Card>
            </div>
        </div>
    )
}

export default InvoiceGenerator
