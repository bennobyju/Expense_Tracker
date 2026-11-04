
package com.expensetracker.backend.controller;

import com.expensetracker.backend.repository.CategoryRepository;
import com.expensetracker.backend.dto.TransactionRequest;
import com.expensetracker.backend.dto.TransactionResponse;
import com.expensetracker.backend.security.JwtUtils;
import com.expensetracker.backend.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
@Import(com.expensetracker.backend.exception.GlobalExceptionHandler.class)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionService transactionService;

    @MockBean
    private CategoryRepository categoryRepository;
    
    @MockBean
    private JwtUtils jwtUtils;

    @Test
    void getTransactionsShouldReturnOk() throws Exception {
        when(transactionService.getTransactionsForAuthenticatedUser())
                .thenReturn(List.of());

        mockMvc.perform(get("/api/transactions/user/1"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));

        verify(transactionService)
                .getTransactionsForAuthenticatedUser();
    }

    @Test
    void createTransactionShouldReturnCreated() throws Exception {
        TransactionResponse transactionResponse =
                mock(TransactionResponse.class);

        when(transactionService.createTransaction(any(TransactionRequest.class)))
                .thenReturn(transactionResponse);

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isCreated());

        verify(transactionService)
                .createTransaction(any(TransactionRequest.class));
    }

    @Test
    void deleteTransactionShouldReturnNoContent() throws Exception {
        doNothing().when(transactionService).deleteTransaction(1L);

        mockMvc.perform(delete("/api/transactions/1"))
                .andExpect(status().isNoContent());

        verify(transactionService).deleteTransaction(1L);
    }
}
