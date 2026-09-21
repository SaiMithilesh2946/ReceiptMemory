package com.receiptmemory.controller;

import com.receiptmemory.entity.Purchase;
import com.receiptmemory.service.PurchaseService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public Purchase addPurchase(
            @RequestPart("purchase") Purchase purchase,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt
    ) throws IOException {
        return purchaseService.addPurchase(purchase, receipt);
    }

    @GetMapping
    public List<Purchase> getAllPurchases() {
        return purchaseService.getAllPurchases();
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public Purchase updatePurchase(
            @PathVariable Long id,
            @RequestPart("purchase") Purchase purchase,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt
    ) throws IOException {
        return purchaseService.updatePurchase(id, purchase, receipt);
    }

    @DeleteMapping("/{id}")
    public void deletePurchase(@PathVariable Long id) {
        purchaseService.deletePurchase(id);
    }
}