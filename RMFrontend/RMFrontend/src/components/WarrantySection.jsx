function WarrantySection({ purchases, title, items, tone }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className={`warranty-panel ${tone}`} aria-live="polite">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <span className={`status-dot ${tone}`} aria-hidden="true"></span>
          <h2>{title}</h2>
        </div>
      </div>

      <ul className="warranty-list">
        {items.map((purchase) => (
          <li key={purchase.id} className="warranty-item">
            <div>
              <strong>{purchase.productName}</strong>
              <p>{purchase.storeName}</p>
            </div>

            <div className="warranty-meta">
              {purchase.daysLeft >= 0 ? (
                <span>{purchase.daysLeft} days left</span>
              ) : (
                <span>{Math.abs(purchase.daysLeft)} days ago</span>
              )}
              <small>Expires on {purchase.expiryDate.toLocaleDateString()}</small>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default WarrantySection;
