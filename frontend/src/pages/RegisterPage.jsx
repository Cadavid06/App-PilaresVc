import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { signUp, errors: registerErrors } = useAuth();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    const success = await signUp(data);
    if (success) navigate("/users");
  });

  return (
    <div className="relative min-h-screen flex justify-center items-center overflow-auto py-12">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-zinc-800/80 border border-zinc-700/50 mx-5">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-red-500/10 rounded-full mb-3">
            <UserPlus className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Crear usuario</h1>
          <p className="text-gray-400 text-sm mt-1">Registra un nuevo admin o entrenador</p>
        </div>

        {registerErrors && registerErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            {registerErrors.map((error, i) => (
              <p key={i} className="text-red-400 text-sm">{error}</p>
            ))}
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Rol</label>
            <select
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
              {...register("role")}
              defaultValue="entrenador"
            >
              <option value="entrenador" className="bg-zinc-800">Entrenador</option>
              <option value="admin" className="bg-zinc-800">Admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              El entrenador solo puede ver, pagar y condonar deudas.
            </p>
          </div>

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
              {...register("password", {
                required: "La contraseña es obligatoria",
              })}
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
            Crear usuario
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link to="/users" className="text-red-400 hover:text-red-300 transition-colors">
            Volver a usuarios
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;