package com.example.mwdgym.model.workout;

import java.util.ArrayList;
import java.util.List;

public class DayBlock {

    private String day = "MONDAY";
    private List<DaySection> sections = new ArrayList<>();

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day != null ? day : "MONDAY";
    }

    public List<DaySection> getSections() {
        return sections;
    }

    public void setSections(List<DaySection> sections) {
        this.sections = sections != null ? sections : new ArrayList<>();
    }
}
