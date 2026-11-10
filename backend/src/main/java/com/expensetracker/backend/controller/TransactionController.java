
package com.expensetracker.backend.controller;

import com.expensetracker.backend.dto.TransactionRequest;
import com.expensetracker.backend.dto.TransactionResponse;
import com.expensetracker.backend.service.TransactionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TransactionResponse>> getTransactionsByUserId(
            @PathVariable Long userId) {

        List<TransactionResponse> transactions =
                transactionService.getTransactionsForAuthenticatedUser();

        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @RequestBody TransactionRequest request) {

        TransactionResponse response =
                transactionService.createTransaction(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    

	@PutMapping("/{id}")
	public ResponseEntity<TransactionResponse> updateTransaction(
	        @PathVariable Long id,
	        @RequestBody TransactionRequest request) {
	
	    TransactionResponse response =
	            transactionService.updateTransaction(id, request);
	
	    return ResponseEntity.ok(response);
	}

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {

        transactionService.deleteTransaction(id);

        return ResponseEntity.noContent().build();
    }
}
