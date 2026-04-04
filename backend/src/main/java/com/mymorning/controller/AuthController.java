
package com.mymorning.controller;

import com.mymorning.config.JwtUtils;
import com.mymorning.model.User;
import com.mymorning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private static final String ADMIN_CHECK_EMAIL = "mymorningblr@gmail.com";
    private static final String ADMIN_CHECK_PASS = "My123mor#@i123";

    /**
     * Admin login using credentials.
     * Note: In production, consider moving admin users to the database 
     * or using an external identity provider.
     */
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (ADMIN_CHECK_EMAIL.equals(email) && ADMIN_CHECK_PASS.equals(password)) {
            // Mock Admin User for token generation
            User admin = User.builder()
                    .phone("ADMIN_SECURE")
                    .name("Admin")
                    .role("ROLE_ADMIN")
                    .id(0L)
                    .build();

            String token = jwtUtils.generateToken(ADMIN_CHECK_EMAIL, "ROLE_ADMIN", 0L);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", "ROLE_ADMIN");
            response.put("user", admin);

            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid admin credentials"));
    }

    /**
     * Unified phone number authentication.
     * Handles both login and registration via OTP verified on the frontend (Firebase).
     */
    @PostMapping("/phone")
    public ResponseEntity<?> phoneLogin(@RequestBody Map<String, String> payload) {
        String phone = payload.get("phone");
        String name = payload.get("name");

        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number is required"));
        }

        User user = userRepository.findFirstByPhone(phone).orElseGet(() -> {
            // Create new user if not exists
            return User.builder()
                    .phone(phone)
                    .name(name != null && !name.isBlank() ? name : "Dear Customer")
                    .role("user")
                    .build();
        });

        // Update name if it was a default one and a new one is provided
        if (name != null && !name.isBlank() && isDefaultName(user.getName())) {
            user.setName(name);
        }
        
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    /**
     * Get details of the currently authenticated user session.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader(value="Authorization", required=false) String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }
        
        try {
            String jwt = token.substring(7);
            if (jwtUtils.validateToken(jwt)) {
                String phone = jwtUtils.getUsernameFromToken(jwt);
                return userRepository.findFirstByPhone(phone)
                        .map(user -> ResponseEntity.ok(user))
                        .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User no longer exists")));
            }
        } catch (Exception e) {
            // Ignore and fall through to 401
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Session expired or invalid"));
    }

    private boolean isDefaultName(String name) {
        return name == null || name.isBlank() || "Dear Customer".equals(name);
    }

    private ResponseEntity<?> buildAuthResponse(User user) {
        String token = jwtUtils.generateToken(user.getPhone(), user.getRole(), user.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("user", user);
        
        return ResponseEntity.ok(response);
    }
}
