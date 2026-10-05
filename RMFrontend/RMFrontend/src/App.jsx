import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import {
  buildReceiptUrl,
  createPurchase,
  deletePurchase,
  fetchPurchases,
  updatePurchase,
} from "./api/purchaseApi";
import DashboardStats from "./components/DashboardStats";
import Header from "./components/Header";
import PurchaseCard from "./components/PurchaseCard";
import PurchaseForm from "./components/PurchaseForm";
import SearchBar from "./components/SearchBar";
import WarrantySection from "./components/WarrantySection";
import ReceiptModal from "./components/ReceiptModal";
import ConfirmDialog from "./components/ConfirmDialog";
import EmptyState from "./components/EmptyState";

const initialForm = {
  productName: "",
  storeName: "",
  price: "",
  purchaseDate: "",
  warrantyMonths: "",
};

function getWarrantySnapshot(purchase) {
  const purchaseDate = new Date(purchase.purchaseDate);
  const warrantyMonths = Number(purchase.warrantyMonths || 0);

  if (Number.isNaN(purchaseDate.getTime())) {
    return {
      expiryDate: new Date(),
      daysLeft: 0,
    };
  }

  const expiryDate = new Date(purchaseDate);
  expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);
  expiryDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const timeDifference = expiryDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return {
    expiryDate,
    daysLeft,
  };
}

function App() {
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formValues, setFormValues] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [existingReceiptImage, setExistingReceiptImage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const formSectionRef = useRef(null);

  const resetForm = () => {
    setFormValues(initialForm);
    setFormErrors({});
    setEditingId(null);
    setReceiptFile(null);
    setReceiptPreview("");
    setExistingReceiptImage("");
  };

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        setLoading(true);
        const data = await fetchPurchases();
        setPurchases(data);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(error.message || "Unable to load purchases.");
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, []);

  const enrichedPurchases = useMemo(
    () =>
      purchases.map((purchase) => ({
        ...purchase,
        ...getWarrantySnapshot(purchase),
      })),
    [purchases]
  );

  const filteredPurchases = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return enrichedPurchases;
    }

    return enrichedPurchases.filter((purchase) => {
      const product = (purchase.productName || "").toLowerCase();
      const store = (purchase.storeName || "").toLowerCase();
      return (
        product.startsWith(query) ||
        store.startsWith(query) ||
        product.includes(query) ||
        store.includes(query)
      );
    });
  }, [enrichedPurchases, search]);

  const totalSpent = enrichedPurchases.reduce((sum, purchase) => sum + Number(purchase.price || 0), 0);
  const activeWarranties = enrichedPurchases.filter((purchase) => purchase.daysLeft > 30).length;
  const expiringSoon = enrichedPurchases.filter((purchase) => purchase.daysLeft >= 0 && purchase.daysLeft <= 30).length;
  const upcomingWarranties = enrichedPurchases.filter((purchase) => purchase.daysLeft >= 0 && purchase.daysLeft <= 30);
  const expiredWarranties = enrichedPurchases.filter((purchase) => purchase.daysLeft < 0);

  const validateForm = (values) => {
    const nextErrors = {};

    if (!values.productName.trim()) {
      nextErrors.productName = "Product name is required.";
    }

    if (!values.storeName.trim()) {
      nextErrors.storeName = "Store name is required.";
    }

    if (values.price === "" || Number(values.price) < 0) {
      nextErrors.price = "Price must be 0 or greater.";
    }

    if (!values.purchaseDate) {
      nextErrors.purchaseDate = "Purchase date is required.";
    }

    if (values.warrantyMonths === "" || Number(values.warrantyMonths) < 0) {
      nextErrors.warrantyMonths = "Warranty months must be 0 or greater.";
    }

    return nextErrors;
  };

  const handleFieldChange = (field, value) => {
    setFormValues((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));

    setFormErrors((previousErrors) => ({
      ...previousErrors,
      [field]: "",
    }));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setReceiptFile(null);
      setReceiptPreview("");
      return;
    }

    setReceiptFile(selectedFile);
    setReceiptPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm(formValues);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setErrorMessage("Please check the highlighted fields.");
      return;
    }

    const payload = {
      productName: formValues.productName.trim(),
      storeName: formValues.storeName.trim(),
      price: Number(formValues.price),
      purchaseDate: formValues.purchaseDate,
      warrantyMonths: Number(formValues.warrantyMonths),
    };

    if (editingId !== null) {
      payload.receiptImage = existingReceiptImage || "";
    }

    try {
      setSaving(true);
      setErrorMessage("");

      if (editingId !== null) {
        const updatedPurchase = await updatePurchase(editingId, payload, receiptFile);
        setPurchases((previousPurchases) =>
          previousPurchases.map((purchase) => (purchase.id === editingId ? updatedPurchase : purchase))
        );
      } else {
        const createdPurchase = await createPurchase(payload, receiptFile);
        setPurchases((previousPurchases) => [createdPurchase, ...previousPurchases]);
      }

      resetForm();
    } catch (error) {
      setErrorMessage(error.message || "Unable to save purchase.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (purchase) => {
    setEditingId(purchase.id);
    setFormValues({
      productName: purchase.productName,
      storeName: purchase.storeName,
      price: Number(purchase.price).toString(),
      purchaseDate: purchase.purchaseDate,
      warrantyMonths: String(purchase.warrantyMonths),
    });
    setExistingReceiptImage(purchase.receiptImage || "");
    setReceiptFile(null);
    setReceiptPreview(purchase.receiptImage ? buildReceiptUrl(purchase.receiptImage) : "");
    setFormErrors({});
    setErrorMessage("");
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDeletePurchase = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeletingId(deleteTarget.id);
      setErrorMessage("");
      await deletePurchase(deleteTarget.id);
      setPurchases((previousPurchases) => previousPurchases.filter((purchase) => purchase.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      setErrorMessage(error.message || "Unable to delete purchase.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Header />
        <div className="loading-screen" aria-live="polite">Loading purchases...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header />

      {errorMessage && (
        <div className="notice error" role="alert">
          {errorMessage}
        </div>
      )}

      <DashboardStats
        stats={{
          totalPurchases: enrichedPurchases.length,
          totalSpent,
          activeWarranties,
          expiringSoon,
        }}
      />

      <section id="warranty" className="warranty-layout" aria-label="Warranty overview">
        <WarrantySection title="Expiring Soon" tone="warning" items={upcomingWarranties} />
        <WarrantySection title="Expired" tone="danger" items={expiredWarranties} />
        <WarrantySection title="Active" tone="success" items={enrichedPurchases.filter((purchase) => purchase.daysLeft > 30)} />
      </section>

      <div className="content-grid">
        <div ref={formSectionRef}>
          <PurchaseForm
            formValues={formValues}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            onCancelEdit={handleCancelEdit}
            editingId={editingId}
            isSubmitting={saving}
            selectedFile={receiptFile}
            previewImage={receiptPreview}
            onFileChange={handleFileChange}
            errors={formErrors}
          />
        </div>

        <section className="purchase-panel" aria-live="polite">
          <div className="panel-header purchase-header-row">
            <div className="panel-title-wrap">
              <span className="form-icon" aria-hidden="true">▣</span>
              <h2>Purchases</h2>
            </div>
          </div>

          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => setSearch("")}
          />

          {filteredPurchases.length === 0 ? (
            search.trim() ? (
              <div className="empty-state compact" role="status" aria-live="polite">
                <div className="empty-icon" aria-hidden="true">🔎</div>
                <h3>No purchases found</h3>
                <p>Try a different product name or store name.</p>
              </div>
            ) : (
              <EmptyState onAddPurchase={() => formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} />
            )
          ) : (
            <div className="purchase-grid">
              {filteredPurchases.map((purchase) => (
                <PurchaseCard
                  key={purchase.id}
                  purchase={purchase}
                  onEdit={handleEditClick}
                  onDelete={(item) => setDeleteTarget(item)}
                  onOpenReceipt={(imageUrl, title) => setSelectedReceipt({ imageUrl, title })}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <ReceiptModal
        imageUrl={selectedReceipt?.imageUrl}
        title={selectedReceipt?.title || "Receipt"}
        onClose={() => setSelectedReceipt(null)}
      />

      <ConfirmDialog
        title="Delete this purchase?"
        message="This purchase and its associated receipt may be removed from the system."
        confirmText={deletingId ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDeletePurchase}
        onCancel={() => setDeleteTarget(null)}
        isOpen={Boolean(deleteTarget)}
      />
    </div>
  );
}

export default App;