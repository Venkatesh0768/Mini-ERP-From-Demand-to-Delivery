package org.odoo.backend.customer.service.impl;

import lombok.RequiredArgsConstructor;
import org.odoo.backend.common.exception.CustomerNotFoundException;
import org.odoo.backend.customer.dto.*;

import org.odoo.backend.customer.model.Customer;
import org.odoo.backend.customer.repositories.CustomerRepository;
import org.odoo.backend.customer.service.CustomerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final org.odoo.backend.audit.service.AuditService auditService;

    @Override
    @CacheEvict(value = "customers", allEntries = true)
    public CustomerResponse createCustomer(CreateCustomerRequest request) {

        Customer customer = Customer.builder()
                .customerCode(generateCustomerCode())
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .build();

        Customer saved =
                customerRepository.save(customer);
        auditService.log(org.odoo.backend.audit.model.AuditAction.CREATE, org.odoo.backend.audit.model.AuditEntityType.CUSTOMER, saved.getId().toString(), saved.getName(), "Created Customer " + saved.getName());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "customers", key = "#customerId")
    public CustomerResponse getCustomer(UUID customerId) {

        Customer customer =
                customerRepository.findById(customerId)
                        .orElseThrow(() ->
                                new CustomerNotFoundException(
                                        "Customer not found"));

        return mapToResponse(customer);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "customers")
    public List<CustomerResponse> getAllCustomers() {

        return customerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @CacheEvict(value = "customers", allEntries = true)
    public CustomerResponse updateCustomer(
            UUID customerId,
            UpdateCustomerRequest request) {

        Customer customer =
                customerRepository.findById(customerId)
                        .orElseThrow(() ->
                                new CustomerNotFoundException(
                                        "Customer not found"));

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());

        Customer saved = customerRepository.save(customer);
        auditService.log(org.odoo.backend.audit.model.AuditAction.UPDATE, org.odoo.backend.audit.model.AuditEntityType.CUSTOMER, saved.getId().toString(), saved.getName(), "Updated Customer " + saved.getName());

        return mapToResponse(saved);
    }

    @Override
    @CacheEvict(value = "customers", allEntries = true)
    public void deleteCustomer(UUID customerId) {

        Customer customer =
                customerRepository.findById(customerId)
                        .orElseThrow(() ->
                                new CustomerNotFoundException(
                                        "Customer not found"));

        customerRepository.delete(customer);
        auditService.log(org.odoo.backend.audit.model.AuditAction.DELETE, org.odoo.backend.audit.model.AuditEntityType.CUSTOMER, customer.getId().toString(), customer.getName(), "Deleted Customer " + customer.getName());
    }

    private String generateCustomerCode() {
        return "CUS-" + System.currentTimeMillis();
    }

    private CustomerResponse mapToResponse(
            Customer customer) {

        return CustomerResponse.builder()
                .id(customer.getId())
                .customerCode(customer.getCustomerCode())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .build();
    }
}