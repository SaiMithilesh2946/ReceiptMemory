package com.receiptmemory.dto;

import java.time.LocalDate;

public record WarrantyResponse(
        Long id,
        String productName,
        String storeName,
        LocalDate purchaseDate,
        Integer warrantyMonths,
        LocalDate warrantyExpiryDate,
        boolean warrantyActive,
        boolean warrantyExpired,
        long daysRemaining
) {
}
