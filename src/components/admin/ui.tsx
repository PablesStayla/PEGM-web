/**
 * Piezas de UI compartidas del panel de administración.
 * Componentes de servidor (sin estado) + clases reutilizables.
 */

export const inputClass =
  "w-full border border-line bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl tracking-tight">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-sm text-muted">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  required,
  step,
  min,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
  min?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium tracking-wider text-muted uppercase">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        className={inputClass}
      />
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 3,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium tracking-wider text-muted uppercase">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        className={`${inputClass} resize-y`}
      />
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 accent-accent"
      />
      {label}
    </label>
  );
}

export function Flash({
  saved,
  deleted,
  error,
}: {
  saved?: boolean;
  deleted?: boolean;
  error?: string;
}) {
  if (!saved && !deleted && !error) return null;

  return (
    <p
      role="status"
      className={`mb-6 border px-4 py-3 text-sm ${
        error
          ? "border-accent/50 bg-accent/5 text-accent"
          : "border-accent/30 bg-accent/5 text-accent"
      }`}
    >
      {error ? `Error: ${error}` : deleted ? "Elemento eliminado." : "Cambios guardados."}
    </p>
  );
}

export function errorText(code?: string): string | undefined {
  switch (code) {
    case "required":
      return "Faltan campos obligatorios.";
    case "password-short":
      return "La nueva contraseña debe tener al menos 8 caracteres.";
    case "password-wrong":
      return "La contraseña actual no coincide.";
    case "case-study-required":
      return "Para publicar el caso completa resumen, contexto, desafío, enfoque y resultados.";
    case "slug-in-use":
      return "La URL (slug) ya está siendo usada por otro proyecto.";
    default:
      return undefined;
  }
}
