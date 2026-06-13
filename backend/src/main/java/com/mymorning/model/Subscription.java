package com.mymorning.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Table(name = "subscriptions")
@Data
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String planType; // 7, 14, 30 days
    private String status; // ACTIVE, PAUSED
    private String deliverySlot;
    private String deliveryArea;

    @Column(columnDefinition = "TEXT")
    private String address;
    
    @Column(columnDefinition = "TEXT")
    private String mealsJson; // Storing the week's meal selection as JSON
    
    private Date startDate;
    private int remainingDays;
}
