
package com.mymorning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class MyMorningApplication {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public static void main(String[] args) {
        SpringApplication.run(MyMorningApplication.class, args);
    }

/*
    @PostConstruct
    public void init() {
        try {
            // Automatically upgrades the image column to unbounded TEXT size when Spring Boots
            jdbcTemplate.execute("ALTER TABLE menu_item ALTER COLUMN image TYPE TEXT;");
            System.out.println("---- Database image column fully upgraded for base64 limits! ----");
        } catch(Exception e) {
            // Ignore if already text type or table missing during initial create
        }
    }
*/
}
