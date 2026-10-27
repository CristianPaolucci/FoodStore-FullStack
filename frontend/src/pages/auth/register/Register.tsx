import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ChefHat } from "lucide-react";
import { fetchUsuarios } from "@/utils/api";
import { setSession } from "@/utils/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", apellido: "", mail: "", celular: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail)) {
      setError("Email inválido.");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const users = await fetchUsuarios();
      if (users.some((u) => u.mail.toLowerCase() === form.mail.toLowerCase())) {
        setError("Ese email ya está registrado.");
        setLoading(false);
        return;
      }
      const nuevo = {
        id: Date.now(),
        nombre: form.nombre,
        apellido: form.apellido,
        mail: form.mail,
        celular: form.celular,
        rol: "USUARIO" as const,
      };
      setSession(nuevo);
      navigate({ to: "/store" });
    } catch {
      setError("Error al registrar.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link to="/login" className="mb-8 inline-flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ChefHat className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold">Food Store</span>
        </Link>
        <div className="card-surface p-8">
          <h1 className="font-display text-3xl font-semibold">Crear cuenta</h1>
          <p className="mt-2 text-sm text-muted-foreground">Completá tus datos para empezar a pedir.</p>

          <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nombre</label>
              <input className="input-field" value={form.nombre} onChange={onChange("nombre")} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Apellido</label>
              <input className="input-field" value={form.apellido} onChange={onChange("apellido")} required />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <input type="email" className="input-field" value={form.mail} onChange={onChange("mail")} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Celular</label>
              <input className="input-field" value={form.celular} onChange={onChange("celular")} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Contraseña</label>
              <input
                type="password"
                className="input-field"
                value={form.password}
                onChange={onChange("password")}
                required
                minLength={6}
              />
            </div>
            {error && (
              <div className="sm:col-span-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="sm:col-span-2">
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Creando…" : "Crear cuenta"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            ¿Ya tenés cuenta?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
