import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { sharedStyles } from "../../constants/sharedStyles";
import { Colors } from '../../constants/theme';
import LogoHallado from '../LogoHallado';

/**
 * Barra superior del inicio: marca de Hallado y botón para abrir el Buscador Guiado.
 */
export default function HomeHeader({ onOpenGuidedSearch }) {
  return (
    <View style={sharedStyles.tabHeader}>
      <View style={styles.brandContainer}>
        <LogoHallado size={28} color={Colors.surface} />
        <Text style={[sharedStyles.tabHeaderTitle, styles.brandTitle]}>Hallado</Text>
      </View>

      <Pressable
        style={styles.guidedSearchButtonHeader}
        onPress={onOpenGuidedSearch}
      >
        <MaterialCommunityIcons name="tune-variant" size={18} color={Colors.surface} />
        <Text style={styles.guidedSearchButtonText}>Buscador Guiado</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  guidedSearchButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  guidedSearchButtonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
});
