package com.mymorning.controller;

import com.mymorning.model.Order;
import com.mymorning.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDateTime;

@RestController
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/api/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/api/orders/{orderId}")
    public Order getOrderByOrderId(@PathVariable String orderId) {
            return orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with orderId: " + orderId));
    }

    @GetMapping("/api/orders/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public List<Order> getOrdersByUserId(@PathVariable Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @PostMapping("/api/orders")
    @PreAuthorize("isAuthenticated()")
    public Order createOrder(@RequestBody Order order) {
        if (order.getOrderId() == null || order.getOrderId().isEmpty()) {
            order.setOrderId("MM" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        }
        if (order.getCreatedAt() == null) {
            order.setCreatedAt(LocalDateTime.now());
        }
        return orderRepository.save(order);
    }

    @PutMapping("/api/admin/orders/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Order updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(statusUpdate.get("status"));
            return orderRepository.save(order);
        }).orElseThrow(() -> new RuntimeException("Order was not found"));
    }

    @DeleteMapping("/api/admin/orders/all")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> deleteAllOrders() {
        orderRepository.deleteAll();
        return Map.of("message", "All orders deleted successfully");
    }
}
