package com.mymorning.controller;

import com.mymorning.dto.AdminSubscriptionResponse;
import com.mymorning.model.Subscription;
import com.mymorning.model.User;
import com.mymorning.repository.SubscriptionRepository;
import com.mymorning.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminSubscriptionControllerTest {

    @Mock
    private SubscriptionRepository repository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminSubscriptionController controller;

    @Test
    void returnsSubscriptionsEnrichedWithCustomerDetails() {
        Subscription subscription = new Subscription();
        subscription.setId(3L);
        subscription.setUserId(7L);
        subscription.setDeliveryArea("Whitefield");
        User user = new User(7L, "9187532042", "Vicky", "user");
        when(repository.findAll()).thenReturn(List.of(subscription));
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));

        List<AdminSubscriptionResponse> rows = controller.getAllSubscriptions();

        assertEquals(1, rows.size());
        assertEquals("Vicky", rows.get(0).getCustomerName());
        assertEquals("9187532042", rows.get(0).getPhone());
        assertEquals("Whitefield", rows.get(0).getDeliveryArea());
    }
}
