import React from "react";
import { LuStethoscope, LuPlus, LuTrash2 } from "react-icons/lu";

export interface ClinicService {
  id: number;
  name: string;
  price: string;
}

interface ServicesPricingProps {
  services: ClinicService[];
  setServices: (services: ClinicService[]) => void;
}

export default function ServicesPricing({
  services,
  setServices,
}: ServicesPricingProps) {
  const updateService = (index: number, field: keyof ClinicService, value: string) => {
    const newSvc = [...services];
    newSvc[index] = { ...newSvc[index], [field]: value };
    setServices(newSvc);
  };

  const removeService = (index: number) => {
    const newSvc = [...services];
    newSvc.splice(index, 1);
    setServices(newSvc);
  };

  const addService = () => {
    const newId = services.length ? Math.max(...services.map((s) => s.id)) + 1 : 1;
    setServices([...services, { id: newId, name: "", price: "" }]);
  };

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-success-bg))] flex items-center justify-center text-[hsl(var(--color-success))]">
            <LuStethoscope />
          </div>
          <h2 className="text-sm font-black uppercase text-[hsl(var(--color-text))]">
            Services & Pricing
          </h2>
        </div>
        <button
          onClick={addService}
          className="text-[11px] font-bold bg-[hsl(var(--color-primary)/0.1)] hover:bg-[hsl(var(--color-primary)/0.2)] text-[hsl(var(--color-primary))] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
        >
          <LuPlus /> Add Service
        </button>
      </div>

      <div className="w-full">
        {/* Mobile View: Cards */}
        <div className="md:hidden flex flex-col gap-3 mt-2">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl p-3 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-[hsl(var(--color-text-muted))]">
                  Service Name
                </span>
                <button
                  onClick={() => removeService(index)}
                  className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] p-1 rounded-md transition-colors bg-[hsl(var(--color-danger)/0.05)] hover:bg-[hsl(var(--color-danger)/0.1)] cursor-pointer"
                >
                  <LuTrash2 className="text-[14px]" />
                </button>
              </div>
              <input
                type="text"
                value={service.name}
                onChange={(e) => updateService(index, "name", e.target.value)}
                className="bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] outline-none text-[13px] font-bold text-[hsl(var(--color-text))] w-full px-3 py-2 rounded-lg focus:border-[hsl(var(--color-primary))]"
              />
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase text-[hsl(var(--color-text-muted))]">
                  Price (EGP):
                </span>
                <input
                  type="number"
                  value={service.price}
                  onChange={(e) => updateService(index, "price", e.target.value)}
                  className="bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] outline-none text-[13px] font-bold text-[hsl(var(--color-text))] flex-1 px-3 py-2 rounded-lg focus:border-[hsl(var(--color-primary))]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto border border-[hsl(var(--color-border))] rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-[hsl(var(--color-bg-soft))] border-b border-[hsl(var(--color-border))]">
              <tr>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-[hsl(var(--color-text-muted))]">
                  Service Name
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-[hsl(var(--color-text-muted))]">
                  Price (EGP)
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-[hsl(var(--color-text-muted))] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr
                  key={service.id}
                  className="border-b border-[hsl(var(--color-border))] last:border-0 hover:bg-[hsl(var(--color-bg-soft)/0.5)]"
                >
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) =>
                        updateService(index, "name", e.target.value)
                      }
                      className="bg-transparent border-0 outline-none text-[13px] font-bold text-[hsl(var(--color-text))] w-full"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] font-medium text-[hsl(var(--color-text-muted))]">
                        EGP
                      </span>
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) =>
                          updateService(index, "price", e.target.value)
                        }
                        className="bg-transparent border-0 outline-none text-[13px] font-bold text-[hsl(var(--color-text))] w-20"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removeService(index)}
                      className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <LuTrash2 className="text-[14px]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
