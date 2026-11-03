export const PASSWORD_CRITERIA = [
  { key: "length", label: "Al menos 6 caracteres", test: (p) => typeof p === "string" && p.length >= 6 },
  { key: "upper", label: "Una letra mayúscula", test: (p) => typeof p === "string" && /[A-Z]/.test(p) },
  { key: "number", label: "Un número", test: (p) => typeof p === "string" && /[0-9]/.test(p) },
  { key: "special", label: "Un carácter especial (!@#$...)", test: (p) => typeof p === "string" && /[^A-Za-z0-9]/.test(p) },
];

export function validatePasswordCriteria(password) {
  const safePassword = typeof password === "string" ? password : "";
  const errors = [];
  for (const c of PASSWORD_CRITERIA) {
    if (!c.test(safePassword)) {
      errors.push(c.label);
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validatePasswordMatch(password, confirmation) {
  const p1 = typeof password === "string" ? password.trim() : "";
  const p2 = typeof confirmation === "string" ? confirmation.trim() : "";
  if (!p1 || !p2) {
    return "Completá la contraseña y su confirmación";
  }
  const { valid, errors } = validatePasswordCriteria(password);
  if (!valid) {
    return "La contraseña no cumple: " + errors[0];
  }
  if (password !== confirmation) {
    return "Las contraseñas no coinciden";
  }
  return null;
}
