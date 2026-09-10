import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

export type ChipItem = {
  to: string;
  label: string;
  short?: string;
  icon: LucideIcon;
  end?: boolean;
};

export function ChipNav({ items }: { items: ChipItem[] }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#08110c]/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-md md:static md:mb-8 md:rounded-2xl md:border md:pb-1">
      <div className="flex gap-1 overflow-x-auto px-2 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] md:p-1 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-center transition md:min-w-0 md:flex-none md:flex-row md:gap-2 md:px-4 md:py-2 ${
                isActive
                  ? "bg-amber-500/20 text-amber-200"
                  : "text-stone-400 hover:text-white"
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="max-w-full truncate text-[9px] leading-tight sm:text-[10px] md:text-sm md:whitespace-nowrap">
              <span className="md:hidden">{item.short ?? item.label}</span>
              <span className="hidden md:inline">{item.label}</span>
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
