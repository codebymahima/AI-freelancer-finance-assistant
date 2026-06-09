import { useState, useMemo } from 'react'
import Card from '../components/Card'

const paymentProcessors = [
    { name: 'PayPal', logo: '💳', percentFee: 2.9, fixedFee: 0.30, description: 'Most widely recognized', color: 'bg-blue-500' },
    { name: 'Stripe', logo: '💜', percentFee: 2.9, fixedFee: 0.30, description: 'Developer-friendly', color: 'bg-purple-500' },
    { name: 'Wise', logo: '💚', percentFee: 0.5, fixedFee: 0.00, description: 'Best for international', color: 'bg-green-500' },
    { name: 'Square', logo: '⬜', percentFee: 2.6, fixedFee: 0.10, description: 'Great for invoices', color: 'bg-gray-500' },
    { name: 'Payoneer', logo: '🟠', percentFee: 1.0, fixedFee: 0.00, description: 'Freelance platforms', color: 'bg-orange-500' },
    { name: 'Bank Wire', logo: '🏦', percentFee: 0.0, fixedFee: 25.00, description: 'Large transactions', color: 'bg-slate-500' },
]

function PaymentFees() {
    const [amount, setAmount] = useState(1000)

    const calculations = useMemo(() => {
        return paymentProcessors
            .map((p) => {
                const fee = (amount * p.percentFee) / 100 + p.fixedFee
                const netAmount = amount - fee
                const effectiveRate = amount > 0 ? (fee / amount) * 100 : 0

                return { ...p, fee, netAmount, effectiveRate }
            })
            .sort((a, b) => a.fee - b.fee)
    }, [amount])

    const bestOption = calculations[0]
    const worstOption = calculations[calculations.length - 1]
    const savings = worstOption.fee - bestOption.fee

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold">Payment Fee Breakdown</h2>
                <p className="text-gray-400 mt-1">
                    Compare fees across payment processors to maximize your take-home.
                </p>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                        <label className="block text-sm text-gray-400 mb-2">Invoice Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => {
                                const value = e.target.value

                                if (value === '') {
                                    setAmount('')
                                    return
                                }

                                setAmount(Number(value))
                            }}
                            className="w-full bg-slate-900 border border-gray-700 rounded-xl px-4 py-4 text-2xl font-bold focus:outline-none focus:border-sky-500"
                        />
                    </div>
                </div>
            </Card>

            {amount > 0 && (
                <Card>
                    <div className="bg-linear-to-r from-sky-600/20 to-green-600/20 border border-sky-500/30 rounded-xl p-6">
                        <div className="mb-4">
                            <span className="inline-block bg-sky-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                                Best Value
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                            <div>
                                <p className="text-gray-300">Best option for ${amount.toLocaleString()}</p>
                               <p className="text-xl sm:text-2xl font-bold text-sky-400 mt-1 leading-snug">
                                    {bestOption.name} — Save ${savings.toFixed(2)} vs {worstOption.name}
                                </p>
                            </div>

                            <div className="text-left sm:text-right">
                                <p className="text-gray-300">You receive</p>
                                <p className="text-3xl sm:text-3xl font-bold text-green-400">
                                    ${bestOption.netAmount.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {calculations.map((p, index) => (
                    <Card
                        key={p.name}
                        className={index === 0 ? 'ring-2 ring-sky-500' : ''}
                    >
                        {index === 0 && (
                            <div className="mb-4">
                                <span className="inline-block bg-sky-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                                    Best Value
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl sm:text-3xl">{p.logo}</span>
                            <div>
                                <h3 className="font-semibold text-lg">{p.name}</h3>
                                <p className="text-sm text-gray-500">{p.description}</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Fee</span>
                                <span>{p.percentFee}% + ${p.fixedFee}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">Total fee</span>
                                <span className="text-red-400">-${p.fee.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">You receive</span>
                                <span className="text-green-400 font-semibold">
                                    ${p.netAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${p.color}`}
                                style={{ width: `${Math.min(100, p.effectiveRate * 10)}%` }}
                            />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default PaymentFees