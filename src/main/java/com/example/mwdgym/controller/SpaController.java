package com.example.mwdgym.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {
        "/",
        "/login",
        "/signup",
        "/dashboard",
        "/members",
        "/payments",
        "/inventory",
        "/workout-plans",
        "/workout-plans/**",
        "/exercises",
        "/plans",
        "/messenger",
        "/report",
        "/staff",
        "/settings",
        "/profile",
        "/calculator",
        "/timer",
        "/logs",
        "/marketplace",
        "/marketplace/**",
        "/trainer-plans",
        "/trainer-refunds",
        "/coin-shop",
        "/shop",
        "/shop/**",
        "/admin/marketplace",
        "/my-purchases"
    })
    public String forwardSpa() {
        return "forward:/index.html";
    }
}
