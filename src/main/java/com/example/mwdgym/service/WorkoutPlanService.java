package com.example.mwdgym.service;

import com.example.mwdgym.model.WorkoutPlan;
import com.example.mwdgym.model.workout.DayBlock;
import com.example.mwdgym.model.workout.DaySection;
import com.example.mwdgym.model.workout.ExerciseRow;
import com.example.mwdgym.model.workout.WarmUpSection;
import com.example.mwdgym.model.workout.WorkoutPlanContent;
import com.example.mwdgym.repository.WorkoutPlanRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class WorkoutPlanService {

    private static final String[] DEFAULT_DAYS = {
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"
    };

    private final WorkoutPlanRepository repository;
    private final ObjectMapper objectMapper;

    public WorkoutPlanService(WorkoutPlanRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public List<WorkoutPlan> getAllPlans() {
        return repository.findAllByOrderByUpdatedAtDesc();
    }

    public WorkoutPlan getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Workout plan not found: " + id));
    }

    public WorkoutPlanContent parseContent(String json) {
        if (json == null || json.isBlank()) {
            return defaultContent();
        }
        try {
            WorkoutPlanContent content = objectMapper.readValue(json, WorkoutPlanContent.class);
            normalizeContent(content);
            return content;
        } catch (JsonProcessingException e) {
            return defaultContent();
        }
    }

    public String toJson(WorkoutPlanContent content) {
        normalizeContent(content);
        try {
            return objectMapper.writeValueAsString(content);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize workout plan", e);
        }
    }

    public WorkoutPlan save(Long id, String name, String notes, String theme,
                            boolean includeWarm, String includedDays, String contentJson) {
        WorkoutPlan plan = id != null ? getById(id) : new WorkoutPlan();
        plan.setName(name != null && !name.isBlank() ? name.trim() : "Untitled Plan");
        plan.setNotes(notes != null ? notes.trim() : "");
        plan.setTheme(theme != null && !theme.isBlank() ? theme.trim() : "default");
        plan.setIncludeWarm(includeWarm);
        plan.setIncludedDays(includedDays != null ? includedDays : "");
        plan.setContentJson(toJson(parseContent(contentJson)));
        plan.setUpdatedAt(LocalDateTime.now());
        if (plan.getCreatedAt() == null) {
            plan.setCreatedAt(LocalDateTime.now());
        }
        return repository.save(plan);
    }

    public void delete(Long id) {
        repository.delete(getById(id));
    }

    public void toggleActive(Long id) {
        WorkoutPlan plan = getById(id);
        plan.setActive(!plan.isActive());
        plan.setUpdatedAt(LocalDateTime.now());
        repository.save(plan);
    }

    public WorkoutPlanContent defaultContent() {
        WorkoutPlanContent content = new WorkoutPlanContent();

        WarmUpSection warmUp = new WarmUpSection();
        warmUp.setLabel("Warm up (doing before workout)");
        warmUp.getRows().add(emptyRow());
        content.getWarmUp().add(warmUp);

        for (String day : DEFAULT_DAYS) {
            DayBlock block = new DayBlock();
            block.setDay(day);
            DaySection section = new DaySection();
            section.setLabel(defaultLabelForDay(day));
            section.getRows().add(emptyRow());
            block.getSections().add(section);
            content.getDays().add(block);
        }
        return content;
    }

    public String dayLabel(String day) {
        if (day == null || day.isBlank()) {
            return "Day";
        }
        String lower = day.toLowerCase();
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    private void normalizeContent(WorkoutPlanContent content) {
        if (content.getWarmUp() == null) {
            content.setWarmUp(new ArrayList<>());
        }
        if (content.getDays() == null) {
            content.setDays(new ArrayList<>());
        }
        for (WarmUpSection section : content.getWarmUp()) {
            if (section.getRows() == null) {
                section.setRows(new ArrayList<>());
            }
            if (section.getRows().isEmpty()) {
                section.getRows().add(emptyRow());
            }
        }
        for (DayBlock day : content.getDays()) {
            if (day.getSections() == null) {
                day.setSections(new ArrayList<>());
            }
            if (day.getSections().isEmpty()) {
                DaySection section = new DaySection();
                section.getRows().add(emptyRow());
                day.getSections().add(section);
            }
            for (DaySection section : day.getSections()) {
                if (section.getRows() == null) {
                    section.setRows(new ArrayList<>());
                }
                if (section.getRows().isEmpty()) {
                    section.getRows().add(emptyRow());
                }
            }
        }
    }

    private ExerciseRow emptyRow() {
        return new ExerciseRow();
    }

    private String defaultLabelForDay(String day) {
        return switch (day) {
            case "MONDAY" -> "Leg";
            case "TUESDAY" -> "Shoulder";
            case "WEDNESDAY" -> "Back (Lat)";
            case "THURSDAY" -> "Glutes & Hamstring (Light weight)";
            case "FRIDAY" -> "Shoulder (Heavy)";
            case "SATURDAY" -> "Hamstring Focused";
            default -> "";
        };
    }
}
