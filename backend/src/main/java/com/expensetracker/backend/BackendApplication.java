package com.expensetracker.backend;

import com.expensetracker.backend.entity.Category;
import com.expensetracker.backend.repository.CategoryRepository;
import com.expensetracker.backend.security.SecurityConfig;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

import java.util.List;

@SpringBootApplication
@Import(SecurityConfig.class)
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(CategoryRepository categoryRepository) {
        return args -> {
            // Check if the categories table is empty before inserting
            if (categoryRepository.count() == 0) {
                categoryRepository.saveAll(List.of(
                    // Income Categories
                    new Category("Salary", "INCOME"),
                    new Category("Freelance", "INCOME"),
                    new Category("Business", "INCOME"),
                    new Category("Other Income", "INCOME"),
                    
                    // Expense Categories
                    new Category("Food", "EXPENSE"),
                    new Category("Transportation", "EXPENSE"),
                    new Category("Housing", "EXPENSE"),
                    new Category("Utilities", "EXPENSE"),
                    new Category("Entertainment", "EXPENSE"),
                    new Category("Shopping", "EXPENSE"),
                    new Category("Other Expenses", "EXPENSE")
                ));
                System.out.println("Default categories initialized successfully!");
            }
        };
    }
}