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
    <div className="relative h-screen flex justify-center items-center overflow-auto">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-zinc-800/80 border border-zinc-700/50 mx-5">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-red-500/10 rounded-full mb-3">
            <Volleyball className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Pilares Voleibol Club
          </h1>
          <p className="text-gray-400 text-sm mt-1">Inicia sesión para continuar</p>
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
    </div>
  );
}

export default LoginPage;