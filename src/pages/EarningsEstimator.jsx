import { useState, useMemo } from 'react'
import Card from '../components/Card'

function EarningsEstimator() {
  const [inputs, setInputs] = useState({
    hourlyRate: 75,
    hoursPerWeek: 30,
    weeksPerYear: 48,
    taxRate: 25,
    expenses: 500
  })

  const calculations = useMemo(() => {
    const grossWeekly = inputs.hourlyRate * inputs.hoursPerWeek
    const grossMonthly = grossWeekly * 4.33
    const grossYearly =
      inputs.hourlyRate * inputs.hoursPerWeek * inputs.weeksPerYear

    const yearlyExpenses = inputs.expenses * 12
    const taxableIncome = grossYearly - yearlyExpenses
    const taxes = taxableIncome * (inputs.taxRate / 100)
    const netYearly = taxableIncome - taxes
    const netMonthly = netYearly / 12

    return {
      grossWeekly,
      grossMonthly,
      grossYearly,
      taxes,
      netYearly,
      netMonthly,
      yearlyExpenses
    }
  }, [inputs])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Earnings Estimator</h2>
        <p className="text-gray-400 mt-1">
          Plan your freelance income and understand your take-home pay.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h3 className="text-xl font-semibold mb-5">Your Parameters</h3>

          <div className="space-y-5">
            <div>
              <label className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Hourly Rate</span>
                <span className="text-sky-400 font-semibold">
                  ${inputs.hourlyRate}
                </span>
              </label>
              <input
                type="range"
                min="10"
                max="300"
                value={inputs.hourlyRate}
                onChange={(e) =>
                  setInputs({ ...inputs, hourlyRate: parseInt(e.target.value) })
                }
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Hours per Week</span>
                <span className="text-sky-400 font-semibold">
                  {inputs.hoursPerWeek}h
                </span>
              </label>
              <input
                type="range"
                min="5"
                max="60"
                value={inputs.hoursPerWeek}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    hoursPerWeek: parseInt(e.target.value)
                  })
                }
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Working Weeks/Year</span>
                <span className="text-sky-400 font-semibold">
                  {inputs.weeksPerYear}
                </span>
              </label>
              <input
                type="range"
                min="20"
                max="52"
                value={inputs.weeksPerYear}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    weeksPerYear: parseInt(e.target.value)
                  })
                }
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Estimated Tax Rate</span>
                <span className="text-sky-400 font-semibold">
                  {inputs.taxRate}%
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={inputs.taxRate}
                onChange={(e) =>
                  setInputs({ ...inputs, taxRate: parseInt(e.target.value) })
                }
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Monthly Expenses</span>
                <span className="text-sky-400 font-semibold">
                  ${inputs.expenses}
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={inputs.expenses}
                onChange={(e) =>
                  setInputs({ ...inputs, expenses: parseInt(e.target.value) })
                }
                className="w-full accent-sky-500"
              />
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4">
            Your Earnings Breakdown
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-900 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Gross Weekly</p>
              <p className="text-xl font-bold text-white mt-1">
                ${calculations.grossWeekly.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Gross Monthly</p>
              <p className="text-xl font-bold text-white mt-1">
                ${Math.round(calculations.grossMonthly).toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Gross Yearly</p>
              <p className="text-xl font-bold text-white mt-1">
                ${calculations.grossYearly.toLocaleString()}
              </p>
            </div>

            <div className="bg-sky-600/20 rounded-xl p-4 border border-sky-500/30">
              <p className="text-sky-300 text-sm">Net Yearly</p>
              <p className="text-xl font-bold text-sky-400 mt-1">
                ${Math.round(calculations.netYearly).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Gross Annual Income</span>
              <span className="font-semibold">
                ${calculations.grossYearly.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Annual Business Expenses</span>
              <span className="font-semibold text-red-400">
                -${calculations.yearlyExpenses.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">
                Estimated Taxes ({inputs.taxRate}%)
              </span>
              <span className="font-semibold text-red-400">
                -${Math.round(calculations.taxes).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="font-semibold">Net Annual Income</span>
              <span className="font-bold text-green-400">
                ${Math.round(calculations.netYearly).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-2 bg-sky-600/10 rounded-lg px-4">
              <span className="text-sky-300">Monthly Take-Home</span>
              <span className="font-bold text-sky-400">
                ${Math.round(calculations.netMonthly).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default EarningsEstimator