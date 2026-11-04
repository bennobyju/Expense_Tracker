package com.expensetracker.backend.repository;

import com.expensetracker.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Fetch all transactions belonging to a specific user sorted by date
    List<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId);

    // Filter transactions by user and type (INCOME or EXPENSE)
    List<Transaction> findByUserIdAndTypeOrderByTransactionDateDesc(Long userId, String type);
}