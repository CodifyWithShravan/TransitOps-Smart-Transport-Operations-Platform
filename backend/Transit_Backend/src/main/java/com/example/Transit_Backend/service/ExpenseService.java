package com.example.Transit_Backend.service;

import com.example.Transit_Backend.dto.request.ExpenseRequest;
import com.example.Transit_Backend.dto.response.ExpenseResponse;
import com.example.Transit_Backend.exception.ResourceNotFoundException;
import com.example.Transit_Backend.model.Expense;
import com.example.Transit_Backend.model.Trip;
import com.example.Transit_Backend.model.Vehicle;
import com.example.Transit_Backend.model.enums.ExpenseCategory;
import com.example.Transit_Backend.repository.ExpenseRepository;
import com.example.Transit_Backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for Expense management.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final VehicleService vehicleService;
    private final TripRepository tripRepository;

    // ── CREATE ────────────────────────────────────────────────────────────

    public ExpenseResponse createExpense(ExpenseRequest request) {
        Vehicle vehicle = null;
        if (request.getVehicleId() != null) {
            vehicle = vehicleService.findVehicleOrThrow(request.getVehicleId());
        }

        Trip trip = null;
        if (request.getTripId() != null) {
            trip = tripRepository.findById(request.getTripId())
                    .orElseThrow(() -> new ResourceNotFoundException("Trip", request.getTripId()));
        }

        Expense expense = Expense.builder()
                .vehicle(vehicle)
                .trip(trip)
                .category(request.getCategory())
                .description(request.getDescription())
                .amount(request.getAmount())
                .date(request.getDate())
                .build();

        Expense saved = expenseRepository.save(expense);
        return mapToResponse(saved);
    }

    // ── READ ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long id) {
        Expense expense = findExpenseOrThrow(id);
        return mapToResponse(expense);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpenses() {
        return expenseRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByVehicle(Long vehicleId) {
        return expenseRepository.findByVehicleId(vehicleId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByTrip(Long tripId) {
        return expenseRepository.findByTripId(tripId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByCategory(ExpenseCategory category) {
        return expenseRepository.findByCategory(category)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── UPDATE ────────────────────────────────────────────────────────────

    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense expense = findExpenseOrThrow(id);

        Vehicle vehicle = null;
        if (request.getVehicleId() != null) {
            vehicle = vehicleService.findVehicleOrThrow(request.getVehicleId());
        }

        Trip trip = null;
        if (request.getTripId() != null) {
            trip = tripRepository.findById(request.getTripId())
                    .orElseThrow(() -> new ResourceNotFoundException("Trip", request.getTripId()));
        }

        expense.setVehicle(vehicle);
        expense.setTrip(trip);
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());

        Expense updated = expenseRepository.save(expense);
        return mapToResponse(updated);
    }

    // ── DELETE ────────────────────────────────────────────────────────────

    public void deleteExpense(Long id) {
        Expense expense = findExpenseOrThrow(id);
        expenseRepository.delete(expense);
    }

    // ── Internal helpers ─────────────────────────────────────────────────

    private Expense findExpenseOrThrow(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", id));
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .vehicleId(expense.getVehicle() != null ? expense.getVehicle().getId() : null)
                .vehicleRegistrationNumber(expense.getVehicle() != null
                        ? expense.getVehicle().getRegistrationNumber() : null)
                .tripId(expense.getTrip() != null ? expense.getTrip().getId() : null)
                .category(expense.getCategory())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .date(expense.getDate())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
}
