
package com.mymorning.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import java.util.List;
import jakarta.persistence.ElementCollection;

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
    private String description;
    
    @Column(columnDefinition="TEXT")
    private String image;

    private Boolean isVeg = true;
    private Boolean isAvailable = true;

    @ElementCollection
    private List<String> tags;
}
