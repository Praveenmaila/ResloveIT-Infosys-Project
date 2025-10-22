package com.resolveit.service;

import com.resolveit.dto.JwtResponse;
import com.resolveit.dto.LoginRequest;
import com.resolveit.dto.MessageResponse;
import com.resolveit.dto.SignupRequest;
import com.resolveit.entity.User;
import com.resolveit.repository.UserRepository;
import com.resolveit.security.JwtUtils;
import com.resolveit.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Set<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toSet());
        
        return new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), 
                              userDetails.getEmail(), roles);
    }
    
    public MessageResponse signup(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFullName(signupRequest.getFullName());
        
        Set<String> roles = new HashSet<>();
        if (signupRequest.getRoles() != null && signupRequest.getRoles().contains("ADMIN")) {
            roles.add("ADMIN");
        } else {
            roles.add("USER");
        }
        user.setRoles(roles);
        
        userRepository.save(user);
        
        return new MessageResponse("User registered successfully!");
    }
}
