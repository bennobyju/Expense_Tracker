package com.expensetracker.backend.repository;

import com.expensetracker.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Finds categories by type (INCOME or EXPENSE)
    List<Category> findByType(String type);
}