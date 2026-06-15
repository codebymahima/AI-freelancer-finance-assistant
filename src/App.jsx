import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import InvoiceGenerator from './pages/InvoiceGenerator'
import InvoiceHistory from './pages/InvoiceHistory'
import EarningsEstimator from './pages/EarningsEstimator'
import ChatAssistant from './pages/ChatAssistant'
import PaymentFees from './pages/PaymentFees'
import { supabase } from './lib/supabase'

function App() {
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem('active_page') || 'dashboard'
  })

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const getCurrentSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
      }

      setSession(data.session);
      setAuthLoading(false);
    }

    getCurrentSession();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })

    return () => {
      data.subscription.unsubscribe();
    }
  }, [])

  const userEmail = session?.user?.email || '';

  const handlePageChange = (page) => {
    setActivePage(page);
    localStorage.setItem('active_page', page);
  }

  const handleAuth = async (e) => {
    e.preventDefault();

    setAuthError('');
    setAuthMessage('');

    const email = emailInput.trim();
    const password = passwordInput.trim();

    if (!email || !password) {
      setAuthError('Please enter email and password');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    setSubmitLoading(true);

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({
        email,
        password
      })
      : await supabase.auth.signUp({
        email,
        password,
        options: {
        }
      })

    setSubmitLoading(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    setAuthMessage(
      isLogin
        ? 'Logged in successfully.'
        : 'Account created successfully.'
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setEmailInput('');
    setAuthMessage('');
    setAuthError('');
    setPasswordInput('');
    setActivePage('dashboard');
    localStorage.removeItem('active_page');
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard userEmail={userEmail} setActivePage={handlePageChange}/>
      case 'invoices':
        return <InvoiceGenerator userEmail={userEmail} />
      case 'history':
        return <InvoiceHistory userEmail={userEmail} />
      case 'earnings':
        return <EarningsEstimator />
      case 'chat':
        return <ChatAssistant />
      case 'fees':
        return <PaymentFees />
      default:
        return <Dashboard userEmail={userEmail} setActivePage={handlePageChange}/>
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!session) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-6 sm:px-6">
      <div className="w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-8 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-sky-400 mb-2">
          FreelanceAI
        </h1>

        <p className="text-sm sm:text-base text-gray-400 mb-5 sm:mb-6 leading-relaxed">
          {isLogin
            ? 'Login to access your finance dashboard.'
            : 'Create an account to start managing your freelance finances.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="you@example.com"
            className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:border-sky-500"
          />

          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Password"
            className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:border-sky-500"
          />

          {authError && (
            <p className="text-xs sm:text-sm text-red-400 leading-relaxed">
              {authError}
            </p>
          )}

          {authMessage && (
            <p className="text-xs sm:text-sm text-green-400 leading-relaxed">
              {authMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base"
          >
            {submitLoading
              ? 'Please wait...'
              : isLogin
              ? 'Login'
              : 'Create Account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin)
            setAuthError('')
            setAuthMessage('')
          }}
          className="text-sm text-sky-400 hover:text-sky-300 mt-4 leading-relaxed text-left"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  )
}
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar activePage={activePage} setActivePage={handlePageChange} />

      <main className="p-4 sm:p-6 lg:p-8 lg:ml-64">
        <div className="flex justify-end mb-6">
          <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2">
            <span className="text-sm text-gray-300 break-all">
              {userEmail}
            </span>

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