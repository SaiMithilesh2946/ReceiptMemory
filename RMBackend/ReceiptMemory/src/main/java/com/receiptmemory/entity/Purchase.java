package com.receiptmemory.entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.time.LocalDate;

@Entity
public class Purchase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productName;

    public Purchase(String productName, String storeName, double price, LocalDate purchaseDate, int warrantyMonths) {
        this.productName = productName;
        this.storeName = storeName;
        this.price = price;
        this.purchaseDate = purchaseDate;
        this.warrantyMonths = warrantyMonths;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public int getWarrantyMonths() {
        return warrantyMonths;
    }

    public void setWarrantyMonths(int warrantyMonths) {
        this.warrantyMonths = warrantyMonths;
    }

    private String storeName;
    private double price;
    private LocalDate purchaseDate;

    public Purchase() {
    }

    private int warrantyMonths;
    private String receiptImage;

    public String getReceiptImage() {
        return receiptImage;
    }

    public void setReceiptImage(String receiptImage) {
        this.receiptImage = receiptImage;
    }
}
