
package com.expensetracker.backend.service;

import com.expensetracker.backend.dto.TransactionRequest;
import com.expensetracker.backend.dto.TransactionResponse;
import com.expensetracker.backend.entity.Transaction;
import com.expensetracker.backend.entity.User;
import com.expensetracker.backend.exception.BadRequestException;
import com.expensetracker.backend.exception.ResourceNotFoundException;
import com.expensetracker.backend.exception.UnauthorizedException;
import com.expensetracker.backend.repository.CategoryRepository;
import com.expensetracker.backend.repository.TransactionRepository;
import com.expensetracker.backend.repository.UserRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private TransactionService transactionService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                1L, null, Collections.emptyList()
            )
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private User createUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setName("Test User");
        user.setEmail("test@example.com");
        return user;
    }

    private TransactionRequest createRequest(BigDecimal amount) {
        TransactionRequest request = new TransactionRequest();
        request.setAmount(amount);
        request.setType("EXPENSE");
        request.setDescription("Test transaction");
        return request;
    }

    @Test
    void createTransactionShouldSaveForAuthenticatedUser() {
        TransactionRequest request =
                createRequest(new BigDecimal("250.00"));

        User user = createUser(1L);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(transactionRepository.save(any(Transaction.class)))
                .thenAnswer(invocation -> {
                    Transaction transaction = invocation.getArgument(0);
                    transaction.setId(10L);
                    return transaction;
                });

        TransactionResponse response =
                transactionService.createTransaction(request);

        assertEquals(10L, response.getId());
        assertEquals(new BigDecimal("250.00"), response.getAmount());
        assertEquals("EXPENSE", response.getType());
        assertEquals("Test transaction", response.getDescription());

        verify(transactionRepository).save(argThat(transaction ->
                transaction.getUser() != null
                && Long.valueOf(1L).equals(
                        transaction.getUser().getId())
        ));
    }

    @Test
    void createTransactionShouldRejectZeroAmount() {
        TransactionRequest request =
                createRequest(BigDecimal.ZERO);

        assertThrows(BadRequestException.class,
                () -> transactionService.createTransaction(request));

        verify(transactionRepository, never()).save(any(Transaction.class));
        verify(userRepository, never()).findById(anyLong());
    }

    @Test
    void createTransactionShouldRejectNegativeAmount() {
        TransactionRequest request =
                createRequest(new BigDecimal("-100.00"));

        assertThrows(BadRequestException.class,
                () -> transactionService.createTransaction(request));

        verify(transactionRepository, never()).save(any(Transaction.class));
        verify(userRepository, never()).findById(anyLong());
    }

    @Test
    void createTransactionShouldRejectMissingAmount() {
        TransactionRequest request = createRequest(null);

        assertThrows(BadRequestException.class,
                () -> transactionService.createTransaction(request));

        verify(transactionRepository, never()).save(any(Transaction.class));
        verify(userRepository, never()).findById(anyLong());
    }

    @Test
    void createTransactionShouldFailWithoutAuthentication() {
        SecurityContextHolder.clearContext();

        TransactionRequest request =
                createRequest(new BigDecimal("100.00"));

        assertThrows(UnauthorizedException.class,
                () -> transactionService.createTransaction(request));

        verify(transactionRepository, never()).save(any(Transaction.class));
        verify(userRepository, never()).findById(anyLong());
    }

    @Test
    void createTransactionShouldFailWhenAuthenticatedUserDoesNotExist() {
        TransactionRequest request =
                createRequest(new BigDecimal("100.00"));

        when(userRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> transactionService.createTransaction(request));

        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void createTransactionShouldFailWhenCategoryDoesNotExist() {
        TransactionRequest request =
                createRequest(new BigDecimal("150.00"));
        request.setCategoryId(99L);

        User user = createUser(1L);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(categoryRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> transactionService.createTransaction(request));

        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void getTransactionsShouldUseAuthenticatedUserId() {
        when(transactionRepository
                .findByUserIdOrderByTransactionDateDesc(1L))
                .thenReturn(Collections.emptyList());

        List<TransactionResponse> result =
                transactionService.getTransactionsForAuthenticatedUser();

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(transactionRepository)
                .findByUserIdOrderByTransactionDateDesc(1L);
    }

    @Test
    void getTransactionsShouldReturnEmptyListWhenNoTransactionsExist() {
        when(transactionRepository
                .findByUserIdOrderByTransactionDateDesc(1L))
                .thenReturn(Collections.emptyList());

        List<TransactionResponse> result =
                transactionService.getTransactionsForAuthenticatedUser();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getTransactionsShouldReturnExistingTransactions() {
        Transaction transaction = new Transaction();
        transaction.setId(10L);
        transaction.setAmount(new BigDecimal("250.00"));
        transaction.setDescription("Groceries");
        transaction.setType("EXPENSE");

        when(transactionRepository
                .findByUserIdOrderByTransactionDateDesc(1L))
                .thenReturn(List.of(transaction));

        List<TransactionResponse> result =
                transactionService.getTransactionsForAuthenticatedUser();

        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getId());
        assertEquals(new BigDecimal("250.00"), result.get(0).getAmount());
        assertEquals("Groceries", result.get(0).getDescription());

        verify(transactionRepository)
                .findByUserIdOrderByTransactionDateDesc(1L);
    }

    @Test
    void deleteTransactionShouldRejectAnotherUsersTransaction() {
        User anotherUser = createUser(2L);

        Transaction transaction = new Transaction();
        transaction.setId(20L);
        transaction.setUser(anotherUser);

        when(transactionRepository.findById(20L))
                .thenReturn(Optional.of(transaction));

        assertThrows(UnauthorizedException.class,
                () -> transactionService.deleteTransaction(20L));

        verify(transactionRepository, never())
                .delete(any(Transaction.class));
    }

    @Test
    void deleteTransactionShouldFailWhenTransactionDoesNotExist() {
        when(transactionRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> transactionService.deleteTransaction(99L));

        verify(transactionRepository, never())
                .delete(any(Transaction.class));
    }

    @Test
    void deleteTransactionShouldSucceedForItsOwner() {
        User owner = createUser(1L);

        Transaction transaction = new Transaction();
        transaction.setId(10L);
        transaction.setUser(owner);

        when(transactionRepository.findById(10L))
                .thenReturn(Optional.of(transaction));

        assertDoesNotThrow(
                () -> transactionService.deleteTransaction(10L));

        verify(transactionRepository).delete(transaction);
    }

    @Test
    void deleteTransactionShouldRejectTransactionWithoutOwner() {
        Transaction transaction = new Transaction();
        transaction.setId(30L);
        transaction.setUser(null);

        when(transactionRepository.findById(30L))
                .thenReturn(Optional.of(transaction));

        assertThrows(UnauthorizedException.class,
                () -> transactionService.deleteTransaction(30L));

        verify(transactionRepository, never())
                .delete(any(Transaction.class));
    }

@Test
void getTransactionsShouldFailWithoutAuthentication() {

    SecurityContextHolder.clearContext();

    assertThrows(
            UnauthorizedException.class,
            () -> transactionService.getTransactionsForAuthenticatedUser()
    );

    verify(transactionRepository, never())
            .findByUserIdOrderByTransactionDateDesc(anyLong());
	}

}
