import { useState, useMemo } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Tabs as TabsPrimitive } from "radix-ui";
import { PersonalInfoCard } from "./components/personal-info-card";
import { SecurityCard } from "./components/security-card";
import { useAuth } from "@/hooks/use-auth";
import { User, Building2, Monitor, MapPin } from "lucide-react";
import { UserRole } from "@/api/users/types";
import { PlanLimitBanner } from "@/components/plan-limit-banner";
import { useCabinetFeatures } from "@/hooks/use-cabinet-features";
import { useCabinetUsage } from "@/api/cabinets/hooks";
import { formatBytes } from "@/lib/utils";

const TAB_ICONS: Record<string, React.ElementType> = {
  profile: User,
  cabinet: Building2,
  location: MapPin,
  system: Monitor,
  "page-builder": Monitor,
};

export function Settings() {
  const { user, cabinet } = useAuth();
  const [active, setActive] = useState("profile");
  const { plans } = useCabinetFeatures();

  const hasStorageLimit =
    plans?.limits.maxStorageBytes !== null && plans?.limits.maxStorageBytes !== undefined
  const { data: usage } = useCabinetUsage(
    user?.isCabinetMember && hasStorageLimit ? cabinet?.slug : undefined,
  );

  const tabs = useMemo(() => [
    { value: "profile", label: "Meu Perfil" }
  ], []);

  return (
    <div className="flex-1 px-4 sm:px-8 lg:px-12 pt-8 pb-16">
      <div className="max-w-6xl mx-auto">

        <header className="mb-8">
          <h1 className="text-lg font-semibold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {user?.role === UserRole.CITIZEN ?
              'Gerencie suas informações pessoais.'
              : 'Gerencie suas informações pessoais e configurações do gabinete.'
            }
          </p>
        </header>

        <Tabs value={active} onValueChange={setActive} className="w-full">
          <div className="flex flex-col md:flex-row gap-0 md:gap-8">
            <aside className="md:w-48 shrink-0">
              <div className="md:hidden overflow-x-auto pb-px mb-6">
                <TabsPrimitive.List className="flex border-b border-border/50 min-w-max">
                  {tabs.map((tab) => {
                    const Icon = TAB_ICONS[tab.value] ?? User;
                    return (
                      <TabsPrimitive.Trigger
                        key={tab.value}
                        value={tab.value}
                        className="group relative flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-medium text-muted-foreground outline-none transition-colors data-[state=active]:text-foreground whitespace-nowrap"
                      >
                        <Icon className="size-3.5 shrink-0 stroke-[1.5]" />
                        {tab.label}
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-200 origin-left" />
                      </TabsPrimitive.Trigger>
                    );
                  })}
                </TabsPrimitive.List>
              </div>

              <TabsPrimitive.List className="hidden md:flex flex-col gap-0.5">
                {tabs.map((tab) => {
                  const Icon = TAB_ICONS[tab.value] ?? User;
                  return (
                    <TabsPrimitive.Trigger
                      key={tab.value}
                      value={tab.value}
                      className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-normal text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:font-medium data-[state=active]:text-primary"
                    >
                      <Icon className="size-4 shrink-0 stroke-[1.5]" />
                      {tab.label}
                    </TabsPrimitive.Trigger>
                  );
                })}

              </TabsPrimitive.List>
            </aside>

            <main className="flex-1 min-w-0">
              <TabsContent value="profile" className="space-y-4 outline-none focus-visible:ring-0 mt-0">
                <PersonalInfoCard />
                <SecurityCard />
              </TabsContent>

            </main>
          </div>

          <footer className="md:hidden mt-10 pt-6 border-t border-border/40 text-center">
            <p className="text-sm text-muted-foreground">
              Precisa de ajuda?{" "}
              <a href="#" className="font-semibold hover:text-primary transition-colors underline underline-offset-4">
                Suporte Central
              </a>
            </p>
          </footer>
        </Tabs>
      </div >
    </div >
  );
}
