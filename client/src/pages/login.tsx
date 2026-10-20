import { useNavigate } from "react-router-dom";
import { useState } from "react";

type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: "SUPER_ADMIN" | "PHARMA" | "WHOLESALER" | "RETAILER";
      companyId: string | null;
    };
  };
};

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const result: LoginResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Login failed"
        );
      }

      if (!result.data?.token || !result.data?.user) {
        throw new Error(
          "Invalid login response from server"
        );
      }

      // Store authentication information
      localStorage.setItem(
        "token",
        result.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(result.data.user)
      );

      // Redirect based on REAL backend role
      switch (result.data.user.role) {
        case "SUPER_ADMIN":
          navigate("/admin");
          break;

        case "PHARMA":
          navigate("/pharma");
          break;

        case "WHOLESALER":
          navigate("/wholesaler");
          break;

        case "RETAILER":
          navigate("/retailer");
          break;

        default:
          throw new Error(
            "Unknown user role"
          );
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-xl shadow-xl w-[400px]">

        <h1 className="text-3xl font-bold text-center mb-8">
          🏥 PharmaFlow
        </h1>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="border w-full p-3 rounded-lg mb-4"
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="border w-full p-3 rounded-lg mb-4"
            disabled={loading}
          />

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;