package com.mymorning.controller;

import com.mymorning.model.Subscription;
import com.mymorning.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Date;
import java.util.Optional;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private SubscriptionRepository repository;

    @PostMapping("/save")
    public ResponseEntity<?> saveSubscription(@RequestBody Subscription sub) {
        // Find if user already has a subscription
        Optional<Subscription> existing = repository.findByUserId(sub.getUserId());
        
        if (existing.isPresent()) {
            Subscription toUpdate = existing.get();
            toUpdate.setPlanType(sub.getPlanType());
            toUpdate.setStatus(sub.getStatus());
            toUpdate.setDeliverySlot(sub.getDeliverySlot());
            toUpdate.setMealsJson(sub.getMealsJson());
            toUpdate.setRemainingDays(sub.getRemainingDays());
            repository.save(toUpdate);
            return ResponseEntity.ok(toUpdate);
        } else {
            sub.setStartDate(new Date());
            repository.save(sub);
            return ResponseEntity.ok(sub);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getSubscription(@PathVariable Long userId) {
        return repository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
