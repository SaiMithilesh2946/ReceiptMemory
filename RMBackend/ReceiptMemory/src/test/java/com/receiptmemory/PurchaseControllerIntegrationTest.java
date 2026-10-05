package com.receiptmemory;

import com.receiptmemory.entity.Purchase;
import com.receiptmemory.repository.PurchaseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class PurchaseControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private PurchaseRepository purchaseRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        purchaseRepository.deleteAll();
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void createPurchaseReturnsCreatedPurchase() throws Exception {
        String purchaseJson = "{\"productName\":\"Keyboard\",\"storeName\":\"Amazon\",\"price\":125.99,\"purchaseDate\":\"" + LocalDate.now().minusMonths(2) + "\",\"warrantyMonths\":12}";
        MockMultipartFile purchasePart = new MockMultipartFile(
                "purchase",
                "purchase.json",
                "application/json",
                purchaseJson.getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/purchases").file(purchasePart))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productName", is("Keyboard")))
                .andExpect(jsonPath("$.storeName", is("Amazon")))
                .andExpect(jsonPath("$.price", is(125.99)))
                .andExpect(jsonPath("$.warrantyExpiryDate").exists())
                .andExpect(jsonPath("$.warrantyActive", is(true)));
    }

    @Test
    void updatePurchaseUpdatesExistingRecord() throws Exception {
        Purchase purchase = new Purchase();
        purchase.setProductName("Mouse");
        purchase.setStoreName("Best Buy");
        purchase.setPrice(new BigDecimal("49.99"));
        purchase.setPurchaseDate(LocalDate.of(2025, 2, 1));
        purchase.setWarrantyMonths(12);
        Purchase saved = purchaseRepository.save(purchase);

        String updatedJson = "{\"productName\":\"Gaming Mouse\",\"storeName\":\"Office Depot\",\"price\":69.99,\"purchaseDate\":\"2025-02-05\",\"warrantyMonths\":24}";
        MockMultipartFile purchasePart = new MockMultipartFile(
                "purchase",
                "purchase.json",
                "application/json",
                updatedJson.getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/purchases/{id}", saved.getId())
                        .file(purchasePart)
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productName", is("Gaming Mouse")))
                .andExpect(jsonPath("$.storeName", is("Office Depot")))
                .andExpect(jsonPath("$.warrantyMonths", is(24)));
    }

    @Test
    void deletePurchaseRemovesRecord() throws Exception {
        Purchase purchase = new Purchase();
        purchase.setProductName("Monitor");
        purchase.setStoreName("Target");
        purchase.setPrice(new BigDecimal("299.00"));
        purchase.setPurchaseDate(LocalDate.now());
        purchase.setWarrantyMonths(6);
        Purchase saved = purchaseRepository.save(purchase);

        mockMvc.perform(delete("/api/purchases/{id}", saved.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/purchases/{id}", saved.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void searchPurchasesByProductAndStoreName() throws Exception {
        Purchase keyboard = new Purchase();
        keyboard.setProductName("Logitech Keyboard");
        keyboard.setStoreName("Amazon");
        keyboard.setPrice(new BigDecimal("89.00"));
        keyboard.setPurchaseDate(LocalDate.now().minusDays(15));
        keyboard.setWarrantyMonths(12);
        purchaseRepository.save(keyboard);

        mockMvc.perform(get("/api/purchases/search").param("q", "logi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].productName", is("Logitech Keyboard")));

        mockMvc.perform(get("/api/purchases/search").param("q", "amazon"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].storeName", is("Amazon")));
    }

    @Test
    void warrantyEndpointsReturnUpcomingAndExpiredRecords() throws Exception {
        Purchase upcoming = new Purchase();
        upcoming.setProductName("Tablet");
        upcoming.setStoreName("Apple Store");
        upcoming.setPrice(new BigDecimal("799.00"));
        upcoming.setPurchaseDate(LocalDate.now().minusMonths(11).minusDays(23));
        upcoming.setWarrantyMonths(12);
        purchaseRepository.save(upcoming);

        Purchase expired = new Purchase();
        expired.setProductName("Laptop");
        expired.setStoreName("Dell");
        expired.setPrice(new BigDecimal("1200.00"));
        expired.setPurchaseDate(LocalDate.now().minusYears(2));
        expired.setWarrantyMonths(12);
        purchaseRepository.save(expired);

        mockMvc.perform(get("/api/purchases/warranty/upcoming").param("days", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].productName", is("Tablet")))
                .andExpect(jsonPath("$[0].daysRemaining", greaterThanOrEqualTo(0)));

        mockMvc.perform(get("/api/purchases/warranty/expired"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].productName", is("Laptop")))
                .andExpect(jsonPath("$[0].warrantyExpired", is(true)));
    }

    @Test
    void validationRejectsInvalidPurchasePayload() throws Exception {
        String invalidBody = "{\"productName\":\"\",\"storeName\":\"\",\"price\":-5,\"purchaseDate\":null,\"warrantyMonths\":-2}";

        MockMultipartFile purchasePart = new MockMultipartFile(
                "purchase",
                "purchase.json",
                "application/json",
                invalidBody.getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/purchases").file(purchasePart))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void purchaseNotFoundReturnsNotFoundResponse() throws Exception {
        mockMvc.perform(get("/api/purchases/{id}", 9999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("9999")));
    }

    @Test
    void invalidMultipartPayloadReturnsStructuredValidationError() throws Exception {
        String invalidBody = "{\"productName\":\"Keyboard\",\"storeName\":\"Amazon\",\"price\":-10,\"purchaseDate\":\"bad-date\",\"warrantyMonths\":-5}";
        MockMultipartFile purchasePart = new MockMultipartFile(
                "purchase",
                "purchase.json",
                "application/json",
                invalidBody.getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/purchases").file(purchasePart))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void purchasesEndpointIncludesCorsHeadersForViteOrigin() throws Exception {
        Purchase purchase = new Purchase();
        purchase.setProductName("Camera");
        purchase.setStoreName("Walmart");
        purchase.setPrice(new BigDecimal("499.95"));
        purchase.setPurchaseDate(LocalDate.now().minusMonths(1));
        purchase.setWarrantyMonths(12);
        purchaseRepository.save(purchase);

        mockMvc.perform(get("/api/purchases")
                        .header("Origin", "http://localhost:5173"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }
}
