package com.example.mwdgym.service;

import com.example.mwdgym.model.SystemLog;
import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.repository.SystemLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LoggingService {

    private static final Logger log = LoggerFactory.getLogger(LoggingService.class);

    private final SystemLogRepository logRepository;

    public LoggingService(SystemLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    public void info(String category, String action, UserAccount actor, String detail, HttpServletRequest request) {
        writable("INFO", category, action, actor, detail, request);
    }

    public void warn(String category, String action, UserAccount actor, String detail, HttpServletRequest request) {
        writable("WARN", category, action, actor, detail, request);
    }

    public void error(String category, String action, UserAccount actor, String detail, HttpServletRequest request) {
        writable("ERROR", category, action, actor, detail, request);
    }

    private void writable(String level, String category, String action, UserAccount actor, String detail, HttpServletRequest request) {
        try {
            SystemLog entry = new SystemLog();
            entry.setLevel(level);
            entry.setCategory(category);
            entry.setAction(action);
            entry.setActor(actor != null ? actor.getDisplayName() : "system");
            entry.setDetail(detail != null && detail.length() > 500 ? detail.substring(0, 500) : detail);
            entry.setIp(resolveIp(request));
            logRepository.save(entry);
        } catch (Exception e) {
            log.error("Failed to write system log [{}] {}", category, action, e);
        }
    }

    private String resolveIp(HttpServletRequest request) {
        if (request == null) return null;
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isBlank()) {
            int comma = ip.indexOf(',');
            return (comma > 0 ? ip.substring(0, comma) : ip).trim();
        }
        return request.getRemoteAddr();
    }
}
