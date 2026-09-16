package com.example.mwdgym.config;

import com.example.mwdgym.repository.ExerciseLibraryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ExerciseLibraryInit implements CommandLineRunner {
    private final ExerciseLibraryRepository repo;
    public ExerciseLibraryInit(ExerciseLibraryRepository repo) { this.repo = repo; }
    @Override
    public void run(String... args) {
        repo.count();
    }
}
