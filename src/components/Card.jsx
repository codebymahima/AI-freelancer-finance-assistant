function Card({ children, className = '' }) {
  return (
    <div className={`bg-slate-900 border border-slate-700 rounded-xl p-6 ${className}`}>
      {children}
    </div>
  )
}

export default Card
