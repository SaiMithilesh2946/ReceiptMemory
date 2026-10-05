function PurchaseForm({
  formValues,
  onFieldChange,
  onSubmit,
  onCancelEdit,
  editingId,
  isSubmitting,
  selectedFile,
  previewImage,
  onFileChange,
  errors,
}) {
  const { productName, storeName, price, purchaseDate, warrantyMonths } = formValues;

  return (
    <section className="form-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <span className="form-icon" aria-hidden="true">✦</span>
          <h2>{editingId !== null ? "Edit Purchase" : "Add Purchase"}</h2>
        </div>
      </div>

      <form onSubmit={onSubmit} className="purchase-form" noValidate>
        <div className="form-grid">
          <div className="field-group">
            <label htmlFor="productName">Product Name <span aria-hidden="true">*</span></label>
            <input
              id="productName"
              type="text"
              value={productName}
              onChange={(event) => onFieldChange("productName", event.target.value)}
              placeholder="e.g. Noise Cancelling Headphones"
              aria-invalid={Boolean(errors.productName)}
            />
            {errors.productName && <span className="field-error">{errors.productName}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="storeName">Store Name <span aria-hidden="true">*</span></label>
            <input
              id="storeName"
              type="text"
              value={storeName}
              onChange={(event) => onFieldChange("storeName", event.target.value)}
              placeholder="e.g. Amazon, Croma, local shop"
              aria-invalid={Boolean(errors.storeName)}
            />
            {errors.storeName && <span className="field-error">{errors.storeName}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="price">Price <span aria-hidden="true">*</span></label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => onFieldChange("price", event.target.value)}
              placeholder="0.00"
              aria-invalid={Boolean(errors.price)}
            />
            {errors.price && <span className="field-error">{errors.price}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="purchaseDate">Purchase Date <span aria-hidden="true">*</span></label>
            <input
              id="purchaseDate"
              type="date"
              value={purchaseDate}
              onChange={(event) => onFieldChange("purchaseDate", event.target.value)}
              aria-invalid={Boolean(errors.purchaseDate)}
            />
            {errors.purchaseDate && <span className="field-error">{errors.purchaseDate}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="warrantyMonths">Warranty Months <span aria-hidden="true">*</span></label>
            <input
              id="warrantyMonths"
              type="number"
              min="0"
              step="1"
              value={warrantyMonths}
              onChange={(event) => onFieldChange("warrantyMonths", event.target.value)}
              placeholder="12"
              aria-invalid={Boolean(errors.warrantyMonths)}
            />
            {errors.warrantyMonths && <span className="field-error">{errors.warrantyMonths}</span>}
          </div>
        </div>

        <div className="field-group file-upload-block">
          <label htmlFor="receiptUpload">Receipt Image</label>
          <div className="upload-box">
            <input
              id="receiptUpload"
              type="file"
              accept="image/*"
              onChange={onFileChange}
            />
          </div>

          {previewImage && (
            <div className="preview-box" aria-live="polite">
              <img src={previewImage} alt="Receipt preview" />
            </div>
          )}

          {selectedFile && <p className="selected-file">Selected file: {selectedFile.name}</p>}
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? (editingId !== null ? "Updating..." : "Saving...") : editingId !== null ? "Update Purchase" : "Save Purchase"}
          </button>

          {editingId !== null && (
            <button type="button" className="secondary-button" onClick={onCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default PurchaseForm;
