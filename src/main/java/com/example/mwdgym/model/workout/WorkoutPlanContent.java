package com.example.mwdgym.model.workout;

import java.util.ArrayList;
import java.util.List;

public class WorkoutPlanContent {

    private List<WarmUpSection> warmUp = new ArrayList<>();
    private List<DayBlock> days = new ArrayList<>();

    public List<WarmUpSection> getWarmUp() {
        return warmUp;
    }

    public void setWarmUp(List<WarmUpSection> warmUp) {
        this.warmUp = warmUp != null ? warmUp : new ArrayList<>();
    }

    public List<DayBlock> getDays() {
        return days;
    }

    public void setDays(List<DayBlock> days) {
        this.days = days != null ? days : new ArrayList<>();
    }
}
