
package com.mymorning;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class MyMorningApplication implements CommandLineRunner {

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

    @Override
    public void run(String... args) throws Exception {
        try {
            // Initialize workbook if it doesn't exist in the database
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM system_settings WHERE setting_key = 'excel_workbook';", 
                Integer.class
            );
            if (count == null || count == 0) {
                String defaultWorkbookJson = "{\"settings\":{\"breakfast\":[\"Poha\",\"Idli Sambhar\",\"Oatmeal Bowl\",\"Scrambled Eggs\",\"Upma\",\"Pancake\"],\"lunch\":[\"Paneer Bhurji Thali\",\"Chicken Salad Bowl\",\"Dal Khichdi\",\"Veg Pulav Thali\",\"Egg Curry Rice\",\"Fish Meal\"],\"dinner\":[\"Quinoa Salad\",\"Roti Curry Set\",\"Grilled Chicken Bowl\",\"Keto Salad\",\"Light Soup\",\"Fruit Bowl\"]},\"customers\":[{\"id\":\"CUST-001\",\"name\":\"Dhruv Sharma\",\"phone\":\"9187532042\",\"address\":\"Flat 302, Green Glen Layout, Bangalore\"},{\"id\":\"CUST-002\",\"name\":\"Aishwarya Sen\",\"phone\":\"9876543210\",\"address\":\"Villa 15, Brookefield, Bangalore\"},{\"id\":\"CUST-003\",\"name\":\"Sandeep Jha\",\"phone\":\"9988776655\",\"address\":\"AECS Layout, Whitefield, Bangalore\"}],\"subscriptions\":[{\"subscriptionId\":\"SUB-001\",\"customerId\":\"CUST-001\",\"planDays\":14,\"startDate\":\"2026-06-20\"},{\"subscriptionId\":\"SUB-002\",\"customerId\":\"CUST-002\",\"planDays\":30,\"startDate\":\"2026-06-15\"}],\"pauseLog\":[{\"subscriptionId\":\"SUB-001\",\"startDate\":\"2026-06-22\",\"endDate\":\"2026-06-23\",\"reason\":\"Out of town\"}],\"deliverySchedule\":[{\"customerId\":\"CUST-001\",\"Mon\":\"Y\",\"Tue\":\"Y\",\"Wed\":\"Y\",\"Thu\":\"Y\",\"Fri\":\"Y\",\"Sat\":\"N\",\"Sun\":\"N\"},{\"customerId\":\"CUST-002\",\"Mon\":\"Y\",\"Tue\":\"N\",\"Wed\":\"Y\",\"Thu\":\"N\",\"Fri\":\"Y\",\"Sat\":\"N\",\"Sun\":\"N\"}],\"mealPreferences\":[{\"customerId\":\"CUST-001\",\"Mon_Breakfast\":\"Poha\",\"Mon_Lunch\":\"Paneer Bhurji Thali\",\"Mon_Dinner\":\"Quinoa Salad\",\"Tue_Breakfast\":\"Idli Sambhar\",\"Tue_Lunch\":\"Dal Khichdi\",\"Tue_Dinner\":\"Roti Curry Set\",\"Wed_Breakfast\":\"Oatmeal Bowl\",\"Wed_Lunch\":\"Chicken Salad Bowl\",\"Wed_Dinner\":\"Grilled Chicken Bowl\",\"Thu_Breakfast\":\"Scrambled Eggs\",\"Thu_Lunch\":\"Veg Pulav Thali\",\"Thu_Dinner\":\"Keto Salad\",\"Fri_Breakfast\":\"Upma\",\"Fri_Lunch\":\"Egg Curry Rice\",\"Fri_Dinner\":\"Light Soup\",\"Sat_Breakfast\":\"\",\"Sat_Lunch\":\"\",\"Sat_Dinner\":\"\",\"Sun_Breakfast\":\"\",\"Sun_Lunch\":\"\",\"Sun_Dinner\":\"\"},{\"customerId\":\"CUST-002\",\"Mon_Breakfast\":\"Pancake\",\"Mon_Lunch\":\"Chicken Salad Bowl\",\"Mon_Dinner\":\"Fruit Bowl\",\"Tue_Breakfast\":\"\",\"Tue_Lunch\":\"\",\"Tue_Dinner\":\"\",\"Wed_Breakfast\":\"Oatmeal Bowl\",\"Wed_Lunch\":\"Fish Meal\",\"Wed_Dinner\":\"Grilled Chicken Bowl\",\"Thu_Breakfast\":\"\",\"Thu_Lunch\":\"\",\"Thu_Dinner\":\"\",\"Fri_Breakfast\":\"Scrambled Eggs\",\"Fri_Lunch\":\"Egg Curry Rice\",\"Fri_Dinner\":\"Keto Salad\",\"Sat_Breakfast\":\"\",\"Sat_Lunch\":\"\",\"Sat_Dinner\":\"\",\"Sun_Breakfast\":\"\",\"Sun_Lunch\":\"\",\"Sun_Dinner\":\"\"}],\"dispatchedOrders\":{}}";
                
                jdbcTemplate.update(
                    "INSERT INTO system_settings (setting_key, value) VALUES ('excel_workbook', ?);", 
                    defaultWorkbookJson
                );
                System.out.println("---- INITIALIZATION: Populated default 7-sheet workbook in system_settings ----");
            } else {
                System.out.println("---- INITIALIZATION: Workbook already exists in system_settings; skipping ----");
            }
        } catch (Exception e) {
            System.err.println("---- INITIALIZATION ERROR: Could not populate default workbook: " + e.getMessage() + " ----");
        }

    }
}

