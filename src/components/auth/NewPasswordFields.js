import { Text } from "react-native";
import PasswordInput from "../PasswordInput";
import PasswordCriteria from "../PasswordCriteria";
import { authFieldStyles } from "./AuthFormLayout";

/**
 * Campos para definir una contraseña nueva: contraseña con sus criterios
 * de seguridad y confirmación. Se usa en el registro y en el recupero.
 */
export default function NewPasswordFields({
  password,
  confirmation,
  onChangePassword,
  onChangeConfirmation,
  passwordLabel = "Contraseña",
}) {
  return (
    <>
      <Text style={authFieldStyles.label}>{passwordLabel}</Text>
      <PasswordInput
        value={password}
        onChangeText={onChangePassword}
        placeholder="Mínimo 6 caracteres"
      />
      <PasswordCriteria password={password} />

      <Text style={authFieldStyles.label}>Confirmar contraseña</Text>
      <PasswordInput
        value={confirmation}
        onChangeText={onChangeConfirmation}
        placeholder="Repetí tu contraseña"
      />
    </>
  );
}
