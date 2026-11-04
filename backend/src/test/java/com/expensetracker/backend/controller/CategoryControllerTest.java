
package com.expensetracker.backend.controller;

import com.expensetracker.backend.repository.CategoryRepository;
import com.expensetracker.backend.security.JwtUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CategoryController.class)
@AutoConfigureMockMvc(addFilters = false)
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryRepository categoryRepository;

    @MockBean
    private JwtUtils jwtUtils;

    @Test
    void getAllCategoriesShouldReturnOk() throws Exception {
        when(categoryRepository.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));

        verify(categoryRepository).findAll();
    }

    @Test
    void getCategoriesByTypeShouldConvertTypeToUppercase()
            throws Exception {

        when(categoryRepository.findByType("EXPENSE"))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/categories/type/expense"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));

        verify(categoryRepository).findByType("EXPENSE");
    }
}
