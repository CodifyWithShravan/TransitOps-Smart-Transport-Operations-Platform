package com.example.Transit_Backend.controller;

import com.example.Transit_Backend.dto.request.ExpenseRequest;
import com.example.Transit_Backend.dto.response.ExpenseResponse;
import com.example.Transit_Backend.model.enums.ExpenseCategory;
import com.example.Transit_Backend.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Expense management.
 */
@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;

    // ── CREATE ────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(@Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse response = expenseService.createExpense(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── READ ──────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAllExpenses(
            @RequestParam(required = false) ExpenseCategory category) {
        List<ExpenseResponse> expenses = (category != null)
                ? expenseService.getExpensesByCategory(category)
                : expenseService.getAllExpenses();
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(expenseService.getExpensesByVehicle(vehicleId));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(expenseService.getExpensesByTrip(tripId));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.updateExpense(id, request));
    }

    // ── DELETE ────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
