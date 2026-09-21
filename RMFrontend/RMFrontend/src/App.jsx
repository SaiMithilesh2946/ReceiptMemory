import { useEffect, useState,useRef } from "react";

function App() {
  const [productName, setProductName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [price, setPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState("");
  const [receiptImage, setReceiptImage] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef(null);

  // Load purchases when the website opens
  useEffect(() => {
    async function loadPurchases() {
      const response = await fetch(
        "http://localhost:8080/api/purchases"
      );

      const data = await response.json();

      setPurchases(data);
    }

    loadPurchases();
  }, []);

  // Add a new purchase
 async function handleSubmit(e) {
  e.preventDefault();

  const purchase = {
  productName,
  storeName,
  price: Number(price),
  purchaseDate,
  warrantyMonths: Number(warrantyMonths)
};

const formData = new FormData();

formData.append(
  "purchase",
  new Blob([JSON.stringify(purchase)], {
    type: "application/json"
  })
);

if (receiptImage) {
  formData.append("receipt", receiptImage);
}

  if (editingId !== null) {
    const response = await fetch(
  `http://localhost:8080/api/purchases/${editingId}`,
  {
    method: "PUT",
    body: formData
  }
);

    const updatedPurchase = await response.json();

    setPurchases((previousPurchases) =>
      previousPurchases.map((item) =>
        item.id === editingId
          ? updatedPurchase
          : item
      )
    );

    setEditingId(null);
  } else {
   const response = await fetch(
  "http://localhost:8080/api/purchases",
  {
    method: "POST",
    body: formData
  }
);

    const result = await response.json();

    setPurchases((previousPurchases) => [
      ...previousPurchases,
      result
    ]);
  }
}
  // Search purchases
  const filteredPurchases = purchases.filter((purchase) =>
    purchase.productName
      .toLowerCase()
      .startsWith(search.toLowerCase())
  );

  // Calculate warranty information
  constconst re warrantyInfo = purchases.map((purchase) => {
    const expiryDate = new Date(purchase.purchaseDate);

    expiryDate.setMonth(
      expiryDate.getMonth() + purchase.warrantyMonths
    );

    const today = new Date();

    // Remove time from today's date
    today.setHours(0, 0, 0, 0);

    // Remove time from expiry date
    expiryDate.setHours(0, 0, 0, 0);

    const difference =
      expiryDate.getTime() - today.getTime();

    const daysLeft = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    return {
      ...purchase,
      expiryDate,
      daysLeft
    };
  });

  // Warrants expiring within 30 days
  const upcomingWarranties = warrantyInfo.filter(
    (purchase) =>
      purchase.daysLeft >= 0 &&
      purchase.daysLeft <= 30
  );

  // Already expired warranties
  const expiredWarranties = warrantyInfo.filter(
    (purchase) => purchase.daysLeft < 0
  );

  return (
    <div>
      <h1>Receipt Memory</h1>

      <p>
        Remember what you bought, where you bought it, and when.
      </p>

      {/* UPCOMING WARRANTY REMINDER */}

      {upcomingWarranties.length > 0 && (
        <div className="warranty-alert">
          <h2>⚠️ Warranty Reminder</h2>

          {upcomingWarranties.map((purchase) => (
            <p key={purchase.id}>
              <strong>{purchase.productName}</strong> —{" "}
              {purchase.daysLeft} days left
            </p>
          ))}
        </div>
      )}

      {/* EXPIRED WARRANTIES */}

      {expiredWarranties.length > 0 && (
        <div className="warranty-alert">
          <h2>🔴 Expired Warranties</h2>

          {expiredWarranties.map((purchase) => (
            <p key={purchase.id}>
              <strong>{purchase.productName}</strong> —{" "}
              Warranty expired{" "}
              {Math.abs(purchase.daysLeft)} days ago
            </p>
          ))}
        </div>
      )}

      {/* ADD PURCHASE */}

      <h2>Add Purchase</h2>

      <form ref={formRef} onSubmit={handleSubmit}>
        <div>
          <label>Product Name</label>
          <br />

          <input
            type="text"
            value={productName}
            onChange={(e) =>
              setProductName(e.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Store Name</label>
          <br />

          <input
            type="text"
            value={storeName}
            onChange={(e) =>
              setStoreName(e.target.value)
            }
          />
        </div>

        <br />

        <div>
  <label>Price</label>
  <br />

  <input
    type="number"
    value={price}
    onChange={(e) =>
      setPrice(e.target.value)
    }
  />
</div>

<br />

<div>
  <label>Receipt Image</label>
  <br />

  <input
    type="file"
    accept="image/*"
    onChange={(e) => setReceiptImage(e.target.files[0])}
  />
   {receiptImage && (
    <p>Selected: {receiptImage.name}</p>
  )}
</div>

        <br />

        <div>
          <label>Purchase Date</label>
          <br />

          <input
            type="date"
            value={purchaseDate}
            onChange={(e) =>
              setPurchaseDate(e.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Warranty (months)</label>
          <br />

          <input
            type="number"
            value={warrantyMonths}
            onChange={(e) =>
              setWarrantyMonths(e.target.value)
            }
          />
        </div>

        <br />

        <button type="submit">
  {editingId !== null ? "Update Purchase" : "Save Purchase"}
</button>

{editingId !== null && (
  <button
    type="button"
    onClick={() => {
      setEditingId(null);
      setProductName("");
      setStoreName("");
      setPrice("");
      setPurchaseDate("");
      setWarrantyMonths("");
    }}
  >
    Cancel Edit
  </button>
)}
      </form>

      {/* SEARCH */}

      <input
        type="text"
        placeholder="Search your purchases..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      {/* PURCHASE LIST */}

      <h2>My Purchases</h2>

      <div className="purchase-list">
        {filteredPurchases.map((purchase) => (
          <div
            className="purchase-card"
            key={purchase.id}
          >
            <h3>{purchase.productName}</h3>

            <p>
              <strong>Store:</strong>{" "}
              {purchase.storeName}
            </p>

            <p>
              <strong>Price:</strong>{" "}
              ₹{purchase.price}
            </p>

            <p>
              <strong>Purchased:</strong>{" "}
              {purchase.purchaseDate}
            </p>

            <p>
              <strong>Warranty:</strong>{" "}
              {purchase.warrantyMonths} months
            </p>

            <p>
  <strong>Warranty expires:</strong>{" "}
  {new Date(
    new Date(purchase.purchaseDate).setMonth(
      new Date(purchase.purchaseDate).getMonth() +
        purchase.warrantyMonths
    )
  ).toLocaleDateString()}
</p>

<button
  onClick={() => {
    setProductName(purchase.productName);
    setStoreName(purchase.storeName);
    setPrice(purchase.price);
    setPurchaseDate(purchase.purchaseDate);
    setWarrantyMonths(purchase.warrantyMonths);
    setEditingId(purchase.id);

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }}
>
  Edit
</button>

<button
  onClick={async () => {
    await fetch(
      `http://localhost:8080/api/purchases/${purchase.id}`,
      {
        method: "DELETE"
      }
    );

    setPurchases((previousPurchases) =>
      previousPurchases.filter(
        (item) => item.id !== purchase.id
      )
    );
  }}
>
  Delete
</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;