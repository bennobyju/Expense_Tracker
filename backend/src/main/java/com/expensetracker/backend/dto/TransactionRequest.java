package com.expensetracker.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionRequest {
    private BigDecimal amount;
    private String type; // INCOME or EXPENSE
    private LocalDate transactionDate;
    private String description;
    private Long userId;
    private Long categoryId;

    public TransactionRequest() {}

    public BigDecimal getAmount() {
        return amount;
    }
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }
    public LocalDate getTransactionDate() {
        return transactionDate;
    }
    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    public Long getCategoryId() {
        return categoryId;
    }
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}