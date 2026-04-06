
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

    @PostConstruct
    public void cleanupDatabase() {
        try {
            // SECURITY: Ensure no phone sign-up keeps administrative privileges
            // and demote any previously accidental admins to 'user'
            jdbcTemplate.execute("UPDATE users SET role = 'user' WHERE role = 'admin';");
            System.out.println("---- SECURITY: Existing admin accounts have been demoted to 'user' ----");
        } catch (Exception e) {
            // Handle cases where the table might not exist yet during initial boot
            System.out.println("---- CLEANUP: Database table not ready yet; skipping demotion ----");
        }
    }
}
