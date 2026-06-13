package org.odoo.backend.customer.service;

import org.odoo.backend.customer.dto.*;

import java.util.List;
import java.util.UUID;

public interface CustomerService {

    CustomerResponse createCustomer(
            CreateCustomerRequest request);

    CustomerResponse getCustomer(UUID customerId);

    List<CustomerResponse> getAllCustomers();

    CustomerResponse updateCustomer(
            UUID customerId,
            UpdateCustomerRequest request);

    void deleteCustomer(UUID customerId);
}