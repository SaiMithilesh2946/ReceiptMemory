import { buildReceiptUrl } from "../api/purchaseApi";

function PurchaseCard({ purchase, onEdit, onDelete, onOpenReceipt }) {
  const warrantyExpiry = new Date(purchase.purchaseDate);
  warrantyExpiry.setMonth(warrantyExpiry.getMonth() + purchase.warrantyMonths);
  warrantyExpiry.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const difference = Math.ceil((warrantyExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let status = "Active";
  let statusClass = "badge active";

  if (difference < 0) {
    status = "Expired";
    statusClass = "badge expired";
  } else if (difference <= 30) {
    status = "Expiring Soon";
    statusClass = "badge warning";
  }

  const receiptUrl = buildReceiptUrl(purchase.receiptImage);

  return (
    <article className="purchase-card" aria-label={`${purchase.productName} purchase card`}>
      <div className="card-topbar">
        <div>
          <span className={statusClass}>{status}</span>
        </div>

        <div className="card-actions">
          <button type="button" className="ghost-button small" onClick={() => onEdit(purchase)}>
            Edit
          </button>
          <button type="button" className="danger-button small" onClick={() => onDelete(purchase)}>
            Delete
          </button>
        </div>
      </div>

      <div className="purchase-header">
        <div>
          <h3>{purchase.productName}</h3>
          <p className="store-name">{purchase.storeName}</p>
        </div>
      </div>

      {receiptUrl && (
        <button type="button" className="receipt-thumb-button" onClick={() => onOpenReceipt(receiptUrl, purchase.productName)} aria-label={`Open receipt for ${purchase.productName}`}>
          <img src={receiptUrl} alt={`${purchase.productName} receipt`} />
        </button>
      )}

      <dl className="purchase-details">
        <div>
          <dt>Price</dt>
          <dd>₹{Number(purchase.price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
        </div>

        <div>
          <dt>Purchased</dt>
          <dd>{purchase.purchaseDate}</dd>
        </div>

        <div>
          <dt>Warranty</dt>
          <dd>{purchase.warrantyMonths} months</dd>
        </div>

        <div>
          <dt>Expiry</dt>
          <dd>{warrantyExpiry.toLocaleDateString()}</dd>
        </div>
      </dl>

      <div className="warranty-status-line">
        {difference < 0 ? (
          <span>Expired {Math.abs(difference)} day{Math.abs(difference) === 1 ? "" : "s"} ago</span>
        ) : (
          <span>{difference} day{difference === 1 ? "" : "s"} left</span>
        )}
      </div>
    </article>
  );
}

export default PurchaseCard;
