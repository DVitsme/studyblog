import { LoginCard } from "@/components/admin/login-card";

// Pre-auth screen — no AdminShell. Full-viewport centered (Stage4 Login).
export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-10">
      <LoginCard />
    </div>
  );
}
