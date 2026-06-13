package com.mymorning.controller;

import com.mymorning.dto.AdminSubscriptionResponse;
import com.mymorning.repository.SubscriptionRepository;
import com.mymorning.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/subscriptions")
public class AdminSubscriptionController {

    private final SubscriptionRepository repository;
    private final UserRepository userRepository;

    public AdminSubscriptionController(SubscriptionRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @GetMapping("/all")
    public List<AdminSubscriptionResponse> getAllSubscriptions() {
        return repository.findAll().stream().map(subscription -> {
            AdminSubscriptionResponse response = AdminSubscriptionResponse.from(subscription);
            if (subscription.getUserId() != null) {
                userRepository.findById(subscription.getUserId()).ifPresent(user -> {
                    response.setCustomerName(user.getName());
                    response.setPhone(user.getPhone());
                });
            }
            return response;
        }).toList();
    }
}
