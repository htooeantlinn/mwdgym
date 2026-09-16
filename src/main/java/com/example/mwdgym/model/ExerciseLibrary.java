package com.example.mwdgym.model;

import jakarta.persistence.*;

@Entity
@Table(name = "exercise_library")
public class ExerciseLibrary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String muscleGroup;

    private String defaultSets = "";

    private String defaultReps = "";

    private String defaultWeight = "";

    private String defaultNote = "";

    private int sortOrder = 0;

    private boolean active = true;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_by_name")
    private String createdByName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMuscleGroup() { return muscleGroup; }
    public void setMuscleGroup(String muscleGroup) { this.muscleGroup = muscleGroup; }

    public String getDefaultSets() { return defaultSets; }
    public void setDefaultSets(String defaultSets) { this.defaultSets = defaultSets; }

    public String getDefaultReps() { return defaultReps; }
    public void setDefaultReps(String defaultReps) { this.defaultReps = defaultReps; }

    public String getDefaultWeight() { return defaultWeight; }
    public void setDefaultWeight(String defaultWeight) { this.defaultWeight = defaultWeight; }

    public String getDefaultNote() { return defaultNote; }
    public void setDefaultNote(String defaultNote) { this.defaultNote = defaultNote; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
}
