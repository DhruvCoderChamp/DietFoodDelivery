
package com.mymorning.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String phone;
    
    private String name;
    
    @Column(unique = true)
    private String email;
    
    private String role = "user";
}
