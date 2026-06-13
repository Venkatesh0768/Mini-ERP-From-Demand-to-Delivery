import { Badge } from "@/components/ui/Badge";
import { roleLabel } from "@/lib/utils/roles";
import type { RoleType } from "@/types/auth.types";

type BadgeVariant = "indigo" | "amber" | "gray" | "green" | "red";

const variantMap: Record<RoleType, BadgeVariant> = {
  ROLE_ADMIN:               "indigo",
  ROLE_USER:                "gray",
  ROLE_SALES_USER:          "green",
  ROLE_PURCHASE_USER:       "amber",
  ROLE_MANUFACTURING_USER:  "amber",
  ROLE_INVENTORY_MANAGER:   "indigo",
  ROLE_BUSINESS_OWNER:      "red",
};

export function RoleBadge({ role }: { role: RoleType }) {
  return (
    <Badge variant={variantMap[role] ?? "gray"}>
      {roleLabel(role)}
    </Badge>
  );
}
