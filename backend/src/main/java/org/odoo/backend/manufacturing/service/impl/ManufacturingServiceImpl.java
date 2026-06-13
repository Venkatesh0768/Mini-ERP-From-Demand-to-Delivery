package org.odoo.backend.manufacturing.service.impl;


import lombok.RequiredArgsConstructor;
import org.odoo.backend.bom.model.BOM;
import org.odoo.backend.bom.model.BOMComponent;
import org.odoo.backend.bom.repositories.BOMRepository;
import org.odoo.backend.manufacturing.dto.*;
import org.odoo.backend.manufacturing.model.ManufacturingOrder;
import org.odoo.backend.manufacturing.model.ManufacturingOrderItem;
import org.odoo.backend.manufacturing.model.ManufacturingOrderStatus;
import org.odoo.backend.manufacturing.repositories.ManufacturingOrderRepository;
import org.odoo.backend.manufacturing.service.ManufacturingService;
import org.odoo.backend.product.model.Product;
import org.odoo.backend.product.repositories.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ManufacturingServiceImpl implements ManufacturingService {

    private final ManufacturingOrderRepository manufacturingOrderRepository;

    private final ProductRepository productRepository;

    private final BOMRepository bomRepository;

    @Override
    public ManufacturingOrderResponse
    createManufacturingOrder(
            CreateManufacturingOrderRequest request) {

        Product finishedProduct =
                productRepository.findById(
                                request.getProductId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"));

        BOM bom = bomRepository.findByFinishedProductId(request.getProductId())
                        .orElseThrow(() -> new RuntimeException(
                                        "BOM not found"));

        ManufacturingOrder order =
                ManufacturingOrder.builder()
                        .orderNumber(
                                generateOrderNumber())
                        .product(finishedProduct)
                        .bom(bom)
                        .quantityToProduce(
                                request.getQuantityToProduce())
                        .status(
                                ManufacturingOrderStatus.DRAFT)
                        .items(new ArrayList<>())
                        .build();

        List<ManufacturingOrderItem> items =
                new ArrayList<>();

        for (BOMComponent component :
                bom.getComponents()) {

            BigDecimal requiredQty =
                    component.getRequiredQuantity()
                            .multiply(
                                    request.getQuantityToProduce());

            ManufacturingOrderItem item =
                    ManufacturingOrderItem.builder()
                            .manufacturingOrder(order)
                            .componentProduct(
                                    component.getComponentProduct())
                            .requiredQuantity(requiredQty)
                            .build();

            items.add(item);
        }

        order.setItems(items);

        ManufacturingOrder saved =
                manufacturingOrderRepository.save(order);

        return mapToResponse(saved);
    }


    @Override
    @Transactional(readOnly = true)
    public ManufacturingOrderResponse
    getManufacturingOrder(UUID id) {

        ManufacturingOrder order =
                manufacturingOrderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Manufacturing Order not found"));

        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ManufacturingOrderResponse>
    getAllManufacturingOrders() {

        return manufacturingOrderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ManufacturingOrderResponse
    confirmOrder(UUID orderId) {

        ManufacturingOrder order =
                manufacturingOrderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "MO not found"));

        order.setStatus(
                ManufacturingOrderStatus.CONFIRMED);

        return mapToResponse(
                manufacturingOrderRepository.save(order));
    }

    @Override
    public ManufacturingOrderResponse
    startProduction(UUID orderId) {

        ManufacturingOrder order =
                manufacturingOrderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "MO not found"));

        order.setStatus(
                ManufacturingOrderStatus.IN_PROGRESS);

        return mapToResponse(
                manufacturingOrderRepository.save(order));
    }

    @Override
    public ManufacturingOrderResponse
    completeOrder(UUID orderId) {

        ManufacturingOrder order =
                manufacturingOrderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "MO not found"));

        for (ManufacturingOrderItem item :
                order.getItems()) {

            Product component =
                    item.getComponentProduct();

            if (component.getOnHandQty()
                    .compareTo(item.getRequiredQuantity()) < 0) {

                throw new RuntimeException(
                        "Insufficient stock for product: "
                                + component.getName());
            }

            productRepository.save(component);

            item.setConsumedQuantity(
                    item.getRequiredQuantity());
        }

        Product finishedProduct =
                order.getProduct();

        finishedProduct.setOnHandQty(
                finishedProduct.getOnHandQty()
                        .add(order.getQuantityToProduce()));

        productRepository.save(finishedProduct);

        order.setStatus(
                ManufacturingOrderStatus.COMPLETED);

        return mapToResponse(
                manufacturingOrderRepository.save(order));
    }

    @Override
    public ManufacturingOrderResponse
    cancelOrder(UUID orderId) {

        ManufacturingOrder order =
                manufacturingOrderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "MO not found"));

        order.setStatus(
                ManufacturingOrderStatus.CANCELLED);

        return mapToResponse(
                manufacturingOrderRepository.save(order));
    }

    private String generateOrderNumber() {

        return "MO-" + System.currentTimeMillis();
    }

    private ManufacturingOrderResponse
    mapToResponse(ManufacturingOrder order) {

        return ManufacturingOrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .productId(order.getProduct().getId())
                .productName(order.getProduct().getName())
                .quantityToProduce(
                        order.getQuantityToProduce())
                .status(order.getStatus())
                .items(
                        order.getItems()
                                .stream()
                                .map(item ->
                                        ManufacturingOrderItemResponse
                                                .builder()
                                                .componentProductId(
                                                        item.getComponentProduct()
                                                                .getId())
                                                .componentProductName(
                                                        item.getComponentProduct()
                                                                .getName())
                                                .requiredQuantity(
                                                        item.getRequiredQuantity())
                                                .consumedQuantity(
                                                        item.getConsumedQuantity())
                                                .build())
                                .toList())
                .build();
    }

}