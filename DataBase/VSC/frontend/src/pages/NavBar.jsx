import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { User, Sun, Moon, LogOut, ChevronDown, LayoutDashboard, Dumbbell } from "lucide-react";

const GYM_BG = "https://images.unsplash.com/photo-1624948465121-96e87ae34a87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGRyaW5raW5nJTIwd2F0ZXIlMjBneW0lMjBmaXRuZXNzfGVufDF8fHx8MTc4OTc2MjA0OHww&ixlib=rb-4.1.0&q=80&w=1080";

export function Navbar({ onNavigate, isLoggedIn = false, user, onLogout }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleNavigation = (page) => {
    setIsSheetOpen(false);
    onNavigate(page);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-primary hover:bg-primary/10"
          >
            {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
          <h1 className="text-2xl text-primary">GymLocator</h1>
        </div>

        {isLoggedIn && user ? (
          /* ── Logged-in profile button + dropdown ── */
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((o) => !o)}
              className="flex items-center gap-2 bg-primary hover:bg-accent text-black px-4 py-2 rounded-md border-2 border-primary transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="text-sm max-w-[120px] truncate">{user.name}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-card border-2 border-primary rounded-xl shadow-xl overflow-hidden z-50">
                {/* User info */}
                <div className="px-4 py-3 bg-primary/5 border-b border-border">
                  <p className="text-foreground text-sm truncate">{user.name}</p>
                  <p className="text-muted-foreground text-xs truncate">{user.email}</p>
                </div>

                {/* Actions */}
                <div className="p-1.5 flex flex-col gap-0.5">
                  <button
                    onClick={() => { setIsDropdownOpen(false); onNavigate("profile"); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors w-full text-left"
                  >
                    <User className="w-4 h-4" />
                    Ver mi perfil
                  </button>
                  <button
                    onClick={() => { setIsDropdownOpen(false); onNavigate("admin"); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-primary/10 transition-colors w-full text-left"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Panel Admin
                  </button>
                  <button
                    onClick={() => { setIsDropdownOpen(false); onNavigate("trainer"); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-primary/10 transition-colors w-full text-left"
                  >
                    <Dumbbell className="w-4 h-4" />
                    Panel Entrenador
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={() => { setIsDropdownOpen(false); onLogout?.(); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Guest sheet ── */
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-primary text-black hover:bg-accent border-2 border-primary">
              <User className="w-4 h-4" />
              Mi Cuenta
            </SheetTrigger>
            <SheetContent className="p-0 border-l border-primary/30 overflow-hidden">
              {/* Gym background */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${GYM_BG})` }}
              />
              <div className="absolute inset-0 bg-black/78" />

              {/* Foreground content */}
              <div className="relative z-10 h-full flex flex-col px-6 py-8">
                <SheetHeader className="mb-8 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-primary text-xl font-medium">GymLocator</span>
                  </div>
                  <SheetTitle className="text-primary text-2xl">Mi Cuenta</SheetTitle>
                  <SheetDescription className="text-primary/60">
                    Accede a tu cuenta o crea una nueva
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleNavigation("login")}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-black/50 hover:bg-black/70 border border-primary/30 hover:border-primary/60 text-primary transition-all text-sm font-medium"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    Iniciar Sesión
                  </button>

                  <button
                    onClick={() => handleNavigation("register")}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-black transition-all text-sm font-medium"
                  >
                    <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-black" />
                    </div>
                    Registrarse
                  </button>

                  <div className="h-px bg-primary/20 my-2" />

                  <button
                    onClick={() => handleNavigation("admin")}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-black/50 hover:bg-black/70 border border-primary/20 hover:border-primary/40 text-primary/80 hover:text-primary transition-all text-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                      <LayoutDashboard className="w-4 h-4 text-primary" />
                    </div>
                    Panel Admin
                  </button>

                  <button
                    onClick={() => handleNavigation("trainer")}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-black/50 hover:bg-black/70 border border-primary/20 hover:border-primary/40 text-primary/80 hover:text-primary transition-all text-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-primary" />
                    </div>
                    Panel Entrenador
                  </button>
                </div>

                <div className="mt-auto pt-6 border-t border-primary/15">
                  <p className="text-primary/40 text-xs text-center">GymLocator · Bogotá, Colombia</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
}