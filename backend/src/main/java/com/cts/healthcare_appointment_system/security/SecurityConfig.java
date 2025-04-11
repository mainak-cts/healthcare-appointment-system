package com.cts.healthcare_appointment_system.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.cts.healthcare_appointment_system.services.ApiUserDetailsService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private ApiUserDetailsService apiUserDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Add CORS support
                .authorizeHttpRequests(
                        config -> config
                                .requestMatchers("/").permitAll()
                                .requestMatchers(HttpMethod.POST, "/users/register").permitAll()
                                .requestMatchers(HttpMethod.POST, "/users/login").permitAll()
                                .requestMatchers(HttpMethod.PUT, "/users/change-password").permitAll()
                                .requestMatchers("/users").authenticated()
                                .requestMatchers("/users/**").authenticated()
                                .requestMatchers(HttpMethod.POST, "/consultations").hasAuthority("DOCTOR")
                                .requestMatchers(HttpMethod.PUT, "/consultations").hasAuthority("DOCTOR")
                                .requestMatchers(HttpMethod.DELETE, "/consultations/**").hasAuthority("DOCTOR")
                                .requestMatchers("/consultations").authenticated()
                                .requestMatchers("/consultations/**").authenticated()
                                .requestMatchers(HttpMethod.PUT, "/appointments/complete/**").hasAuthority("DOCTOR")
                                .requestMatchers("/appointments").authenticated()
                                .requestMatchers("/appointments/**").authenticated()
                                .requestMatchers(HttpMethod.PUT, "/availabilities").hasAuthority("DOCTOR")
                                .requestMatchers(HttpMethod.DELETE, "/availabilities/**").hasAuthority("DOCTOR")
                                .requestMatchers(HttpMethod.POST, "/availabilities").hasAuthority("DOCTOR")
                                .requestMatchers("/availabilities").authenticated()
                                .requestMatchers("/availabilities/**").authenticated())
                .formLogin(formLogin -> formLogin.disable())
                .sessionManagement(
                        sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        http.exceptionHandling(handling -> handling
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint()));

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allowed origins (frontend)
        config.setAllowedOrigins(List.of("http://localhost:4200"));

        //Allowed HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));

        // Allowed Headers
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        //Allow credentials (for JWT authentication)
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;

    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    AuthenticationProvider authenticationProvider(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(passwordEncoder);
        provider.setUserDetailsService(apiUserDetailsService);
        return provider;
    }
}
