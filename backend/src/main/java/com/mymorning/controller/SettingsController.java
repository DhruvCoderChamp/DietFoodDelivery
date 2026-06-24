package com.mymorning.controller;

import com.mymorning.model.Subscription;
import com.mymorning.model.SystemSetting;
import com.mymorning.model.User;
import com.mymorning.repository.SubscriptionRepository;
import com.mymorning.repository.SystemSettingRepository;
import com.mymorning.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class SettingsController {

    private static final int MAX_VALUE_LENGTH = 10 * 1024 * 1024;

    private final SystemSettingRepository repository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public SettingsController(SystemSettingRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/settings/{key}")
    public ResponseEntity<?> getSetting(@PathVariable String key) {
        return repository.findBySettingKey(key)
                .<ResponseEntity<?>>map(setting -> ResponseEntity.ok(Map.of(
                        "key", setting.getSettingKey(),
                        "value", setting.getValue()
                )))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/admin/settings/{key}")
    public ResponseEntity<?> saveSetting(@PathVariable String key, @RequestBody Map<String, String> payload) {
        String value = payload.get("value");
        if (value == null || value.isBlank() || value.length() > MAX_VALUE_LENGTH) {
            return ResponseEntity.badRequest().body(Map.of("error", "Setting value is required and must be under 10 MB"));
        }

        SystemSetting setting = repository.findBySettingKey(key)
                .orElseGet(() -> new SystemSetting(key, value));
        setting.setValue(value);
        SystemSetting saved = repository.save(setting);

        // If we are saving the excel_workbook, propagate it to individual subscriptions
        if ("excel_workbook".equals(key)) {
            syncWorkbookToDatabase(value);
        }

        return ResponseEntity.ok(Map.of("key", saved.getSettingKey(), "value", saved.getValue()));
    }

    @DeleteMapping("/admin/settings/{key}")
    public ResponseEntity<Void> deleteSetting(@PathVariable String key) {
        repository.deleteBySettingKey(key);
        return ResponseEntity.noContent().build();
    }

    private void syncWorkbookToDatabase(String workbookJson) {
        try {
            Map<String, Object> workbook = objectMapper.readValue(workbookJson, new TypeReference<Map<String, Object>>() {});
            List<Map<String, Object>> customers = (List<Map<String, Object>>) workbook.get("customers");
            List<Map<String, Object>> subscriptions = (List<Map<String, Object>>) workbook.get("subscriptions");
            List<Map<String, Object>> deliverySchedule = (List<Map<String, Object>>) workbook.get("deliverySchedule");
            List<Map<String, Object>> mealPreferences = (List<Map<String, Object>>) workbook.get("mealPreferences");
            
            if (subscriptions == null || customers == null) {
                return;
            }
            
            // Reconstruct subscriptions for each customer in the workbook
            for (Map<String, Object> subMap : subscriptions) {
                String customerId = (String) subMap.get("customerId");
                if (customerId == null) continue;
                
                // Find customer details in customers sheet
                Map<String, Object> customerMap = null;
                for (Map<String, Object> c : customers) {
                    if (customerId.equals(c.get("id"))) {
                        customerMap = c;
                        break;
                    }
                }
                if (customerMap == null) continue;
                
                String phone = (String) customerMap.get("phone");
                String address = (String) customerMap.get("address");
                if (phone == null || phone.isBlank()) continue;
                
                // Find the corresponding User in our database
                Optional<User> userOpt = userRepository.findFirstByPhone(phone);
                if (!userOpt.isPresent()) {
                    // Skip if user does not exist in our system
                    continue;
                }
                User user = userOpt.get();
                
                // Reconstruct their meal plan from the mealPreferences sheet
                Map<String, Object> prefMap = null;
                if (mealPreferences != null) {
                    for (Map<String, Object> mp : mealPreferences) {
                        if (customerId.equals(mp.get("customerId"))) {
                            prefMap = mp;
                            break;
                        }
                    }
                }
                
                Map<String, List<String>> mealPlan = new HashMap<>();
                String[] daysOfWeek = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
                String[] dayKeys = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
                
                if (prefMap != null) {
                    for (int i = 0; i < 7; i++) {
                        String dayName = daysOfWeek[i];
                        String dayKey = dayKeys[i];
                        
                        List<String> dayMeals = new ArrayList<>();
                        String breakfast = (String) prefMap.get(dayKey + "_Breakfast");
                        String lunch = (String) prefMap.get(dayKey + "_Lunch");
                        String dinner = (String) prefMap.get(dayKey + "_Dinner");
                        
                        if (breakfast != null && !breakfast.isBlank()) dayMeals.add(breakfast);
                        if (lunch != null && !lunch.isBlank()) dayMeals.add(lunch);
                        if (dinner != null && !dinner.isBlank()) dayMeals.add(dinner);
                        
                        mealPlan.put(dayName, dayMeals);
                    }
                }
                
                String mealsJson = objectMapper.writeValueAsString(mealPlan);
                
                // Find if there is an existing subscription in the database
                Optional<Subscription> existingSubOpt = subscriptionRepository.findByUserId(user.getId());
                Subscription sub = existingSubOpt.orElseGet(() -> {
                    Subscription newSub = new Subscription();
                    newSub.setUserId(user.getId());
                    newSub.setStartDate(new Date());
                    return newSub;
                });
                
                // Update subscription details
                Object planDaysObj = subMap.get("planDays");
                String planType = planDaysObj != null ? String.valueOf(planDaysObj) : "7";
                sub.setPlanType(planType);
                sub.setRemainingDays(planDaysObj instanceof Number ? ((Number) planDaysObj).intValue() : 7);
                sub.setStatus("ACTIVE");
                sub.setAddress(address);
                sub.setMealsJson(mealsJson);
                
                // Preserve or set default delivery slot and area
                if (sub.getDeliverySlot() == null) {
                    sub.setDeliverySlot("8:00 AM - 8:30 AM");
                }
                if (sub.getDeliveryArea() == null) {
                    sub.setDeliveryArea("AECS Layout");
                }
                
                // Parse start date from workbook
                String startDateStr = (String) subMap.get("startDate");
                if (startDateStr != null && !startDateStr.isBlank()) {
                    try {
                        sub.setStartDate(new java.text.SimpleDateFormat("yyyy-MM-dd").parse(startDateStr));
                    } catch (Exception e) {
                        // Keep current start date
                    }
                }
                
                subscriptionRepository.save(sub);
            }
        } catch (Exception e) {
            System.err.println("Error synchronizing workbook to database: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
