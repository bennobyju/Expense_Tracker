package com.expensetracker.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionResponse {
    private Long id;
    private BigDecimal amount;
    private LocalDate transactionDate;
    private String description;
    private String type;
    private String categoryName;

    public TransactionResponse() {
    }

    public TransactionResponse(Long id, BigDecimal amount, LocalDate transactionDate, String description, String type, String categoryName) {
        this.id = id;
        this.amount = amount;
        this.transactionDate = transactionDate;
        this.description = description;
        this.type = type;
        this.categoryName = categoryName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
}