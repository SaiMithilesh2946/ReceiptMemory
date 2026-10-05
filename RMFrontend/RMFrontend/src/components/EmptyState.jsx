function EmptyState({ onAddPurchase }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-icon" aria-hidden="true">
        🧾
      </div>

      <h3>No purchases yet</h3>
      <p>
        Start by adding your first purchase and keep your receipts and warranties organized.
      </p>

      <button type="button" className="primary-button" onClick={onAddPurchase}>
        Add Purchase
      </button>
    </div>
  );
}

export default EmptyState;
