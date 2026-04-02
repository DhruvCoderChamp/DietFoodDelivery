package com.mymorning.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String phone;
    
    private String name;
    
    @Column(nullable = false)
    private String role = "user";
    
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime lastLogin;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastLogin = LocalDateTime.now();
    }

    public User() {}
    public User(Long id, String phone, String name, String role) {
        this.id = id;
        this.phone = phone;
        this.name = name;
        this.role = role;
    }

    // Manual Getters/Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    // Minimal manual builder for AuthController
    public static UserBuilder builder() { return new UserBuilder(); }
    public static class UserBuilder {
        private String phone, name, role;
        private Long id;
        public UserBuilder phone(String phone) { this.phone = phone; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder role(String role) { this.role = role; return this; }
        public UserBuilder id(Long id) { this.id = id; return this; }
        public User build() { return new User(id, phone, name, role); }
    }
}
