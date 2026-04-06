package com.mymorning.controller;

import com.mymorning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "MyMorning Backend is running");
        
        try {
            long userCount = userRepository.count();
            response.put("database", "CONNECTED");
            response.put("userCount", userCount);
        } catch (Exception e) {
            response.put("database", "DISCONNECTED");
            response.put("error", e.getMessage());
            // We still return 200 for health but with details, 
            // or we could throw an exception to trigger 503 from GlobalExceptionHandler.
        }
        
        return response;
    }
}
