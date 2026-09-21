package com.receiptmemory.service;

import com.receiptmemory.entity.Purchase;
import com.receiptmemory.repository.PurchaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import java.util.List;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;

    public PurchaseService(PurchaseRepository purchaseRepository) {
        this.purchaseRepository = purchaseRepository;
    }

    public Purchase addPurchase(Purchase purchase, MultipartFile receipt) throws IOException {

        if (receipt != null && !receipt.isEmpty()) {
            String fileName = receipt.getOriginalFilename();

            Path uploadPath = Paths.get("uploads");

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);

            Files.copy(receipt.getInputStream(), filePath,
                    StandardCopyOption.REPLACE_EXISTING);

            purchase.setReceiptImage(fileName);
        }

        return purchaseRepository.save(purchase);
    }

    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    public Purchase updatePurchase(
            Long id,
            Purchase purchase,
            MultipartFile receipt
    ) throws IOException {

        purchase.setId(id);

        if (receipt != null && !receipt.isEmpty()) {
            String fileName = receipt.getOriginalFilename();

            Path uploadPath = Paths.get("uploads");

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);

            Files.copy(
                    receipt.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            purchase.setReceiptImage(fileName);
        }

        return purchaseRepository.save(purchase);
    }

    public void deletePurchase(Long id) {
        purchaseRepository.deleteById(id);
    }
}