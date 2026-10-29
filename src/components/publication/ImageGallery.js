import { Dimensions, Image, ScrollView, StyleSheet, View } from "react-native";
import { resolveImageUrl } from "../../utils/imageUrl";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Galería horizontal con paginado y dots indicadores.
 * @param {{ images: Array, activeImage: number, onImageChange: (index: number) => void }} props
 */
export default function ImageGallery({ images, activeImage, onImageChange }) {
  if (!images || images.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          onImageChange(idx);
        }}
      >
        {images.map((url, i) => (
          <Image
            key={i}
            source={{ uri: resolveImageUrl(typeof url === "string" ? url : url.uri) }}
            style={styles.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "relative" },
  image: { width: SCREEN_WIDTH, height: 260 },
  dotsContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.5)" },
  dotActive: { backgroundColor: "#fff" },
});
