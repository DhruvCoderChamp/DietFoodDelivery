package com.mymorning.controller;

import com.mymorning.model.Subscription;
import com.mymorning.repository.SubscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubscriptionControllerTest {

    @Mock
    private SubscriptionRepository repository;

    @InjectMocks
    private SubscriptionController controller;

    private Subscription incoming;

    @BeforeEach
    void setUp() {
        incoming = new Subscription();
        incoming.setUserId(7L);
        incoming.setPlanType("14");
        incoming.setStatus("ACTIVE");
        incoming.setDeliverySlot("7:00 AM - 8:00 AM");
        incoming.setDeliveryArea("Whitefield");
        incoming.setAddress("12 Main Road");
        incoming.setMealsJson("{\"Monday\":[\"Fruit Bowl\"]}");
        incoming.setRemainingDays(14);
    }

    @Test
    void savesLocationFieldsForNewSubscription() {
        when(repository.findByUserId(7L)).thenReturn(Optional.empty());
        when(repository.save(any(Subscription.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = controller.saveSubscription(incoming);

        Subscription saved = (Subscription) response.getBody();
        assertEquals("Whitefield", saved.getDeliveryArea());
        assertEquals("12 Main Road", saved.getAddress());
        verify(repository).save(incoming);
    }

    @Test
    void updatesLocationFieldsForExistingSubscription() {
        Subscription existing = new Subscription();
        existing.setUserId(7L);
        when(repository.findByUserId(7L)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);

        controller.saveSubscription(incoming);

        assertEquals("Whitefield", existing.getDeliveryArea());
        assertEquals("12 Main Road", existing.getAddress());
    }

}
