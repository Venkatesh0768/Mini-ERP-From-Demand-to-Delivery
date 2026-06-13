package org.odoo.backend.bom.service.impl;

import lombok.RequiredArgsConstructor;
import org.odoo.backend.bom.dto.*;
import org.odoo.backend.bom.model.BOM;
import org.odoo.backend.bom.model.BOMComponent;
import org.odoo.backend.bom.repositories.BOMRepository;
import org.odoo.backend.bom.service.BOMService;
import org.odoo.backend.product.model.Product;
import org.odoo.backend.product.repositories.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BOMServiceImpl
        implements BOMService {

    private final BOMRepository bomRepository;
    private final ProductRepository productRepository;

    @Override
    public BOMResponse createBOM(
            CreateBOMRequest request) {

        if (bomRepository.existsByFinishedProductId(
                request.getFinishedProductId())) {

            throw new RuntimeException(
                    "BOM already exists for this product");
        }

        Product finishedProduct =
                productRepository.findById(
                                request.getFinishedProductId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Finished product not found"));

        BOM bom = BOM.builder()
                .bomCode(generateBomCode())
                .finishedProduct(finishedProduct)
                .quantityProduced(
                        request.getQuantityProduced())
                .components(new ArrayList<>())
                .build();

        List<BOMComponent> components =
                new ArrayList<>();

        for (BOMComponentRequest component :
                request.getComponents()) {

            Product componentProduct =
                    productRepository.findById(
                                    component.getComponentProductId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Component product not found"));

            BOMComponent bomComponent =
                    BOMComponent.builder()
                            .bom(bom)
                            .componentProduct(componentProduct)
                            .requiredQuantity(
                                    component.getRequiredQuantity())
                            .build();

            components.add(bomComponent);
        }

        bom.setComponents(components);

        BOM saved =
                bomRepository.save(bom);

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BOMResponse getBOM(UUID bomId) {

        BOM bom = bomRepository.findById(bomId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "BOM not found"));

        return mapToResponse(bom);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BOMResponse> getAllBOMs() {

        return bomRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void deleteBOM(UUID bomId) {

        BOM bom = bomRepository.findById(bomId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "BOM not found"));

        bomRepository.delete(bom);
    }

    private String generateBomCode() {

        return "BOM-" +
                System.currentTimeMillis();
    }

    private BOMResponse mapToResponse(
            BOM bom) {

        return BOMResponse.builder()
                .id(bom.getId())
                .bomCode(bom.getBomCode())
                .finishedProductId(
                        bom.getFinishedProduct().getId())
                .finishedProductName(
                        bom.getFinishedProduct().getName())
                .quantityProduced(
                        bom.getQuantityProduced())
                .components(
                        bom.getComponents()
                                .stream()
                                .map(component ->
                                        BOMComponentResponse
                                                .builder()
                                                .componentProductId(
                                                        component
                                                                .getComponentProduct()
                                                                .getId())
                                                .componentProductName(
                                                        component
                                                                .getComponentProduct()
                                                                .getName())
                                                .requiredQuantity(
                                                        component
                                                                .getRequiredQuantity())
                                                .build())
                                .toList())
                .build();
    }
}