package org.odoo.backend.auth.config.seeders;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.odoo.backend.audit.model.AuditAction;
import org.odoo.backend.audit.model.AuditEntityType;
import org.odoo.backend.audit.model.AuditLog;
import org.odoo.backend.audit.repositories.AuditLogRepository;
import org.odoo.backend.auth.model.User;
import org.odoo.backend.auth.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditLogSeeder {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void seed() {
        User owner = getUser("owner@erp.com");
        User admin = getUser("admin@erp.com");
        User sales = getUser("sales1@erp.com");
        User purchase = getUser("purchase1@erp.com");
        User manufacturing = getUser("mfg1@erp.com");
        User inventory = getUser("inventory1@erp.com");

        Set<String> existingKeys = new HashSet<>();
        for (AuditLog existingLog : auditLogRepository.findAll()) {
            existingKeys.add(fingerprint(existingLog.getUserEmail(), existingLog.getAction(), existingLog.getEntityType(),
                    existingLog.getEntityName(), existingLog.getDescription()));
        }

        List<AuditLog> logs = new ArrayList<>();
        int inserted = 0;
        int alreadyPresent = 0;

        if (addIfMissing(logs, existingKeys, owner, AuditAction.LOGIN, AuditEntityType.USER, "owner@erp.com", "Business owner login")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, admin, AuditAction.CREATE, AuditEntityType.USER, "sales1@erp.com", "Sales user created")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, admin, AuditAction.CREATE, AuditEntityType.USER, "purchase1@erp.com", "Purchase user created")) inserted++; else alreadyPresent++;

        if (addIfMissing(logs, existingKeys, purchase, AuditAction.CREATE, AuditEntityType.VENDOR, "V001", "Vendor profile created")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, purchase, AuditAction.UPDATE, AuditEntityType.VENDOR, "V014", "Vendor contact updated")) inserted++; else alreadyPresent++;

        if (addIfMissing(logs, existingKeys, sales, AuditAction.CREATE, AuditEntityType.CUSTOMER, "C001", "Customer profile created")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, sales, AuditAction.UPDATE, AuditEntityType.CUSTOMER, "C002", "Customer address updated")) inserted++; else alreadyPresent++;

        if (addIfMissing(logs, existingKeys, admin, AuditAction.CREATE, AuditEntityType.PRODUCT, "FG001", "Product created")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, admin, AuditAction.UPDATE, AuditEntityType.PRODUCT, "RM003", "Product reorder levels updated")) inserted++; else alreadyPresent++;

        if (addIfMissing(logs, existingKeys, manufacturing, AuditAction.CREATE, AuditEntityType.BOM, "BOM001", "BOM created")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, manufacturing, AuditAction.APPROVE, AuditEntityType.BOM, "BOM002", "BOM approved")) inserted++; else alreadyPresent++;

        if (addIfMissing(logs, existingKeys, purchase, AuditAction.CREATE, AuditEntityType.PURCHASE_ORDER, "PO-2026-0001", "Purchase order drafted")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, purchase, AuditAction.APPROVE, AuditEntityType.PURCHASE_ORDER, "PO-2026-0002", "Purchase order confirmed")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, purchase, AuditAction.RECEIVE, AuditEntityType.PURCHASE_ORDER, "PO-2026-0003", "Goods received")) inserted++; else alreadyPresent++;

        if (addIfMissing(logs, existingKeys, sales, AuditAction.CREATE, AuditEntityType.SALES_ORDER, "SO-2026-0001", "Sales order drafted")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, sales, AuditAction.APPROVE, AuditEntityType.SALES_ORDER, "SO-2026-0002", "Sales order confirmed")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, sales, AuditAction.COMPLETE, AuditEntityType.SALES_ORDER, "SO-2026-0003", "Sales order delivered")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, sales, AuditAction.CANCEL, AuditEntityType.SALES_ORDER, "SO-2026-0004", "Sales order cancelled")) inserted++; else alreadyPresent++;

        if (addIfMissing(logs, existingKeys, manufacturing, AuditAction.CREATE, AuditEntityType.MANUFACTURING_ORDER, "MO-2026-0001", "Manufacturing order drafted")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, manufacturing, AuditAction.APPROVE, AuditEntityType.MANUFACTURING_ORDER, "MO-2026-0002", "Manufacturing order confirmed")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, manufacturing, AuditAction.COMPLETE, AuditEntityType.MANUFACTURING_ORDER, "MO-2026-0004", "Manufacturing completed")) inserted++; else alreadyPresent++;

        if (addIfMissing(logs, existingKeys, inventory, AuditAction.CREATE, AuditEntityType.STOCK_ADJUSTMENT, "ADJ-2026-0001", "Stock adjustment created")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, inventory, AuditAction.UPDATE, AuditEntityType.INVENTORY, "RM003", "Inventory corrected after count")) inserted++; else alreadyPresent++;
        if (addIfMissing(logs, existingKeys, inventory, AuditAction.UPDATE, AuditEntityType.INVENTORY, "FG002", "Damaged goods deduction")) inserted++; else alreadyPresent++;

        if (addIfMissing(logs, existingKeys, owner, AuditAction.LOGOUT, AuditEntityType.USER, "owner@erp.com", "Business owner logout")) inserted++; else alreadyPresent++;

        if (!logs.isEmpty()) {
            auditLogRepository.saveAll(logs);
        }
        log.info("Audit-log seed completed. Inserted: {}, already present: {}.", inserted, alreadyPresent);
    }

    private AuditLog log(User user, AuditAction action, AuditEntityType entityType,
                         String entityName, String description) {
        AuditLog log = new AuditLog();
        log.setUserId(user.getId());
        log.setUserEmail(user.getEmail());
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(UUID.randomUUID().toString());
        log.setEntityName(entityName);
        log.setDescription(description);
        log.setIpAddress("127.0.0.1");
        return log;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found: " + email));
    }

    private boolean addIfMissing(List<AuditLog> logs, Set<String> existingKeys, User user, AuditAction action,
                                 AuditEntityType entityType, String entityName, String description) {
        String key = fingerprint(user.getEmail(), action, entityType, entityName, description);
        if (existingKeys.contains(key)) {
            return false;
        }
        logs.add(log(user, action, entityType, entityName, description));
        existingKeys.add(key);
        return true;
    }

    private String fingerprint(String userEmail, AuditAction action, AuditEntityType entityType,
                               String entityName, String description) {
        return userEmail + "|" + action + "|" + entityType + "|" + entityName + "|" + description;
    }
}
