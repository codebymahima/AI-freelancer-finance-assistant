function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-slate-900 rounded-xl border border-gray-700 p-4 sm:p-5 lg:p-6 ${className}`}
    >
      {children}
    </div>
  )
}

export default Card