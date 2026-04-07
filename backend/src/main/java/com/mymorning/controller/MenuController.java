package com.mymorning.controller;

import com.mymorning.model.MenuItem;
import com.mymorning.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
public class MenuController {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Transactional(readOnly = true)
    @GetMapping("/api/products")
    public List<MenuItem> getAllMenuItems() {
        System.out.println("LEAD DEV OPTIMIZATION: Loading metadata list... (images stripped for speed)");
        List<MenuItem> items = menuItemRepository.findAll();
        // Clear the heavy image data from the list objects before serializing to JSON
        // This drops the payload size by over 98%
        items.forEach(item -> item.setImage(null));
        return items;
    }

    @GetMapping("/api/products/{id}/image")
    public ResponseEntity<byte[]> getProductImage(@PathVariable Long id) {
        return menuItemRepository.findById(id).map(item -> {
            String img = item.getImage();
            if (img != null && img.contains(",")) {
                // Parse standard base64 data URL from DB
                String base64Content = img.split(",")[1];
                byte[] decodedBytes = java.util.Base64.getDecoder().decode(base64Content);
                String contentType = img.split(";")[0].split(":")[1];
                
                return ResponseEntity.ok()
                        .header("Content-Type", contentType)
                        .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
                        .body(decodedBytes);
            }
            return ResponseEntity.notFound().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @PostMapping("/api/admin/products")
    public MenuItem createMenuItem(@RequestBody MenuItem menuItem) {
        System.out.println("LEAD DEV ACTION: Securely persisting product: " + menuItem.getName());
        MenuItem saved = menuItemRepository.saveAndFlush(menuItem);
        return saved;
    }

    @PutMapping("/api/admin/products/{id}")
    public MenuItem updateMenuItem(@PathVariable Long id, @RequestBody MenuItem updatedItem) {
        return menuItemRepository.findById(id).map(item -> {
            item.setName(updatedItem.getName());
            item.setPrice(updatedItem.getPrice());
            item.setCalories(updatedItem.getCalories());
            item.setProtein(updatedItem.getProtein());
            item.setCategory(updatedItem.getCategory());
            item.setDescription(updatedItem.getDescription());
            item.setImage(updatedItem.getImage());
            item.setTags(updatedItem.getTags());
            item.setBadge(updatedItem.getBadge());
            item.setIsVeg(updatedItem.getIsVeg());
            item.setIsAvailable(updatedItem.getIsAvailable());
            item.setOrderIndex(updatedItem.getOrderIndex());
            return menuItemRepository.save(item);
        }).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @PutMapping("/api/admin/products/reorder")
    public List<MenuItem> reorderItems(@RequestBody List<MenuItem> items) {
        for (MenuItem item : items) {
            menuItemRepository.findById(item.getId()).ifPresent(dbItem -> {
                dbItem.setOrderIndex(item.getOrderIndex());
                menuItemRepository.save(dbItem);
            });
        }
        return items;
    }

    @Transactional
    @DeleteMapping("/api/admin/products/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long id) {
        try {
            System.out.println("LEAD DEV ACTION: Executing hard-delete for product ID: " + id);
            if (!menuItemRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            menuItemRepository.deleteById(id);
            menuItemRepository.flush();
            // Confirm the deletion to the frontend
            return ResponseEntity.ok(Map.of("message", "Product deleted permanently", "id", id));
        } catch (Exception e) {
            System.err.println("CRITICAL DELETE FAILURE: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Database link prevented deletion."));
        }
    }
}
