function ReceiptModal({ imageUrl, title, onClose }) {
  if (!imageUrl) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      onClick={onClose}
    >
      <div className="receipt-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3 id="receipt-modal-title">{title}</h3>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close receipt preview"
          >
            ×
          </button>
        </div>

        <img src={imageUrl} alt={title} className="modal-image" />
      </div>
    </div>
  );
}

export default ReceiptModal;
