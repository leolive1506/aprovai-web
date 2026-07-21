import { useMyCompany } from "@/api/companies/hooks";

export function CompanyHeader() {
  const { data: company } = useMyCompany();

  if (!company) return null;

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 group-data-[collapsible=icon]:hidden">
      <span className="truncate text-xs font-medium text-muted-foreground/70">
        {company.name}
      </span>
    </div>
  );
}
