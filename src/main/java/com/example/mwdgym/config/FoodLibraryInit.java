package com.example.mwdgym.config;

import com.example.mwdgym.repository.FoodLibraryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class FoodLibraryInit implements CommandLineRunner {
    private final FoodLibraryRepository repo;
    public FoodLibraryInit(FoodLibraryRepository repo) { this.repo = repo; }

    @Override
    public void run(String... args) {
        repo.count();
    }
}
