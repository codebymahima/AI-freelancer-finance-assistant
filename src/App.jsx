// import { useState } from 'react'
// import Sidebar from './components/Sidebar'
// import Dashboard from './pages/Dashboard'
// import InvoiceGenerator from './pages/InvoiceGenerator'
// import EarningsEstimator from './pages/EarningsEstimator'
// import ChatAssistant from './pages/ChatAssistant'
// import PaymentFees from './pages/PaymentFees'

// function App() {
//   const [activePage, setActivePage] = useState('dashboard')

//   const renderPage = () => {
//     switch (activePage) {
//       case 'dashboard':
//         return <Dashboard />
//       case 'invoices':
//         return <InvoiceGenerator />
//       case 'earnings':
//         return <EarningsEstimator />
//       case 'chat':
//         return <ChatAssistant />
//       case 'fees':
//         return <PaymentFees />
//       default:
//         return <Dashboard />
//     }
//   }

//   return (
//     <div className="flex min-h-screen">
//       <Sidebar activePage={activePage} setActivePage={setActivePage} />
//       <main className="flex-1 p-8 overflow-auto">
//         {renderPage()}
//       </main>
//     </div>
//   )
// }

// export default App

import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import InvoiceGenerator from './pages/InvoiceGenerator'
import EarningsEstimator from './pages/EarningsEstimator'
import ChatAssistant from './pages/ChatAssistant'
import PaymentFees from './pages/PaymentFees'

function App() {
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem('active_page') || 'dashboard'
  })

  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('freelance_user_email') || ''
  })
  const [emailInput, setEmailInput] = useState('')


  const handlePageChange = (page) => {
    setActivePage(page)
    localStorage.setItem('active_page', page)
  }


  const handleLogin = (e) => {
    e.preventDefault()

    if (!emailInput.trim()) {
      alert('Please enter your email')
      return
    }

    localStorage.setItem('freelance_user_email', emailInput.trim())
    setUserEmail(emailInput.trim())
  }

  const handleLogout = () => {
    localStorage.removeItem('freelance_user_email')
    setUserEmail('')
    setEmailInput('')
    setActivePage('dashboard')
    localStorage.removeItem('active_page')
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard userEmail={userEmail} />
      case 'invoices':
        return <InvoiceGenerator userEmail={userEmail} />
      case 'earnings':
        return <EarningsEstimator />
      case 'chat':
        return <ChatAssistant />
      case 'fees':
        return <PaymentFees />
      default:
        return <Dashboard userEmail={userEmail} />
    }
  }

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-sky-400 mb-2">
            FreelanceAI
          </h1>
          <p className="text-gray-400 mb-6">
            Enter your email to access your finance dashboard.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500"
            />

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Continue
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-4">
            Demo login using localStorage + Supabase user-scoped invoices.
          </p>
        </div>
      </div>
    )
  }

  return (
  <div className="min-h-screen bg-slate-950 text-white">
    <Sidebar activePage={activePage} setActivePage={handlePageChange} />

    <main className="pt-48 sm:pt-44 lg:pt-8 lg:ml-64 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-end mb-6">
        <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2">
          <span className="text-sm text-gray-300 break-all">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </div>

      {renderPage()}
    </main>
  </div>
)
}

export default App