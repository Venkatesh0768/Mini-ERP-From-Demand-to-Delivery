package org.odoo.backend.bom.service;

import org.odoo.backend.bom.dto.BOMResponse;
import org.odoo.backend.bom.dto.CreateBOMRequest;

import java.util.List;
import java.util.UUID;

public interface BOMService {

    BOMResponse createBOM(CreateBOMRequest request);

    BOMResponse getBOM(UUID bomId);

    List<BOMResponse> getAllBOMs();

    void deleteBOM(UUID bomId);
}