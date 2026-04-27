function PageShell({ title, subtitle, children }) {
  return (
    <section className="poll-section">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
      </div>

      <div className="page-shell-content">
        {children}
      </div>
    </section>
  )
}

export default PageShell