import UpdatePasswordForm from "@/components/settings/UpdatePasswordForm";

export default function SettingsPage() {
  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-10 max-w-2xl w-full shadow-lg">

      <UpdatePasswordForm />
    </div>
  );
}