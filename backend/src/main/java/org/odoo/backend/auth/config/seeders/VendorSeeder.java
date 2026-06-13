package org.odoo.backend.auth.config.seeders;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.odoo.backend.vendor.model.Vendor;
import org.odoo.backend.vendor.repositories.VendorRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class VendorSeeder {

    private final VendorRepository vendorRepository;

    public void seed() {
        log.info("Seeding vendors...");

        List<Vendor> vendors = List.of(
                buildVendor("V001", "ABC Wood Suppliers",      "contact@abcwood.com",        "+91-9876500001", "12, Timber Lane, Pune, Maharashtra"),
                buildVendor("V002", "Fastener Hub",            "sales@fastenerhub.com",      "+91-9876500002", "45, Industrial Area, Ahmedabad, Gujarat"),
                buildVendor("V003", "Steel World",             "info@steelworld.com",        "+91-9876500003", "78, Metal Market, Surat, Gujarat"),
                buildVendor("V004", "Furniture Mart",          "orders@furnituremart.com",   "+91-9876500004", "23, Furniture Nagar, Chennai, Tamil Nadu"),
                buildVendor("V005", "Wood King",               "supply@woodking.com",        "+91-9876500005", "56, Sawmill Road, Nagpur, Maharashtra"),
                buildVendor("V006", "Premium Materials",       "pm@premiummaterials.com",    "+91-9876500006", "11, Premium Zone, Mumbai, Maharashtra"),
                buildVendor("V007", "Global Timber",           "trade@globaltimber.com",     "+91-9876500007", "90, Export Hub, Kolkata, West Bengal"),
                buildVendor("V008", "Industrial Components",   "ic@indcomp.com",             "+91-9876500008", "34, Phase-2 MIDC, Nasik, Maharashtra"),
                buildVendor("V009", "BoltMaster India",        "sales@boltmaster.in",        "+91-9876500009", "67, Hardware Bazaar, Ludhiana, Punjab"),
                buildVendor("V010", "EcoFoam Suppliers",       "eco@ecofoam.com",            "+91-9876500010", "15, Polymer Park, Hyderabad, Telangana"),
                buildVendor("V011", "PaintCraft Co.",          "orders@paintcraft.com",      "+91-9876500011", "28, Colour Market, Delhi"),
                buildVendor("V012", "AdhesivePlus",            "info@adhesiveplus.com",      "+91-9876500012", "39, Chemical Zone, Vadodara, Gujarat"),
                buildVendor("V013", "WheelWorks Ltd.",         "supply@wheelworks.com",      "+91-9876500013", "55, Mobility Street, Coimbatore, Tamil Nadu"),
                buildVendor("V014", "MetalCraft Industries",   "mc@metalcraft.in",           "+91-9876500014", "72, Steel City, Bhilai, Chhattisgarh"),
                buildVendor("V015", "HandlePro",               "hp@handlepro.com",           "+91-9876500015", "18, Hardware Plaza, Rajkot, Gujarat"),
                buildVendor("V016", "RubberTech Supplies",     "rt@rubbertech.com",          "+91-9876500016", "41, Rubber Hub, Kochi, Kerala"),
                buildVendor("V017", "PackRight Solutions",     "pack@packright.com",         "+91-9876500017", "63, Packaging Zone, Noida, Uttar Pradesh"),
                buildVendor("V018", "TapeWorld India",         "tape@tapeworld.in",          "+91-9876500018", "26, Adhesives Park, Gurgaon, Haryana"),
                buildVendor("V019", "ScrewTech Manufacturing", "st@screwtech.com",           "+91-9876500019", "49, Precision Parts Hub, Jaipur, Rajasthan"),
                buildVendor("V020", "NutBolt Express",         "nb@nutboltexpress.com",      "+91-9876500020", "82, Fasteners Colony, Bhopal, Madhya Pradesh")
        );

        Map<String, Vendor> existingByCode = vendorRepository.findAll().stream()
                .filter(vendor -> vendor.getVendorCode() != null)
                .collect(Collectors.toMap(Vendor::getVendorCode, Function.identity(), (left, right) -> left));

        int inserted = 0;
        int alreadyPresent = 0;

        for (Vendor template : vendors) {
            Vendor existing = existingByCode.get(template.getVendorCode());
            if (existing != null) {
                alreadyPresent++;
                continue;
            }
            vendorRepository.save(template);
            inserted++;
        }

        log.info("Vendor seed completed. Inserted: {}, already present: {}.", inserted, alreadyPresent);
    }

    private Vendor buildVendor(String code, String name, String email, String phone, String address) {
        Vendor vendor = new Vendor();
        vendor.setVendorCode(code);
        vendor.setName(name);
        vendor.setEmail(email);
        vendor.setPhone(phone);
        vendor.setAddress(address);
        return vendor;
    }
}
