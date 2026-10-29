import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";
import usePublishForm from "../../hooks/usePublishForm";
import StepType from "./publish/StepType";
import StepCategory from "./publish/StepCategory";
import StepDetails from "./publish/StepDetails";
import StepLocation from "./publish/StepLocation";
import StepImages from "./publish/StepImages";
import StepReview from "./publish/StepReview";

export default function PublishScreen() {
  const {
    STEPS,
    step,
    form,
    submitting,
    showDatePicker,
    setShowDatePicker,
    updateField,
    markTouched,
    fieldError,
    canAdvance,
    nextStep,
    prevStep,
    pickImages,
    removeImage,
    getLocation,
    handleSubmit,
  } = usePublishForm();

  const renderStep = () => {
    switch (STEPS[step]) {
      case "type":
        return <StepType form={form} updateField={updateField} />;
      case "category":
        return <StepCategory form={form} updateField={updateField} />;
      case "details":
        return (
          <StepDetails
            form={form}
            updateField={updateField}
            markTouched={markTouched}
            fieldError={fieldError}
          />
        );
      case "location":
        return (
          <StepLocation
            form={form}
            updateField={updateField}
            getLocation={getLocation}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
          />
        );
      case "images":
        return (
          <StepImages
            form={form}
            pickImages={pickImages}
            removeImage={removeImage}
          />
        );
      case "review":
        return <StepReview form={form} />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.progressDot, i <= step && styles.progressDotActive]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      {/* Botones de navegación */}
      <View style={styles.navRow}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
            <Text style={styles.backBtnText}>Atrás</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {step < STEPS.length - 1 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !canAdvance() && styles.btnDisabled]}
            onPress={nextStep}
            disabled={!canAdvance()}
          >
            <Text style={styles.nextBtnText}>Siguiente</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.surface} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={Colors.surface}
                />
                <Text style={styles.submitBtnText}>Publicar</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressContainer: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    paddingTop: 56, paddingBottom: 12, gap: 8, backgroundColor: Colors.surface,
  },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  progressDotActive: { backgroundColor: Colors.primary },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  navRow: {
    flexDirection: "row", alignItems: "center", padding: 16,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: 8 },
  backBtnText: { fontSize: 15, color: Colors.text },
  nextBtn: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.primary,
    borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12, gap: 6,
  },
  nextBtnText: { color: Colors.surface, fontSize: 15, fontWeight: "600" },
  submitBtn: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.success,
    borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12, gap: 6,
  },
  submitBtnText: { color: Colors.surface, fontSize: 15, fontWeight: "600" },
  btnDisabled: { opacity: 0.5 },
});
