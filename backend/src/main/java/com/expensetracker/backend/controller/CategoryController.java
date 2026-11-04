package com.expensetracker.backend.controller;

import com.expensetracker.backend.entity.Category;
import com.expensetracker.backend.repository.CategoryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*") // Allows React to make calls to this API
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // GET /api/categories - returns all categories
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // GET /api/categories/type/{type} - returns categories by type (INCOME or EXPENSE)
    @GetMapping("/type/{type}")
    public List<Category> getCategoriesByType(@PathVariable String type) {
        return categoryRepository.findByType(type.toUpperCase());
    }
}