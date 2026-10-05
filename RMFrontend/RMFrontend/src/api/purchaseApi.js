export const API_BASE_URL = "https://receipt-memory-backend.onrender.com";

function getErrorMessage(response, fallbackMessage) {
  if (response.ok) {
    return "";
  }

  return fallbackMessage;
}

export function buildReceiptUrl(receiptImage) {
  if (!receiptImage) {
    return "";
  }

  return `${API_BASE_URL}/uploads/${receiptImage}`;
}

export async function fetchPurchases() {
  const response = await fetch(`${API_BASE_URL}/api/purchases`);

  if (!response.ok) {
    throw new Error("Unable to load purchases.");
  }

  return response.json();
}

export async function createPurchase(purchase, receiptFile) {
  const formData = new FormData();

  formData.append(
    "purchase",
    new Blob([JSON.stringify(purchase)], {
      type: "application/json",
    })
  );

  if (receiptFile) {
    formData.append("receipt", receiptFile);
  }

  const response = await fetch(`${API_BASE_URL}/api/purchases`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(response, "Unable to save purchase."));
  }

  return response.json();
}

export async function updatePurchase(id, purchase, receiptFile) {
  const formData = new FormData();

  formData.append(
    "purchase",
    new Blob([JSON.stringify(purchase)], {
      type: "application/json",
    })
  );

  if (receiptFile) {
    formData.append("receipt", receiptFile);
  }

  const response = await fetch(`${API_BASE_URL}/api/purchases/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(response, "Unable to update purchase."));
  }

  return response.json();
}

export async function deletePurchase(id) {
  const response = await fetch(`${API_BASE_URL}/api/purchases/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Unable to delete purchase.");
  }
}
