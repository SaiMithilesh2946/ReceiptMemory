package com.receiptmemory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PurchaseResponse(
        Long id,
        String productName,
        String storeName,
        BigDecimal price,
        LocalDate purchaseDate,
        Integer warrantyMonths,
        String receiptImage,
        String receiptOriginalFilename,
        LocalDate warrantyExpiryDate,
        boolean warrantyActive,
        boolean warrantyExpired,
        long daysRemaining
) {
}
