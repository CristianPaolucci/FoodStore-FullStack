import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChefHat, AlertCircle } from "lucide-react";
import { fetchUsuarios } from "@/utils/api";
import { setSession } from "@/utils/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!mail || !password) {
      setError("Completá email y contraseña.");
      return;
    }
    setLoading(true);
    try {
      const users = await fetchUsuarios();
      const match = users.find((u) => u.mail.toLowerCase() === mail.toLowerCase() && u.password === password);
      if (!match) {
        setError("Credenciales incorrectas.");
        setLoading(false);
        return;
      }
      const { password: _p, ...safe } = match;
      setSession(safe);
      navigate({ to: safe.rol === "ADMIN" ? "/admin" : "/store" });
    } catch {
      setError("No se pudieron cargar los usuarios.");
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-charcoal text-cream lg:block">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/90 via-charcoal/40 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ChefHat className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl font-semibold">Food Store</span>
          </div>
          <div>
            <h1 className="font-display text-5xl font-semibold leading-tight">
              Pedí lo que más te gusta,<br />sin vueltas.
            </h1>
            <p className="mt-4 max-w-md text-base text-cream/80">
              Gestioná tu menú, productos y pedidos desde una sola plataforma pensada para vos.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ChefHat className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold">Food Store</span>
          </div>
          <h2 className="font-display text-3xl font-semibold">Iniciar sesión</h2>
          <p className="mt-2 text-sm text-muted-foreground">Ingresá tus datos para continuar.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder="vos@ejemplo.com"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            ¿No tenés cuenta?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Registrate
            </Link>
          </p>

          <div className="mt-8 rounded-xl border border-border bg-secondary/60 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Usuarios de prueba</p>
            <p className="mt-1">Admin: admin@foodstore.com / admin123</p>
            <p>Cliente: juan@mail.com / user123</p>
          </div>
        </div>
      </div>
    </main>
  );
}
