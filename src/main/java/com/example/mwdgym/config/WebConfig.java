package com.example.mwdgym.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.CacheControl;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;
import java.util.Set;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Set<String> SPA_ROUTES = Set.of(
            "/", "/login", "/signup", "/dashboard", "/members", "/payments", "/inventory",
            "/workout-plans", "/exercises", "/plans", "/messenger", "/report", "/staff",
            "/settings", "/profile", "/calculator", "/timer", "/logs"
    );

    @Value("${cors.allowed-origins:http://localhost:8081,http://127.0.0.1:8081}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Split the comma-separated origins from configuration
        String[] origins = allowedOrigins.split(",");
        
        registry.addMapping("/api/**")
                .allowedOriginPatterns(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
        
        registry.addMapping("/auth/**")
                .allowedOriginPatterns(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
        
        registry.addMapping("/uploads/**")
                .allowedOriginPatterns(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Hashed build assets can be cached (content-addressed filenames).
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(7)).cachePublic());

        registry.addResourceHandler("/uploads/refunds/**")
                .addResourceLocations("file:uploads/refunds/");
        registry.addResourceHandler("/uploads/coin-orders/**")
                .addResourceLocations("file:uploads/coin-orders/");
        registry.addResourceHandler("/uploads/products/**")
                .addResourceLocations("file:uploads/products/");
        registry.addResourceHandler("/uploads/profile/**")
            .addResourceLocations("file:uploads/profile/");
        registry.addResourceHandler("/uploads/hero/**")
            .addResourceLocations("file:uploads/hero/");
        registry.addResourceHandler("/uploads/messenger/**")
            .addResourceLocations("file:uploads/messenger/");
    }

    @Bean
    public OncePerRequestFilter spaNoCacheFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain filterChain)
                    throws ServletException, IOException {
                String path = request.getRequestURI();
                if (SPA_ROUTES.contains(path)) {
                    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
                    response.setHeader("Pragma", "no-cache");
                    response.setHeader("Expires", "0");
                }
                filterChain.doFilter(request, response);
            }
        };
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
