package org.odoo.backend.auth.config.seeders;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.odoo.backend.auth.model.Role;
import org.odoo.backend.auth.model.RoleType;
import org.odoo.backend.auth.model.User;
import org.odoo.backend.auth.repository.RoleRepository;
import org.odoo.backend.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserSeeder {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public void seed() {
        Map<RoleType, Role> roles = ensureRoles();

        List<User> users = List.of(
                buildUser("Rajesh", "Mehta", "owner@erp.com", "Owner@123", true,
                        Set.of(roles.get(RoleType.ROLE_BUSINESS_OWNER), roles.get(RoleType.ROLE_ADMIN), roles.get(RoleType.ROLE_USER))),
                buildUser("Priya", "Sharma", "admin@erp.com", "Admin@123", true,
                        Set.of(roles.get(RoleType.ROLE_ADMIN), roles.get(RoleType.ROLE_USER))),

                buildUser("Amit", "Verma", "sales1@erp.com", "Sales@123", true,
                        Set.of(roles.get(RoleType.ROLE_SALES_USER), roles.get(RoleType.ROLE_USER))),
                buildUser("Sneha", "Patil", "sales2@erp.com", "Sales@123", true,
                        Set.of(roles.get(RoleType.ROLE_SALES_USER), roles.get(RoleType.ROLE_USER))),
                buildUser("Karan", "Singh", "sales3@erp.com", "Sales@123", true,
                        Set.of(roles.get(RoleType.ROLE_SALES_USER), roles.get(RoleType.ROLE_USER))),
                buildUser("Divya", "Nair", "sales4@erp.com", "Sales@123", true,
                        Set.of(roles.get(RoleType.ROLE_SALES_USER), roles.get(RoleType.ROLE_USER))),
                buildUser("Rohit", "Joshi", "sales5@erp.com", "Sales@123", true,
                        Set.of(roles.get(RoleType.ROLE_SALES_USER), roles.get(RoleType.ROLE_USER))),

                buildUser("Vikram", "Iyer", "purchase1@erp.com", "Purchase@123", true,
                        Set.of(roles.get(RoleType.ROLE_PURCHASE_USER), roles.get(RoleType.ROLE_USER))),
                buildUser("Meena", "Desai", "purchase2@erp.com", "Purchase@123", true,
                        Set.of(roles.get(RoleType.ROLE_PURCHASE_USER), roles.get(RoleType.ROLE_USER))),
                buildUser("Suresh", "Pillai", "purchase3@erp.com", "Purchase@123", true,
                        Set.of(roles.get(RoleType.ROLE_PURCHASE_USER), roles.get(RoleType.ROLE_USER))),
                buildUser("Anita", "Rao", "purchase4@erp.com", "Purchase@123", true,
                        Set.of(roles.get(RoleType.ROLE_PURCHASE_USER), roles.get(RoleType.ROLE_USER))),
                buildUser("Nikhil", "Gupta", "purchase5@erp.com", "Purchase@123", true,
                        Set.of(roles.get(RoleType.ROLE_PURCHASE_USER), roles.get(RoleType.ROLE_USER))),

                buildUser("Harish", "Kumar", "mfg1@erp.com", "Mfg@123", true,
                        Set.of(roles.get(RoleType.ROLE_MANUFACTURING_USER), roles.get(RoleType.ROLE_USER))),
                buildUser("Sunita", "Bose", "mfg2@erp.com", "Mfg@123", true,
                        Set.of(roles.get(RoleType.ROLE_MANUFACTURING_USER), roles.get(RoleType.ROLE_USER))),
                buildUser("Deepak", "Tiwari", "mfg3@erp.com", "Mfg@123", true,
                        Set.of(roles.get(RoleType.ROLE_MANUFACTURING_USER), roles.get(RoleType.ROLE_USER))),
                buildUser("Kavita", "Chopra", "mfg4@erp.com", "Mfg@123", true,
                        Set.of(roles.get(RoleType.ROLE_MANUFACTURING_USER), roles.get(RoleType.ROLE_USER))),
                buildUser("Manish", "Agarwal", "mfg5@erp.com", "Mfg@123", true,
                        Set.of(roles.get(RoleType.ROLE_MANUFACTURING_USER), roles.get(RoleType.ROLE_USER))),

                buildUser("Pooja", "Bhatt", "inventory1@erp.com", "Inv@123", true,
                        Set.of(roles.get(RoleType.ROLE_INVENTORY_MANAGER), roles.get(RoleType.ROLE_USER))),
                buildUser("Sanjay", "Mishra", "inventory2@erp.com", "Inv@123", true,
                        Set.of(roles.get(RoleType.ROLE_INVENTORY_MANAGER), roles.get(RoleType.ROLE_USER))),
                buildUser("Rekha", "Pandey", "inventory3@erp.com", "Inv@123", true,
                        Set.of(roles.get(RoleType.ROLE_INVENTORY_MANAGER), roles.get(RoleType.ROLE_USER))),
                buildUser("Ajay", "Saxena", "inventory4@erp.com", "Inv@123", true,
                        Set.of(roles.get(RoleType.ROLE_INVENTORY_MANAGER), roles.get(RoleType.ROLE_USER))),
                buildUser("Neha", "Kulkarni", "inventory5@erp.com", "Inv@123", true,
                        Set.of(roles.get(RoleType.ROLE_INVENTORY_MANAGER), roles.get(RoleType.ROLE_USER)))
        );

        int inserted = 0;
        int alreadyPresent = 0;
        for (User user : users) {
            if (userRepository.existsByEmail(user.getEmail())) {
                alreadyPresent++;
                continue;
            }
            userRepository.save(user);
            inserted++;
        }

        log.info("User seed completed. Inserted: {}, already present: {}.", inserted, alreadyPresent);
    }

    private Map<RoleType, Role> ensureRoles() {
        Map<RoleType, Role> roles = new EnumMap<>(RoleType.class);
        for (RoleType roleType : RoleType.values()) {
            Role role = roleRepository.findByName(roleType).orElseGet(() ->
                    roleRepository.save(Role.builder().name(roleType).build()));
            roles.put(roleType, role);
        }
        return roles;
    }

    private User buildUser(String firstName, String lastName, String email,
                           String rawPassword, boolean enabled, Set<Role> roles) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setEnabled(enabled);
        user.setEmailVerified(true);
        user.setProvider("local");
        user.setRoles(roles);
        return user;
    }
}
