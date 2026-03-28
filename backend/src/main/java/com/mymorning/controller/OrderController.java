
package com.mymorning.controller;

import com.mymorning.model.Order;
import com.mymorning.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/api/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @PostMapping("/api/orders")
    public Order createOrder(@RequestBody Order order) {
        order.setOrderId("MM" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        return orderRepository.save(order);
    }

    @PutMapping("/api/admin/orders/{id}")
    public Order updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(statusUpdate.get("status"));
            return orderRepository.save(order);
        }).orElseThrow(() -> new RuntimeException("Order not found"));
    }
}
