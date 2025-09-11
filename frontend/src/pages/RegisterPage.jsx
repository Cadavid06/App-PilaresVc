import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import fondo4 from "/images/fondo4.jpg";

function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { signUp, isAuthenticated, errors: registerErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated);
  }, [isAuthenticated]);

  const onSubmit = handleSubmit(async (data) => {
    signUp(data);
  });

  return (
    <div
      className="relative h-screen flex justify-center items-center bg-cover bg-center overflow-auto"
      style={{ backgroundImage: `url(${fondo4})` }}
    >
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-black/30 backdrop-blur-xs border border-red-500/20 mx-5">
        <h1 className="text-3xl font-bold text-red-400 mb-6 text-center">
          Crear Cuenta
        </h1>

        {registerErrors.length > 0 && (
          <ul className="mb-4">
            {registerErrors.map((error, i) => (
              <li key={i} className="text-red-500 text-sm">
                {error}
              </li>
            ))}
          </ul>
        )}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <input
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              type="email"
              placeholder="Email"
              {...register("email", { required: "El email es obligatorio" })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              type="password"
              placeholder="Contraseña"
              {...register("password", {
                required: "La contraseña es obligatoria",
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all duration-200 shadow-lg shadow-red-500/25"
            type="submit"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-sm text-gray-300 mt-6">
          <Link to="/memberships" className="text-red-400 hover:text-red-300">
            Regresar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
