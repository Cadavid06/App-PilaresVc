import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Volleyball } from "lucide-react";

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { signIn, isAuthenticated, errors: loginErrors } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/memberships");
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit(async (data) => {
    signIn(data);
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-auto px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(220,38,38,0.18),transparent_30rem)]" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 rounded-2xl border border-red-400/25 bg-red-600 p-3.5 shadow-lg shadow-red-950/50">
            <Volleyball className="size-10 text-white" />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-red-400">Pilares VC</p>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Panel de membresías
          </h1>
          <p className="mt-2 text-sm text-zinc-400">Administra el equipo desde un solo lugar</p>
        </div>

        {loginErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            {loginErrors.map((error, i) => (
              <p key={i} className="text-red-400 text-sm">{error}</p>
            ))}
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              type="email"
              placeholder="tu@email.com"
              {...register("email", { required: "El email es obligatorio" })}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
            <input
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              type="password"
              placeholder="••••••••"
              {...register("password", { required: "La contraseña es obligatoria" })}
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-200 shadow-lg shadow-red-600/20 mt-2"
            type="submit"
          >
            Ingresar
          </button>
        </form>
      </div>
    </main>
  );
}

export default LoginPage;
