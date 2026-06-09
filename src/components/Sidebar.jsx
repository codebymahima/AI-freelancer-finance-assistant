import {
  HomeIcon,
  DocumentTextIcon,
  CalculatorIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { id: 'invoices', label: 'Invoices', icon: DocumentTextIcon },
  { id: 'earnings', label: 'Earnings', icon: CalculatorIcon },
  { id: 'chat', label: 'AI Assistant', icon: ChatBubbleLeftRightIcon },
  { id: 'fees', label: 'Payment Fees', icon: CreditCardIcon }
]

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sticky top-0 lg:fixed lg:top-0 lg:left-0 w-full lg:w-64 lg:h-screen bg-slate-900 border-b lg:border-b-0 lg:border-r border-gray-700 p-4 lg:p-6 z-50">
      <div className="mb-4 lg:mb-10">
        <h1 className="text-xl lg:text-2xl font-bold text-sky-400">
          FreelanceAI
        </h1>
        <p className="text-xs lg:text-sm text-gray-500">Finance Assistant</p>
      </div>

      <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-all text-sm lg:text-base ${
                isActive
                  ? 'bg-sky-600 text-white'
                  : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar