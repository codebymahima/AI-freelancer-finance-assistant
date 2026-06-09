// import Card from '../components/Card'
// import { 
//   CurrencyDollarIcon, 
//   DocumentCheckIcon, 
//   ClockIcon, 
//   ArrowTrendingUpIcon 
// } from '@heroicons/react/24/outline'

// const stats = [
//   { label: 'Total Earnings', value: '$12,450', icon: CurrencyDollarIcon, change: '+12%' },
//   { label: 'Invoices Sent', value: '24', icon: DocumentCheckIcon, change: '+3' },
//   { label: 'Pending Payments', value: '$3,200', icon: ClockIcon, change: '5 invoices' },
//   { label: 'This Month', value: '$4,800', icon: ArrowTrendingUpIcon, change: '+28%' },
// ]

// const recentActivity = [
//   { type: 'invoice', description: 'Invoice #024 paid by Acme Corp', amount: '+$1,200', time: '2 hours ago' },
//   { type: 'invoice', description: 'Invoice #025 sent to TechStart', amount: '$800', time: '5 hours ago' },
//   { type: 'payment', description: 'PayPal fee deducted', amount: '-$35', time: 'Yesterday' },
//   { type: 'invoice', description: 'Invoice #023 paid by DesignHub', amount: '+$2,400', time: '2 days ago' },
// ]

// function Dashboard() {
//   return (
//     <div className="space-y-8">
//       <div>
//         <h2 className="text-3xl font-bold">Dashboard</h2>
//         <p className="text-gray-400 mt-1">Welcome back! Here's your financial overview.</p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat) => {
//           const Icon = stat.icon
//           return (
//             <Card key={stat.label}>
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-gray-400 text-sm">{stat.label}</p>
//                   <p className="text-2xl font-bold mt-1">{stat.value}</p>
//                   <p className="text-sky-400 text-sm mt-1">{stat.change}</p>
//                 </div>
//                 <div className="p-3 bg-sky-600/20 rounded-lg">
//                   <Icon className="w-6 h-6 text-sky-400" />
//                 </div>
//               </div>
//             </Card>
//           )
//         })}
//       </div>

//       {/* Recent Activity */}
//       <Card>
//         <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
//         <div className="space-y-4">
//           {recentActivity.map((activity, index) => (
//             <div 
//               key={index} 
//               className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0"
//             >
//               <div>
//                 <p className="font-medium">{activity.description}</p>
//                 <p className="text-sm text-gray-500">{activity.time}</p>
//               </div>
//               <span className={`font-semibold ${
//                 activity.amount.startsWith('+') ? 'text-green-400' : 
//                 activity.amount.startsWith('-') ? 'text-red-400' : 'text-gray-300'
//               }`}>
//                 {activity.amount}
//               </span>
//             </div>
//           ))}
//         </div>
//       </Card>
//     </div>
//   )
// }

// export default Dashboard
import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'
import {
  CurrencyDollarIcon,
  DocumentCheckIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

function Dashboard({ userEmail }) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

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

  const totalEarnings = useMemo(() => {
    return invoices.reduce((sum, invoice) => {
      return sum + Number(invoice.amount || 0)
    }, 0)
  }, [invoices])

  const thisMonthEarnings = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return invoices.reduce((sum, invoice) => {
      const invoiceDate = new Date(invoice.created_at)

      if (
        invoiceDate.getMonth() === currentMonth &&
        invoiceDate.getFullYear() === currentYear
      ) {
        return sum + Number(invoice.amount || 0)
      }

      return sum
    }, 0)
  }, [invoices])

  const pendingPayments = useMemo(() => {
    return invoices
      .filter((invoice) => invoice.status === 'saved')
      .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0)
  }, [invoices])

  const stats = [
    {
      label: 'Total Earnings',
      value: `$${totalEarnings.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      change: 'From saved invoices'
    },
    {
      label: 'Invoices Saved',
      value: invoices.length,
      icon: DocumentCheckIcon,
      change: `${invoices.length} total`
    },
    {
      label: 'Pending Payments',
      value: `$${pendingPayments.toLocaleString()}`,
      icon: ClockIcon,
      change: 'Marked as saved'
    },
    {
      label: 'This Month',
      value: `$${thisMonthEarnings.toLocaleString()}`,
      icon: ArrowTrendingUpIcon,
      change: 'Current month'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-gray-400 mt-1">
          Welcome back! Here's your Supabase-powered financial overview.
        </p>
      </div>

      {loading && (
        <Card>
          <p className="text-gray-400">Loading your invoice data...</p>
        </Card>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon

              return (
                <Card key={stat.label}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-xl sm:text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-sky-400 text-sm mt-1">{stat.change}</p>
                    </div>

                    <div className="p-2 sm:p-3 bg-sky-600/20 rounded-lg">
                      <Icon className="w-6 h-6 text-sky-400" />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          <Card>
            <h3 className="text-xl font-semibold mb-4">Recent Invoices</h3>

            {invoices.length === 0 ? (
              <p className="text-gray-400">
                No invoices saved yet. Create your first invoice from the Invoice Generator.
              </p>
            ) : (
              <div className="space-y-4">
                {invoices.slice(0, 5).map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        Invoice saved for {invoice.client_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {invoice.client_email || 'No email'} •{' '}
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="font-semibold text-green-400">
                      ${Number(invoice.amount || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

export default Dashboard