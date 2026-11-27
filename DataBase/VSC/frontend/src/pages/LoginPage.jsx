import { useState } from "react";
import "./LoginPage.css";

export function LoginPage({ onNavigate, onLogin }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [email, setEmail] = useState("");

  const toggleTheme = () => setIsDarkMode((darkMode) => !darkMode);

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin?.(email);
  };

  return (
    <main className={`login-page${isDarkMode ? " is-dark" : ""}`}>
      <header className="login-header">
        <button
          type="button"
          onClick={() => onNavigate?.("home")}
          className="login-brand"
        >
          GymLocator
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label={isDarkMode ? "Activar tema claro" : "Activar tema oscuro"}
        >
          {isDarkMode ? "☾" : "☼"}
        </button>
      </header>

      <div className="login-content">
        <section className="login-hero" aria-label="Bienvenida">
          <img
            src="https://images.unsplash.com/photo-1548690312-e3b507d8c110?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxneW0lMjB3b3Jrb3V0JTIwbW90aXZhdGlvbnxlbnwxfHx8fDE3Nzk5MTQzMDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt=""
            className="login-hero-image"
          />
          <div className="login-hero-shade" />
          <div className="login-hero-copy">
            <h1>Bienvenido de vuelta</h1>
            <p>Continúa tu viaje hacia una vida más saludable</p>
          </div>
        </section>

        <section className="login-form-panel">
          <div className="login-form-content">
            <div className="login-intro">
              <h2>Iniciar Sesión</h2>
              <p>Ingresa tus credenciales para continuar</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button type="submit" className="login-submit">
                Iniciar Sesión
              </button>
            </form>

            <div className="login-links">
              <p>
                ¿No tienes una cuenta?{" "}
                <button type="button" onClick={() => onNavigate?.("register")}>
                  Regístrate aquí
                </button>
              </p>
              <div className="admin-link">
                <button type="button" onClick={() => onNavigate?.("admin")}>
                  Acceso Admin (Demo)
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}