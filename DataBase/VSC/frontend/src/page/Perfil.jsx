
import { useState } from "react";
import {
  ArrowLeft, User, Mail, Phone, Edit2, Check, X,
  Clock, BarChart2, MapPin, CalendarCheck,
  AlertCircle, Tag, UserCheck,
} from "lucide-react";

const EMPTY_USER = Object.freeze({});

function getProfileDraft(user) {
  const fullName = user.name || "";
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: user.firstName ?? user.nombre ?? nameParts[0] ?? "",
    lastName:
      user.lastName ??
      user.apellido ??
      nameParts.slice(1).join(" ") ??
      "",
    email: user.email ?? "",
    phone: user.phone ?? user.telefono ?? "",
  };
}

const tabs = [
  { id: "sedes", label: "Sedes Favoritas", icon: MapPin },
  { id: "horarios", label: "Horarios", icon: Clock },
  { id: "rutinas", label: "Rutinas de entrenamiento", icon: BarChart2 },
  { id: "clases", label: "Mis Clases", icon: CalendarCheck },
];

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/10">
        <Icon className="h-8 w-8 text-amber-500" />
      </div>
      <h3 className="mb-2 font-semibold text-slate-900">{title}</h3>
      <p className="max-w-xs text-sm text-slate-500">{description}</p>
    </div>
  );
}

function ClassCard({ cls, onCancel }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-medium text-slate-900">
            {cls.className}
          </h4>
          <p className="mt-0.5 text-xs text-slate-500">
            Inscrito el {cls.enrolledDate}
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700">
          <Tag className="w-2.5 h-2.5" />
          {cls.specialty}
        </span>
      </div>

      {/* Info pills */}
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
          <MapPin className="h-3 w-3 text-amber-500" />
          {cls.sede}
        </span>

        <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
          <Clock className="h-3 w-3 text-amber-500" />
          {cls.schedule}
        </span>

        <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
          <Clock className="h-3 w-3 text-amber-500" />
          {cls.duration}
        </span>

        <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
          <UserCheck className="h-3 w-3 text-amber-500" />
          {cls.trainer}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-slate-600">
        {cls.description}
      </p>

      {/* Routines */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
          Rutinas asociadas
        </p>

        <div className="flex flex-wrap gap-1.5">
          {cls.routines.map((r) => (
            <span
              key={r}
              className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-700"
            >
              <BarChart2 className="w-2.5 h-2.5" />
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Cancel block */}
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />

          <p className="min-w-0 flex-1 text-sm text-slate-600">
            ¿Cancelar{" "}
            <strong className="text-slate-900">{cls.className}</strong>?
          </p>

          <button
            type="button"
            onClick={() => onCancel(cls.id)}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-red-700"
          >
            Sí, cancelar
          </button>

          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:text-slate-900"
          >
            No
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
        >
          <X className="w-4 h-4" />
          Cancelar inscripción
        </button>
      )}
    </div>
  );
}

export function ProfilePage({
  user = EMPTY_USER,
  enrolledClasses: userClasses = [],
  onNavigate,
  onUpdateUser,
}) {
  const [activeTab, setActiveTab] = useState("sedes");
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(() => getProfileDraft(user));
  const [draft, setDraft] = useState(() => getProfileDraft(user));
  const [saved, setSaved] = useState(false);
  const [enrolledClasses, setEnrolledClasses] = useState(userClasses);

  const handleSave = () => {
    const updatedUser = {
      ...user,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
    };

    if ("nombre" in user) updatedUser.nombre = draft.firstName.trim();
    if ("apellido" in user) updatedUser.apellido = draft.lastName.trim();
    if ("telefono" in user) updatedUser.telefono = draft.phone.trim();
    if ("name" in user) {
      updatedUser.name = `${draft.firstName.trim()} ${draft.lastName.trim()}`.trim();
    }

    onUpdateUser?.(updatedUser);
    setProfile(getProfileDraft(updatedUser));
    setEditing(false);
    setSaved(true);
  };

  const handleCancelEdit = () => {
    setDraft(profile);
    setEditing(false);
  };

  const handleCancelClass = (id) => {
    setEnrolledClasses((prev) => prev.filter((cls) => cls.id !== id));
  };

  const fields = [
    {
      key: "firstName",
      label: "Nombre",
      icon: User,
      type: "text",
      placeholder: "Tu nombre",
    },
    {
      key: "lastName",
      label: "Apellido",
      icon: User,
      type: "text",
      placeholder: "Tu apellido",
    },
    {
      key: "email",
      label: "Correo electrónico",
      icon: Mail,
      type: "email",
      placeholder: "tu@email.com",
    },
    {
      key: "phone",
      label: "Teléfono",
      icon: Phone,
      type: "tel",
      placeholder: "+57 300 000 0000",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4 sm:px-6">
          {onNavigate ? (
            <button
              type="button"
              onClick={() => onNavigate("home")}
              className="group flex items-center gap-2 text-amber-600 transition-colors hover:text-amber-700"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm">Volver</span>
            </button>
          ) : (
            <a
              href="/"
              className="group flex items-center gap-2 text-amber-600 transition-colors hover:text-amber-700"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm">Volver</span>
            </a>
          )}
          <h1 className="flex-1 text-center text-lg font-semibold">Mi perfil</h1>
          <div aria-hidden="true" className="w-[58px]" />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <section className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber-400 bg-amber-50 shadow-sm">
            <User className="h-12 w-12 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold">
            {[profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
              "Mi cuenta"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {profile.email || "Sin correo electrónico"}
          </p>

          {saved && (
            <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-700">
              <Check className="h-3.5 w-3.5" />
              Cambios guardados
            </span>
          )}
        </section>

        <section className="mb-8 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h3 className="font-semibold">Datos personales</h3>

            {!editing ? (
              <button
                type="button"
                onClick={() => {
                  setSaved(false);
                  setEditing(true);
                }}
                className="inline-flex items-center rounded-lg border border-amber-400 px-3 py-2 text-sm text-amber-700 transition-colors hover:bg-amber-50"
              >
                <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center rounded-lg bg-amber-400 px-3 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-500"
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label
                  htmlFor={`profile-${key}`}
                  className="flex items-center gap-1.5 text-sm text-slate-600"
                >
                  <Icon className="h-3.5 w-3.5 text-amber-500" />
                  {label}
                </label>

                {editing ? (
                  <input
                    id={`profile-${key}`}
                    type={type}
                    value={draft[key]}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    placeholder={placeholder}
                    autoComplete={
                      key === "firstName"
                        ? "given-name"
                        : key === "lastName"
                          ? "family-name"
                          : key === "phone"
                            ? "tel"
                            : "email"
                    }
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  />
                ) : (
                  <p className="min-h-10 rounded-lg bg-slate-100 px-3 py-2 text-sm">
                    {profile[key] || (
                      <span className="italic text-slate-400">
                        Sin información
                      </span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <nav
          aria-label="Secciones del perfil"
          className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-slate-200/70 p-1"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={activeTab === id ? "page" : undefined}
              onClick={() => setActiveTab(id)}
              className={`flex min-w-max flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                activeTab === id
                  ? "bg-amber-400 font-medium text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(" ")[0]}</span>
            </button>
          ))}
        </nav>

        <section className="rounded-2xl border border-amber-200 bg-white shadow-sm">
          {activeTab === "sedes" && (
            <EmptyState
              icon={MapPin}
              title="Sin sedes favoritas"
              description="Explora nuestros gimnasios y guarda los que más te interesen para acceder rápidamente."
            />
          )}

          {activeTab === "horarios" && (
            <EmptyState
              icon={Clock}
              title="Sin horarios asignados"
              description="Una vez que te inscribas en una sede, tus horarios de clases aparecerán aquí."
            />
          )}

          {activeTab === "rutinas" && (
            <EmptyState
              icon={BarChart2}
              title="Sin rutinas de entrenamiento"
              description="Cuando tengas un plan activo, tus rutinas de ejercicio aparecerán aquí."
            />
          )}

          {activeTab === "clases" && (
            <div className="p-5">
              {enrolledClasses.length === 0 ? (
                <EmptyState
                  icon={CalendarCheck}
                  title="Sin clases inscritas"
                  description="Explora las sedes y sus clases disponibles para inscribirte."
                />
              ) : (
                <div className="space-y-4">
                  <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                    Clases activas · {enrolledClasses.length}
                  </p>
                  {enrolledClasses.map((cls) => (
                    <ClassCard
                      key={cls.id}
                      cls={cls}
                      onCancel={handleCancelClass}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
