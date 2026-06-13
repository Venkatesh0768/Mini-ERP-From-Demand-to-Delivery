package org.odoo.backend.purchase.service.impl;


import lombok.RequiredArgsConstructor;
import org.odoo.backend.product.model.Product;
import org.odoo.backend.product.repositories.ProductRepository;
import org.odoo.backend.purchase.dto.*;
import org.odoo.backend.purchase.model.*;
import org.odoo.backend.purchase.repositories.PurchaseOrderRepository;
import org.odoo.backend.purchase.service.PurchaseOrderService;
import org.odoo.backend.vendor.model.Vendor;
import org.odoo.backend.vendor.repositories.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PurchaseOrderServiceImpl
        implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;

    @Override
    public PurchaseOrderResponse createPurchaseOrder(
            CreatePurchaseOrderRequest request) {

        Vendor vendor =
                vendorRepository.findById(
                                request.getVendorId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"));

        PurchaseOrder purchaseOrder =
                PurchaseOrder.builder()
                        .orderNumber(generateOrderNumber())
                        .vendor(vendor)
                        .status(PurchaseOrderStatus.DRAFT)
                        .items(new ArrayList<>())
                        .build();

        List<PurchaseOrderItem> items =
                new ArrayList<>();

        for (PurchaseOrderItemRequest itemRequest :
                request.getItems()) {

            Product product =
                    productRepository.findById(
                                    itemRequest.getProductId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Product not found"));

            BigDecimal totalCost =
                    product.getCostPrice()
                            .multiply(itemRequest.getQuantity());

            PurchaseOrderItem item =
                    PurchaseOrderItem.builder()
                            .purchaseOrder(purchaseOrder)
                            .product(product)
                            .orderedQty(
                                    itemRequest.getQuantity())
                            .unitCost(
                                    product.getCostPrice())
                            .totalCost(totalCost)
                            .build();

            items.add(item);
        }

        purchaseOrder.setItems(items);

        PurchaseOrder saved =
                purchaseOrderRepository.save(
                        purchaseOrder);

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrder(
            UUID orderId) {

        PurchaseOrder order =
                purchaseOrderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Order not found"));

        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse>
    getAllPurchaseOrders() {

        return purchaseOrderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public PurchaseOrderResponse confirmOrder(
            UUID orderId) {

        PurchaseOrder order =
                purchaseOrderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Order not found"));

        if (order.getStatus()
                != PurchaseOrderStatus.DRAFT) {

            throw new RuntimeException(
                    "Only DRAFT orders can be confirmed");
        }

        order.setStatus(
                PurchaseOrderStatus.CONFIRMED);

        return mapToResponse(
                purchaseOrderRepository.save(order));
    }

    @Override
    public PurchaseOrderResponse receiveOrder(
            UUID orderId) {

        PurchaseOrder order =
                purchaseOrderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Order not found"));

        if (order.getStatus()
                != PurchaseOrderStatus.CONFIRMED) {

            throw new RuntimeException(
                    "Order must be CONFIRMED first");
        }

        for (PurchaseOrderItem item :
                order.getItems()) {

            Product product =
                    item.getProduct();

            product.setOnHandQty(
                    product.getOnHandQty()
                            .add(item.getOrderedQty()));

            productRepository.save(product);

            item.setReceivedQty(
                    item.getOrderedQty());
        }

        order.setStatus(
                PurchaseOrderStatus.RECEIVED);

        return mapToResponse(
                purchaseOrderRepository.save(order));
    }

    @Override
    public PurchaseOrderResponse cancelOrder(
            UUID orderId) {

        PurchaseOrder order =
                purchaseOrderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Order not found"));

        order.setStatus(
                PurchaseOrderStatus.CANCELLED);

        return mapToResponse(
                purchaseOrderRepository.save(order));
    }

    private String generateOrderNumber() {

        return "PO-" +
                System.currentTimeMillis();
    }

    private PurchaseOrderResponse
    mapToResponse(PurchaseOrder order) {

        return PurchaseOrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .vendorId(order.getVendor().getId())
                .vendorName(order.getVendor().getName())
                .status(order.getStatus())
                .items(
                        order.getItems()
                                .stream()
                                .map(item ->
                                        PurchaseOrderItemResponse
                                                .builder()
                                                .productId(
                                                        item.getProduct().getId())
                                                .productName(
                                                        item.getProduct().getName())
                                                .orderedQty(
                                                        item.getOrderedQty())
                                                .receivedQty(
                                                        item.getReceivedQty())
                                                .unitCost(
                                                        item.getUnitCost())
                                                .totalCost(
                                                        item.getTotalCost())
                                                .build())
                                .toList())
                .build();
    }
}