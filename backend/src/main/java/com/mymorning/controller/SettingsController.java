package com.mymorning.controller;

import com.mymorning.model.SystemSetting;
import com.mymorning.repository.SystemSettingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class SettingsController {

    private static final int MAX_VALUE_LENGTH = 10 * 1024 * 1024;

    private final SystemSettingRepository repository;

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
        return ResponseEntity.ok(Map.of("key", saved.getSettingKey(), "value", saved.getValue()));
    }

    @DeleteMapping("/admin/settings/{key}")
    public ResponseEntity<Void> deleteSetting(@PathVariable String key) {
        repository.deleteBySettingKey(key);
        return ResponseEntity.noContent().build();
    }
}
