package com.receiptmemory.controller;

import com.receiptmemory.dto.CreatePurchaseRequest;
import com.receiptmemory.dto.PurchaseResponse;
import com.receiptmemory.dto.UpdatePurchaseRequest;
import com.receiptmemory.dto.WarrantyResponse;
import com.receiptmemory.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@Validated
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PurchaseResponse> createPurchase(
            @RequestPart("purchase") @Valid CreatePurchaseRequest request,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(purchaseService.createPurchase(request, receipt));
    }

    @GetMapping
    public List<PurchaseResponse> getAllPurchases() {
        return purchaseService.getAllPurchases();
    }

    @GetMapping("/{id}")
    public PurchaseResponse getPurchaseById(@PathVariable Long id) {
        return purchaseService.getPurchaseById(id);
    }

    @GetMapping("/search")
    public List<PurchaseResponse> searchPurchases(@RequestParam(name = "q", required = false) String query) {
        return purchaseService.searchPurchases(query);
    }

    @GetMapping("/warranty/upcoming")
    public List<WarrantyResponse> getUpcomingWarranties(@RequestParam(name = "days", required = false, defaultValue = "30") Integer days) {
        return purchaseService.getUpcomingWarrantyPurchases(days);
    }

    @GetMapping("/warranty/expired")
    public List<WarrantyResponse> getExpiredWarranties() {
        return purchaseService.getExpiredWarrantyPurchases();
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PurchaseResponse updatePurchase(
            @PathVariable Long id,
            @RequestPart("purchase") @Valid UpdatePurchaseRequest request,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt
    ) {
        return purchaseService.updatePurchase(id, request, receipt);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchase(@PathVariable Long id) {
        purchaseService.deletePurchase(id);
        return ResponseEntity.noContent().build();
    }
}
