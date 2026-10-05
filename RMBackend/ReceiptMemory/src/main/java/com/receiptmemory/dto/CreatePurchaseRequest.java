package com.receiptmemory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreatePurchaseRequest(
        @NotBlank(message = "Product name is required") String productName,
        @NotBlank(message = "Store name is required") String storeName,
        @NotNull(message = "Price is required") @DecimalMin(value = "0.00", inclusive = true, message = "Price must be greater than or equal to 0") BigDecimal price,
        @NotNull(message = "Purchase date is required") LocalDate purchaseDate,
        @NotNull(message = "Warranty months is required") @PositiveOrZero(message = "Warranty months must be greater than or equal to 0") Integer warrantyMonths
) {
}
