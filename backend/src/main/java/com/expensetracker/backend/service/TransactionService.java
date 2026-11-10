
package com.expensetracker.backend.service;

import com.expensetracker.backend.dto.TransactionRequest;
import com.expensetracker.backend.dto.TransactionResponse;
import com.expensetracker.backend.entity.Category;
import com.expensetracker.backend.entity.Transaction;
import com.expensetracker.backend.entity.User;
import com.expensetracker.backend.exception.BadRequestException;
import com.expensetracker.backend.exception.ResourceNotFoundException;
import com.expensetracker.backend.exception.UnauthorizedException;
import com.expensetracker.backend.repository.CategoryRepository;
import com.expensetracker.backend.repository.TransactionRepository;
import com.expensetracker.backend.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private static final Logger log =
            LoggerFactory.getLogger(TransactionService.class);

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<TransactionResponse> getTransactionsForAuthenticatedUser() {
        Long authenticatedUserId = getAuthenticatedUserId();

        log.info("Fetching transactions for authenticated User ID: {}",
                authenticatedUserId);

        return transactionRepository
                .findByUserIdOrderByTransactionDateDesc(authenticatedUserId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TransactionResponse createTransaction(TransactionRequest request) {
        Long authenticatedUserId = getAuthenticatedUserId();

        log.info("Creating transaction for authenticated User ID: {}, Type: {}",
                authenticatedUserId, request.getType());

        if (request.getAmount() == null
                || request.getAmount().signum() <= 0) {
            log.warn("Rejected transaction: Invalid amount");
            throw new BadRequestException(
                    "Transaction amount must be greater than zero");
        }

        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));

        Category category = null;

        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with ID: "
                                    + request.getCategoryId()));
        }

        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setDescription(request.getDescription());
        transaction.setType(request.getType());
        transaction.setUser(user);
        transaction.setCategory(category);

        Transaction saved = transactionRepository.save(transaction);

        log.info("Transaction saved successfully with ID: {}",
                saved.getId());

        return mapToResponse(saved);
    }
    

public TransactionResponse updateTransaction(
        Long id, TransactionRequest request) {

    Long authenticatedUserId = getAuthenticatedUserId();

    log.info("Updating transaction ID: {} for User ID: {}",
            id, authenticatedUserId);

    // 1. Validate amount
    if (request.getAmount() == null
            || request.getAmount().signum() <= 0) {

        throw new BadRequestException(
                "Transaction amount must be greater than zero");
    }

    // 2. Find existing transaction
    Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                    "Transaction not found with ID: " + id));

    // 3. Check transaction ownership
    if (transaction.getUser() == null
            || !authenticatedUserId.equals(
                    transaction.getUser().getId())) {

        throw new UnauthorizedException(
                "You are not authorized to update this transaction");
    }

    // 4. Find category
    Category category = null;

    if (request.getCategoryId() != null) {
        category = categoryRepository.findById(
                request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with ID: "
                                + request.getCategoryId()));
    }

    // 5. Update transaction fields
    transaction.setAmount(request.getAmount());
    transaction.setTransactionDate(request.getTransactionDate());
    transaction.setDescription(request.getDescription());
    transaction.setType(request.getType());
    transaction.setCategory(category);

    // 6. Save changes in database
    Transaction updated = transactionRepository.save(transaction);

    log.info("Transaction ID: {} successfully updated", id);

    return mapToResponse(updated);
}


    public void deleteTransaction(Long id) {
        Long authenticatedUserId = getAuthenticatedUserId();

        log.info("Attempting to delete transaction ID: {} for User ID: {}",
                id, authenticatedUserId);

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction not found with ID: " + id));

        if (transaction.getUser() == null
                || !authenticatedUserId.equals(transaction.getUser().getId())) {
            throw new UnauthorizedException(
                    "You are not authorized to delete this transaction");
        }

        transactionRepository.delete(transaction);

        log.info("Transaction ID: {} successfully deleted", id);
    }

    private Long getAuthenticatedUserId() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof Long)) {
            throw new UnauthorizedException("Authentication required");
        }

        return (Long) authentication.getPrincipal();
    }

    private TransactionResponse mapToResponse(Transaction tx) {
        TransactionResponse res = new TransactionResponse();

        res.setId(tx.getId());
        res.setAmount(tx.getAmount());
        res.setTransactionDate(tx.getTransactionDate());
        res.setDescription(tx.getDescription());
        res.setType(tx.getType());
        res.setCategoryName(
                tx.getCategory() != null
                        ? tx.getCategory().getName()
                        : "General");

        return res;
    }
}
