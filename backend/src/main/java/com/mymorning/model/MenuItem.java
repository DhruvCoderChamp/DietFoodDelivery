package com.mymorning.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private Double price;
    private Integer calories;
    private Integer protein;
    private String category;
    
    @Column(columnDefinition="TEXT")
    private String description;
    
    @Column(columnDefinition="TEXT")
    private String image;

    @ElementCollection
    private List<String> tags;

    // Standard Getters/Setters to guarantee server-side compatibility
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getCalories() { return calories; }
    public void setCalories(Integer calories) { this.calories = calories; }
    public Integer getProtein() { return protein; }
    public void setProtein(Integer protein) { this.protein = protein; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
