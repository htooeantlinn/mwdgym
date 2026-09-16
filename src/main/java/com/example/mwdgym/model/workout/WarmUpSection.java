package com.example.mwdgym.model.workout;

import java.util.ArrayList;
import java.util.List;

public class WarmUpSection {

    private String label = "";
    private List<ExerciseRow> rows = new ArrayList<>();

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label != null ? label : "";
    }

    public List<ExerciseRow> getRows() {
        return rows;
    }

    public void setRows(List<ExerciseRow> rows) {
        this.rows = rows != null ? rows : new ArrayList<>();
    }
}
