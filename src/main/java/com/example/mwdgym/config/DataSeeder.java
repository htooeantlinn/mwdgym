package com.example.mwdgym.config;

import com.example.mwdgym.service.GymService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final GymService gymService;

    public DataSeeder(GymService gymService) {
        this.gymService = gymService;
    }

    @Override
    public void run(String... args) {
        gymService.createSampleDataIfEmpty();
    }
}