package org.odoo.backend.auth.config.seeders;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.odoo.backend.customer.model.Customer;
import org.odoo.backend.customer.repositories.CustomerRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomerSeeder {

    private final CustomerRepository customerRepository;

    public void seed() {
        log.info("Seeding customers...");

        List<Customer> customers = List.of(
                buildCustomer("C001", "Reliance Retail Ltd.",       "procurement@relianceretail.com",   "+91-2222300001", "3rd Floor, Maker Chambers, Nariman Point, Mumbai"),
                buildCustomer("C002", "Tata Furnishings Pvt. Ltd.", "supply@tatafurnishings.com",       "+91-2222300002", "Bombay House, 24 Homi Mody Street, Mumbai"),
                buildCustomer("C003", "Infosys Limited",            "vendor@infosys.com",               "+91-8022300003", "Electronics City, Hosur Road, Bangalore"),
                buildCustomer("C004", "Wipro Limited",              "procurement@wipro.com",            "+91-8028900004", "Doddakannelli, Sarjapur Road, Bangalore"),
                buildCustomer("C005", "HCL Technologies Ltd.",      "supply.chain@hcl.com",             "+91-1204500005", "806, Siddharth, 96 Nehru Place, New Delhi"),
                buildCustomer("C006", "Tech Mahindra Ltd.",         "vendor.mgmt@techmahindra.com",     "+91-2026500006", "Gateway Building, Apollo Bunder, Mumbai"),
                buildCustomer("C007", "Larsen & Toubro Ltd.",       "purchase@larsentoubro.com",        "+91-2267500007", "L&T House, N.M. Marg, Ballard Estate, Mumbai"),
                buildCustomer("C008", "Adani Enterprises Ltd.",     "supply@adani.com",                 "+91-7922500008", "Adani House, Nr Mithakhali, Ahmedabad"),
                buildCustomer("C009", "Godrej Industries Ltd.",     "procurement@godrej.com",           "+91-2267600009", "Godrej One, Pirojshanagar, Eastern Express Hwy, Mumbai"),
                buildCustomer("C010", "Mahindra & Mahindra Ltd.",   "vendor@mahindra.com",              "+91-2224900010", "Gateway Building, Apollo Bunder, Mumbai"),
                buildCustomer("C011", "Bajaj Auto Ltd.",            "purchase@bajaj.com",               "+91-2027200011", "Mumbai-Pune Road, Akurdi, Pune"),
                buildCustomer("C012", "Birla Corporation Ltd.",     "supply@birla.com",                 "+91-3322400012", "9/1 R.N. Mukherjee Road, Kolkata"),
                buildCustomer("C013", "Ultratech Cement Ltd.",      "procurement@ultratech.com",        "+91-2266500013", "2 North Avenue, Maker Maxity BKC, Mumbai"),
                buildCustomer("C014", "Asian Paints Ltd.",          "vendor@asianpaints.com",           "+91-2267900014", "6A, Shantinagar, Santacruz East, Mumbai"),
                buildCustomer("C015", "Havells India Ltd.",         "supply@havells.com",               "+91-1204600015", "QRG Towers, Plot No.2, Sector-126, Noida"),
                buildCustomer("C016", "Pidilite Industries Ltd.",   "purchase@pidilite.com",            "+91-2262200016", "Regent Chambers, Jamnalal Bajaj Marg, Mumbai"),
                buildCustomer("C017", "Voltas Limited",             "procurement@voltas.com",           "+91-2266500017", "Voltas House-A, Dr. B.A. Rd., Chinchpokli, Mumbai"),
                buildCustomer("C018", "Blue Star Ltd.",             "vendor@bluestar.in",               "+91-2266100018", "Kasturi Buildings, Jamshedji Tata Road, Mumbai"),
                buildCustomer("C019", "Crompton Greaves Ltd.",      "supply@crompton.com",              "+91-2267200019", "CG House, 6th Floor, Dr. A.B. Rd., Worli, Mumbai"),
                buildCustomer("C020", "Siemens India Ltd.",         "purchase@siemens.co.in",           "+91-2024700020", "Siemens Tower, 4 Veer Savarkar Road, Thane West, Mumbai")
        );

        int inserted = 0;
        int alreadyPresent = 0;
        for (Customer customer : customers) {
            if (customerRepository.findByCustomerCode(customer.getCustomerCode()).isPresent()) {
                alreadyPresent++;
                continue;
            }
            customerRepository.save(customer);
            inserted++;
        }

        log.info("Customer seed completed. Inserted: {}, already present: {}.", inserted, alreadyPresent);
    }

    private Customer buildCustomer(String code, String name, String email, String phone, String address) {
        Customer c = new Customer();
        c.setCustomerCode(code);
        c.setName(name);
        c.setEmail(email);
        c.setPhone(phone);
        c.setAddress(address);
        return c;
    }
}
