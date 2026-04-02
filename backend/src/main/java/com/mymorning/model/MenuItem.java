package com.mymorning.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private Double price;
    private Integer calories;
    private Integer protein;
    private String category;
    private String badge;
    
    @Column(columnDefinition="TEXT")
    private String description;
    
    @Column(columnDefinition="TEXT")
    private String image;

    private Boolean isVeg = true;
    private Boolean isAvailable = true;
    private Integer orderIndex = 0;

    @ElementCollection
    private List<String> tags;
}
