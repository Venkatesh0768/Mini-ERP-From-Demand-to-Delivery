package org.odoo.backend.sales.service.impl;


import lombok.RequiredArgsConstructor;
import org.odoo.backend.customer.model.Customer;
import org.odoo.backend.customer.repositories.CustomerRepository;
import org.odoo.backend.product.model.Product;
import org.odoo.backend.product.repositories.ProductRepository;
import org.odoo.backend.sales.dto.CreateSalesOrderRequest;
import org.odoo.backend.sales.dto.SalesOrderItemRequest;
import org.odoo.backend.sales.dto.SalesOrderItemResponse;
import org.odoo.backend.sales.dto.SalesOrderResponse;
import org.odoo.backend.sales.model.SalesOrder;
import org.odoo.backend.sales.model.SalesOrderItem;
import org.odoo.backend.sales.model.SalesOrderStatus;
import org.odoo.backend.sales.repositories.SalesOrderRepository;
import org.odoo.backend.sales.service.SalesOrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SalesOrderServiceImpl
        implements SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final org.odoo.backend.audit.service.AuditService auditService;

    @Override
    public SalesOrderResponse createSalesOrder(
            CreateSalesOrderRequest request) {

        Customer customer =
                customerRepository.findById(
                                request.getCustomerId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"));

        SalesOrder order = SalesOrder.builder()
                .orderNumber(generateOrderNumber())
                .customer(customer)
                .status(SalesOrderStatus.DRAFT)
                .items(new ArrayList<>())
                .build();

        List<SalesOrderItem> items = new ArrayList<>();

        for (SalesOrderItemRequest itemRequest :
                request.getItems()) {

            Product product =
                    productRepository.findById(
                                    itemRequest.getProductId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Product not found"));

            BigDecimal total =
                    product.getSalesPrice()
                            .multiply(
                                    itemRequest.getQuantity());

            SalesOrderItem item =
                    SalesOrderItem.builder()
                            .salesOrder(order)
                            .product(product)
                            .orderedQty(
                                    itemRequest.getQuantity())
                            .unitPrice(
                                    product.getSalesPrice())
                            .totalAmount(total)
                            .build();

            items.add(item);
        }

        order.setItems(items);

        SalesOrder saved =
                salesOrderRepository.save(order);

        auditService.log(
                org.odoo.backend.audit.model.AuditAction.CREATE,
                org.odoo.backend.audit.model.AuditEntityType.SALES_ORDER,
                saved.getId().toString(),
                saved.getOrderNumber(),
                "Created Sales Order " + saved.getOrderNumber()
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SalesOrderResponse getSalesOrder(UUID id) {
        SalesOrder order = salesOrderRepository.findById(id).
                orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalesOrderResponse>
    getAllSalesOrders() {

        return salesOrderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public SalesOrderResponse confirmOrder(
            UUID orderId) {

        SalesOrder order =
                salesOrderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        if (order.getStatus()
                != SalesOrderStatus.DRAFT) {

            throw new RuntimeException(
                    "Only DRAFT orders can be confirmed");
        }

        for (SalesOrderItem item :
                order.getItems()) {

            Product product =
                    item.getProduct();

            product.setReservedQty(
                    product.getReservedQty()
                            .add(item.getOrderedQty()));

            productRepository.save(product);
        }

        order.setStatus(
                SalesOrderStatus.CONFIRMED);

        SalesOrder saved = salesOrderRepository.save(order);
        auditService.log(
                org.odoo.backend.audit.model.AuditAction.APPROVE,
                org.odoo.backend.audit.model.AuditEntityType.SALES_ORDER,
                saved.getId().toString(),
                saved.getOrderNumber(),
                "Confirmed Sales Order " + saved.getOrderNumber()
        );

        return mapToResponse(saved);
    }

    @Override
    public SalesOrderResponse cancelOrder(
            UUID orderId) {

        SalesOrder order =
                salesOrderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        if (order.getStatus()
                == SalesOrderStatus.CONFIRMED) {

            for (SalesOrderItem item :
                    order.getItems()) {

                Product product = item.getProduct();

                product.setReservedQty(product.getReservedQty().subtract(item.getOrderedQty()));
                productRepository.save(product);
            }
        }

        order.setStatus(
                SalesOrderStatus.CANCELLED);

        SalesOrder saved = salesOrderRepository.save(order);
        auditService.log(
                org.odoo.backend.audit.model.AuditAction.CANCEL,
                org.odoo.backend.audit.model.AuditEntityType.SALES_ORDER,
                saved.getId().toString(),
                saved.getOrderNumber(),
                "Cancelled Sales Order " + saved.getOrderNumber()
        );

        return mapToResponse(saved);
    }

    private String generateOrderNumber() {

        return "SO-" +
                System.currentTimeMillis();
    }

    private SalesOrderResponse mapToResponse(
            SalesOrder order) {

        return SalesOrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getName())
                .status(order.getStatus())
                .items(order.getItems().stream().map(item ->
                                SalesOrderItemResponse
                                        .builder()
                                        .productId(item.getProduct().getId())
                                        .productName(item.getProduct().getName())
                                        .quantity(item.getOrderedQty())
                                        .deliveredQty(item.getDeliveredQty())
                                        .unitPrice(item.getUnitPrice())
                                        .totalAmount(item.getTotalAmount())
                                        .build()).toList())
                .build();
    }
}