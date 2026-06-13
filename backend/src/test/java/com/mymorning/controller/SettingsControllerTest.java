package com.mymorning.controller;

import com.mymorning.model.SystemSetting;
import com.mymorning.repository.SystemSettingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SettingsControllerTest {

    @Mock
    private SystemSettingRepository repository;

    @InjectMocks
    private SettingsController controller;

    @Test
    void returnsNotFoundForMissingSetting() {
        when(repository.findBySettingKey("homepage_image")).thenReturn(Optional.empty());

        ResponseEntity<?> response = controller.getSetting("homepage_image");

        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    void returnsExistingSetting() {
        SystemSetting setting = new SystemSetting("homepage_image", "data:image/jpeg;base64,abc");
        when(repository.findBySettingKey("homepage_image")).thenReturn(Optional.of(setting));

        ResponseEntity<?> response = controller.getSetting("homepage_image");

        assertEquals(200, response.getStatusCode().value());
        assertEquals("data:image/jpeg;base64,abc", ((Map<?, ?>) response.getBody()).get("value"));
    }

    @Test
    void upsertsSetting() {
        when(repository.findBySettingKey("homepage_image")).thenReturn(Optional.empty());
        when(repository.save(any(SystemSetting.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = controller.saveSetting(
                "homepage_image",
                Map.of("value", "data:image/jpeg;base64,abc")
        );

        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void rejectsBlankSetting() {
        ResponseEntity<?> response = controller.saveSetting("homepage_image", Map.of("value", " "));

        assertEquals(400, response.getStatusCode().value());
    }

    @Test
    void deletesSetting() {
        ResponseEntity<?> response = controller.deleteSetting("homepage_image");

        assertEquals(204, response.getStatusCode().value());
        assertNull(response.getBody());
        verify(repository).deleteBySettingKey("homepage_image");
    }
}
