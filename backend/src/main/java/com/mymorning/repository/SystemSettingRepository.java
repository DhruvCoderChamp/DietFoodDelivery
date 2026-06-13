package com.mymorning.repository;

import com.mymorning.model.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    Optional<SystemSetting> findBySettingKey(String settingKey);

    @Transactional
    void deleteBySettingKey(String settingKey);
}
