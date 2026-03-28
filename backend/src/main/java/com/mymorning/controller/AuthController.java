
package com.mymorning.controller;

import com.mymorning.model.User;
import com.mymorning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        // Secure Admin validation
        if ("admin@mymorning.in".equals(email) && "admin123".equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("token", "admin_mock_token_123");
            response.put("role", "admin");
            
            Map<String, String> user = new HashMap<>();
            user.put("name", "Admin");
            user.put("email", email);
            response.put("user", user);

            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String name = payload.get("name");

        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Valid Google Email is required"));
        }

        // Automatic Login or Registration via Single/SSO Config
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setName(name != null ? name : "Google User");
            user.setRole("user");
            userRepository.save(user);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("token", "secure_session_" + user.getId());
        response.put("role", user.getRole());
        response.put("user", user);

        return ResponseEntity.ok(response);
    }
}
