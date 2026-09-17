package com.example.mwdgym.config;

import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${cors.allowed-origins}")
    private List<String> corsAllowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers("/h2-console/**", "/api/**"))
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/login", "/signup", "/css/**", "/js/**", "/h2-console/**", "/assets/**", "/uploads/**", "/favicon.ico").permitAll()
                        .requestMatchers("/api/auth/**", "/api/home/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/coin-shop/packages").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/shop/products", "/api/shop/products/**", "/api/shop/categories").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/plans").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/marketplace/plans", "/api/marketplace/plans/**", "/api/marketplace/trending", "/api/marketplace/latest").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/staff/**", "/api/settings/**", "/api/plans/**", "/api/logs/**").hasRole("ADMIN")
                        .requestMatchers("/api/exercises/**", "/api/workout-plans/**", "/api/diet-plans/**", "/api/foods/**").hasAnyRole("ADMIN", "TRAINER")
                        .requestMatchers("/api/members/**", "/api/payments/**", "/api/inventory/**", "/api/reports/**")
                        .hasAnyRole("ADMIN", "STAFF", "TRAINER")
                        .requestMatchers("/print/**").hasAnyRole("ADMIN", "TRAINER")
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(HttpStatus.OK.value())));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(corsAllowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public UserDetailsService userDetailsService(UserAccountRepository userRepository) {
        return username -> {
            UserAccount account = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
            return User.withUsername(account.getUsername())
                    .password(account.getPasswordHash())
                    .roles(account.getRole().name())
                    .disabled(!account.isActive())
                    .build();
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}