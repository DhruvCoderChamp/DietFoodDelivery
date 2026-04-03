package com.mymorning.controller;

import com.mymorning.model.MenuItem;
import com.mymorning.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class MenuController {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @GetMapping("/api/products")
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    @PostMapping("/api/admin/products")
    public MenuItem createMenuItem(@RequestBody MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
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

    @DeleteMapping("/api/admin/products/{id}")
    public void deleteMenuItem(@PathVariable Long id) {
        menuItemRepository.deleteById(id);
    }
}
