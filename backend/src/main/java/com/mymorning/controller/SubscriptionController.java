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
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private SubscriptionRepository repository;

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/save")
    public ResponseEntity<?> saveSubscription(@RequestBody Subscription sub) {
        // Find if user already has a subscription
        Optional<Subscription> existing = repository.findByUserId(sub.getUserId());
        Subscription savedSub;
        
        if (existing.isPresent()) {
            Subscription toUpdate = existing.get();
            toUpdate.setPlanType(sub.getPlanType());
            toUpdate.setStatus(sub.getStatus());
            toUpdate.setDeliverySlot(sub.getDeliverySlot());
            toUpdate.setDeliveryArea(sub.getDeliveryArea());
            toUpdate.setAddress(sub.getAddress());
            toUpdate.setMealsJson(sub.getMealsJson());
            toUpdate.setRemainingDays(sub.getRemainingDays());
            savedSub = repository.save(toUpdate);
        } else {
            sub.setStartDate(new Date());
            savedSub = repository.save(sub);
        }

        // Synchronize with the excel_workbook setting in system_settings
        if (savedSub.getUserId() != null) {
            userRepository.findById(savedSub.getUserId()).ifPresent(user -> {
                syncSubscriptionToWorkbook(savedSub, user);
            });
        }
        
        return ResponseEntity.ok(savedSub);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getSubscription(@PathVariable Long userId) {
        return repository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private void syncSubscriptionToWorkbook(Subscription sub, User user) {
        try {
            Optional<SystemSetting> workbookSettingOpt = systemSettingRepository.findBySettingKey("excel_workbook");
            if (workbookSettingOpt.isPresent()) {
                SystemSetting setting = workbookSettingOpt.get();
                String json = setting.getValue();
                
                Map<String, Object> workbook = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
                
                List<Map<String, Object>> customers = (List<Map<String, Object>>) workbook.computeIfAbsent("customers", k -> new ArrayList<>());
                List<Map<String, Object>> subscriptions = (List<Map<String, Object>>) workbook.computeIfAbsent("subscriptions", k -> new ArrayList<>());
                List<Map<String, Object>> deliverySchedule = (List<Map<String, Object>>) workbook.computeIfAbsent("deliverySchedule", k -> new ArrayList<>());
                List<Map<String, Object>> mealPreferences = (List<Map<String, Object>>) workbook.computeIfAbsent("mealPreferences", k -> new ArrayList<>());
                Map<String, Object> settings = (Map<String, Object>) workbook.computeIfAbsent("settings", k -> new HashMap<>());
                
                String customerId = "CUST-" + user.getId();
                String subscriptionId = "SUB-" + user.getId();
                
                // 1. Sync Customer
                Map<String, Object> targetCustomer = null;
                for (Map<String, Object> c : customers) {
                    if (customerId.equals(c.get("id"))) {
                        targetCustomer = c;
                        break;
                    }
                }
                if (targetCustomer == null) {
                    targetCustomer = new HashMap<>();
                    targetCustomer.put("id", customerId);
                    customers.add(targetCustomer);
                }
                targetCustomer.put("name", user.getName());
                targetCustomer.put("phone", user.getPhone());
                targetCustomer.put("address", sub.getAddress() != null ? sub.getAddress() : "");
                
                // 2. Sync Subscription
                Map<String, Object> targetSub = null;
                for (Map<String, Object> s : subscriptions) {
                    if (subscriptionId.equals(s.get("subscriptionId"))) {
                        targetSub = s;
                        break;
                    }
                }
                if (targetSub == null) {
                    targetSub = new HashMap<>();
                    targetSub.put("subscriptionId", subscriptionId);
                    subscriptions.add(targetSub);
                }
                targetSub.put("customerId", customerId);
                int planDays = 7;
                try {
                    planDays = Integer.parseInt(sub.getPlanType());
                } catch (Exception e) {
                    planDays = sub.getRemainingDays() > 0 ? sub.getRemainingDays() : 7;
                }
                targetSub.put("planDays", planDays);
                
                SimpleDateFormat sdfCorrect = new SimpleDateFormat("yyyy-MM-dd");
                String startDateStr = sub.getStartDate() != null ? sdfCorrect.format(sub.getStartDate()) : sdfCorrect.format(new Date());
                targetSub.put("startDate", startDateStr);
                
                // 3. Sync Meal Preferences & Delivery Schedule
                Map<String, List<String>> userMealPlan = new HashMap<>();
                if (sub.getMealsJson() != null && !sub.getMealsJson().isEmpty()) {
                    try {
                        userMealPlan = objectMapper.readValue(sub.getMealsJson(), new TypeReference<Map<String, List<String>>>() {});
                    } catch (Exception e) {
                        System.err.println("Error parsing mealsJson: " + e.getMessage());
                    }
                }
                
                List<String> breakfastMenu = (List<String>) settings.computeIfAbsent("breakfast", k -> new ArrayList<>());
                List<String> lunchMenu = (List<String>) settings.computeIfAbsent("lunch", k -> new ArrayList<>());
                List<String> dinnerMenu = (List<String>) settings.computeIfAbsent("dinner", k -> new ArrayList<>());
                
                // Sync Delivery Schedule row
                Map<String, Object> targetSchedule = null;
                for (Map<String, Object> ds : deliverySchedule) {
                    if (customerId.equals(ds.get("customerId"))) {
                        targetSchedule = ds;
                        break;
                    }
                }
                if (targetSchedule == null) {
                    targetSchedule = new HashMap<>();
                    targetSchedule.put("customerId", customerId);
                    deliverySchedule.add(targetSchedule);
                }
                
                // Sync Meal Preferences row
                Map<String, Object> targetPref = null;
                for (Map<String, Object> mp : mealPreferences) {
                    if (customerId.equals(mp.get("customerId"))) {
                        targetPref = mp;
                        break;
                    }
                }
                if (targetPref == null) {
                    targetPref = new HashMap<>();
                    targetPref.put("customerId", customerId);
                    mealPreferences.add(targetPref);
                }
                
                String[] daysOfWeek = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
                String[] dayKeys = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
                
                for (int i = 0; i < 7; i++) {
                    String dayName = daysOfWeek[i];
                    String dayKey = dayKeys[i];
                    
                    List<String> dayMeals = userMealPlan.get(dayName);
                    if (dayMeals == null) {
                        dayMeals = new ArrayList<>();
                    }
                    
                    targetSchedule.put(dayKey, dayMeals.isEmpty() ? "N" : "Y");
                    
                    String breakfast = "";
                    String lunch = "";
                    String dinner = "";
                    
                    List<String> unclassified = new ArrayList<>();
                    for (String meal : dayMeals) {
                        boolean classified = false;
                        if (breakfastMenu.contains(meal) && breakfast.isEmpty()) {
                            breakfast = meal;
                            classified = true;
                        } else if (lunchMenu.contains(meal) && lunch.isEmpty()) {
                            lunch = meal;
                            classified = true;
                        } else if (dinnerMenu.contains(meal) && dinner.isEmpty()) {
                            dinner = meal;
                            classified = true;
                        }
                        if (!classified) {
                            unclassified.add(meal);
                        }
                    }
                    
                    for (String meal : unclassified) {
                        if (breakfast.isEmpty()) {
                            breakfast = meal;
                        } else if (lunch.isEmpty()) {
                            lunch = meal;
                        } else if (dinner.isEmpty()) {
                            dinner = meal;
                        }
                    }
                    
                    targetPref.put(dayKey + "_Breakfast", breakfast);
                    targetPref.put(dayKey + "_Lunch", lunch);
                    targetPref.put(dayKey + "_Dinner", dinner);
                }
                
                setting.setValue(objectMapper.writeValueAsString(workbook));
                systemSettingRepository.save(setting);
            }
        } catch (Exception e) {
            System.err.println("Error synchronizing subscription to workbook: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
