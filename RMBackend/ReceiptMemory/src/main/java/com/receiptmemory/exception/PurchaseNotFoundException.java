package com.receiptmemory.exception;

public class PurchaseNotFoundException extends RuntimeException {
    public PurchaseNotFoundException(Long id) {
        super("Purchase with id " + id + " was not found");
    }
}
