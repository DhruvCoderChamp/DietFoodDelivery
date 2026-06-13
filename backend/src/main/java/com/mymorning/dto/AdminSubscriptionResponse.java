package com.mymorning.dto;

import com.mymorning.model.Subscription;
import lombok.Data;

import java.util.Date;

@Data
public class AdminSubscriptionResponse {
    private Long id;
    private Long userId;
    private String customerName;
    private String phone;
    private String planType;
    private String status;
    private String deliverySlot;
    private String deliveryArea;
    private String address;
    private String mealsJson;
    private Date startDate;
    private int remainingDays;

    public static AdminSubscriptionResponse from(Subscription subscription) {
        AdminSubscriptionResponse response = new AdminSubscriptionResponse();
        response.setId(subscription.getId());
        response.setUserId(subscription.getUserId());
        response.setPlanType(subscription.getPlanType());
        response.setStatus(subscription.getStatus());
        response.setDeliverySlot(subscription.getDeliverySlot());
        response.setDeliveryArea(subscription.getDeliveryArea());
        response.setAddress(subscription.getAddress());
        response.setMealsJson(subscription.getMealsJson());
        response.setStartDate(subscription.getStartDate());
        response.setRemainingDays(subscription.getRemainingDays());
        return response;
    }
}
