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
  { id: 'fees', label: 'Payment Fees', icon: CreditCardIcon },
]

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-gray-700 p-6">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-sky-400">FreelanceAI</h1>
        <p className="text-sm text-gray-500">Finance Assistant</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-sky-600 text-white' 
                  : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
