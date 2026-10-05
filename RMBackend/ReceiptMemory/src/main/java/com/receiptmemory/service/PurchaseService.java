package com.receiptmemory.service;

import com.receiptmemory.dto.CreatePurchaseRequest;
import com.receiptmemory.dto.PurchaseResponse;
import com.receiptmemory.dto.UpdatePurchaseRequest;
import com.receiptmemory.dto.WarrantyResponse;
import com.receiptmemory.entity.Purchase;
import com.receiptmemory.exception.InvalidFileUploadException;
import com.receiptmemory.exception.PurchaseNotFoundException;
import com.receiptmemory.exception.UnsupportedFileTypeException;
import com.receiptmemory.repository.PurchaseRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class PurchaseService {
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp"
    );

    private final PurchaseRepository purchaseRepository;
    private final Path uploadDirectory = Paths.get("uploads").toAbsolutePath().normalize();

    public PurchaseService(PurchaseRepository purchaseRepository) {
        this.purchaseRepository = purchaseRepository;
    }

    @Transactional
    public PurchaseResponse createPurchase(CreatePurchaseRequest request, MultipartFile receipt) {
        Purchase purchase = new Purchase();
        applyPurchaseDetails(purchase, request.productName(), request.storeName(), request.price(), request.purchaseDate(), request.warrantyMonths());

        if (receipt != null && !receipt.isEmpty()) {
            ReceiptFile receiptFile = saveReceipt(receipt);
            purchase.setReceiptImage(receiptFile.fileName());
            purchase.setReceiptOriginalFilename(receiptFile.originalFilename());
        }

        Purchase savedPurchase = purchaseRepository.save(purchase);
        return toResponse(savedPurchase);
    }

    public List<PurchaseResponse> getAllPurchases() {
        return purchaseRepository.findAll().stream().map(this::toResponse).toList();
    }

    public PurchaseResponse getPurchaseById(Long id) {
        return toResponse(findPurchaseById(id));
    }

    @Transactional
    public PurchaseResponse updatePurchase(Long id, UpdatePurchaseRequest request, MultipartFile receipt) {
        Purchase existingPurchase = findPurchaseById(id);
        applyPurchaseDetails(existingPurchase, request.productName(), request.storeName(), request.price(), request.purchaseDate(), request.warrantyMonths());

        String previousReceiptFileName = existingPurchase.getReceiptImage();

        if (receipt != null && !receipt.isEmpty()) {
            ReceiptFile receiptFile = saveReceipt(receipt);
            existingPurchase.setReceiptImage(receiptFile.fileName());
            existingPurchase.setReceiptOriginalFilename(receiptFile.originalFilename());
        }

        Purchase savedPurchase = purchaseRepository.save(existingPurchase);

        if (receipt != null && !receipt.isEmpty() && previousReceiptFileName != null && !previousReceiptFileName.equals(savedPurchase.getReceiptImage())) {
            deleteReceiptFile(previousReceiptFileName);
        }

        return toResponse(savedPurchase);
    }

    @Transactional
    public void deletePurchase(Long id) {
        Purchase purchase = findPurchaseById(id);
        if (purchase.getReceiptImage() != null) {
            deleteReceiptFile(purchase.getReceiptImage());
        }
        purchaseRepository.delete(purchase);
    }

    public List<PurchaseResponse> searchPurchases(String query) {
        if (query == null || query.isBlank()) {
            return getAllPurchases();
        }

        String normalizedQuery = query.trim();
        return purchaseRepository.findByProductNameContainingIgnoreCaseOrStoreNameContainingIgnoreCase(normalizedQuery, normalizedQuery)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<WarrantyResponse> getUpcomingWarrantyPurchases(Integer days) {
        int upcomingDays = days == null ? 30 : Math.max(0, days);

        return purchaseRepository.findAll().stream()
                .map(this::toWarrantyResponse)
                .filter(response -> response.warrantyActive() && response.daysRemaining() >= 0 && response.daysRemaining() <= upcomingDays)
                .sorted(Comparator.comparingLong(WarrantyResponse::daysRemaining))
                .toList();
    }

    public List<WarrantyResponse> getExpiredWarrantyPurchases() {
        return purchaseRepository.findAll().stream()
                .map(this::toWarrantyResponse)
                .filter(WarrantyResponse::warrantyExpired)
                .sorted(Comparator.comparingLong(WarrantyResponse::daysRemaining).reversed())
                .toList();
    }

    private Purchase findPurchaseById(Long id) {
        return purchaseRepository.findById(id)
                .orElseThrow(() -> new PurchaseNotFoundException(id));
    }

    private void applyPurchaseDetails(Purchase purchase, String productName, String storeName, BigDecimal price, LocalDate purchaseDate, Integer warrantyMonths) {
        purchase.setProductName(productName == null ? null : productName.trim());
        purchase.setStoreName(storeName == null ? null : storeName.trim());
        purchase.setPrice(price);
        purchase.setPurchaseDate(purchaseDate);
        purchase.setWarrantyMonths(warrantyMonths);
    }

    private PurchaseResponse toResponse(Purchase purchase) {
        WarrantyResponse warrantyResponse = toWarrantyResponse(purchase);
        return new PurchaseResponse(
                purchase.getId(),
                purchase.getProductName(),
                purchase.getStoreName(),
                purchase.getPrice(),
                purchase.getPurchaseDate(),
                purchase.getWarrantyMonths(),
                purchase.getReceiptImage(),
                purchase.getReceiptOriginalFilename(),
                warrantyResponse.warrantyExpiryDate(),
                warrantyResponse.warrantyActive(),
                warrantyResponse.warrantyExpired(),
                warrantyResponse.daysRemaining()
        );
    }

    private WarrantyResponse toWarrantyResponse(Purchase purchase) {
        LocalDate warrantyExpiryDate = purchase.getPurchaseDate().plusMonths(purchase.getWarrantyMonths());
        boolean warrantyExpired = !warrantyExpiryDate.isAfter(LocalDate.now());
        boolean warrantyActive = !warrantyExpired;
        long daysRemaining = warrantyActive ? ChronoUnit.DAYS.between(LocalDate.now(), warrantyExpiryDate) : 0;

        return new WarrantyResponse(
                purchase.getId(),
                purchase.getProductName(),
                purchase.getStoreName(),
                purchase.getPurchaseDate(),
                purchase.getWarrantyMonths(),
                warrantyExpiryDate,
                warrantyActive,
                warrantyExpired,
                daysRemaining
        );
    }

    private ReceiptFile saveReceipt(MultipartFile receipt) {
        if (receipt == null || receipt.isEmpty()) {
            throw new InvalidFileUploadException("Receipt file is empty.");
        }

        String contentType = receipt.getContentType();

        System.out.println("UPLOAD FILE: " + receipt.getOriginalFilename());
        System.out.println("UPLOAD CONTENT TYPE: " + contentType);
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new UnsupportedFileTypeException("Only image files are allowed (JPG, PNG, GIF, WEBP, BMP).");
        }

        String originalFilename = Objects.requireNonNullElse(receipt.getOriginalFilename(), "receipt");
        String sanitizedFilename = sanitizeFilename(originalFilename);

        if (sanitizedFilename.isBlank() || sanitizedFilename.contains("..")) {
            throw new InvalidFileUploadException("Invalid receipt filename.");
        }

        try {
            Files.createDirectories(uploadDirectory);
            String extension = getFileExtension(sanitizedFilename);
            String storedFilename = UUID.randomUUID() + (extension.isBlank() ? "" : "." + extension);
            Path destinationPath = uploadDirectory.resolve(storedFilename);
            Files.copy(receipt.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);
            return new ReceiptFile(storedFilename, originalFilename);
        } catch (IOException ex) {
            throw new InvalidFileUploadException("Unable to save receipt file.");
        }
    }

    private void deleteReceiptFile(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return;
        }

        Path filePath = uploadDirectory.resolve(fileName).normalize();
        if (filePath.startsWith(uploadDirectory)) {
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException ex) {
                throw new InvalidFileUploadException("Unable to delete the existing receipt file.");
            }
        }
    }

    private String sanitizeFilename(String fileName) {
        String cleaned = fileName.replace("\\", "/");
        int lastSeparatorIndex = cleaned.lastIndexOf('/');
        String safeName = lastSeparatorIndex >= 0 ? cleaned.substring(lastSeparatorIndex + 1) : cleaned;
        return safeName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        return dotIndex >= 0 && dotIndex < fileName.length() - 1 ? fileName.substring(dotIndex + 1) : "";
    }

    private record ReceiptFile(String fileName, String originalFilename) {
    }
}
