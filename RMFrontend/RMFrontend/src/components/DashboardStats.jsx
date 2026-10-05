function DashboardStats({ stats }) {
  const cards = [
    {
      label: "Total Purchases",
      value: stats.totalPurchases,
      tone: "primary",
    },
    {
      label: "Total Money Spent",
      value: `₹${stats.totalSpent.toLocaleString("en-IN")}`,
      tone: "success",
    },
    {
      label: "Active Warranties",
      value: stats.activeWarranties,
      tone: "info",
    },
    {
      label: "Expiring Soon",
      value: stats.expiringSoon,
      tone: "warning",
    },
  ];

  return (
    <section id="dashboard" className="stats-grid" aria-label="Purchase summary dashboard">
      {cards.map((card) => (
        <article key={card.label} className={`stat-card ${card.tone}`}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </article>
      ))}
    </section>
  );
}

export default DashboardStats;
