package com.example.mwdgym;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MwdgymApplication {

	public static void main(String[] args) {
		SpringApplication.run(MwdgymApplication.class, args);
	}

}
