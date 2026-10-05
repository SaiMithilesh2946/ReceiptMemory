function ConfirmDialog({ title, message, confirmText, cancelText, onConfirm, onCancel, isOpen }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(event) => event.stopPropagation()}>
        <h3 id="confirm-dialog-title">{title}</h3>
        <p>{message}</p>

        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" className="danger-button" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
