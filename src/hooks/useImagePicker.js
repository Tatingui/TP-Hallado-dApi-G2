import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";

export default function useImagePicker() {
  const [loading, setLoading] = useState(false);

  const pickImages = useCallback(async (selectionLimit) => {
    if (selectionLimit <= 0) return [];

    setLoading(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit,
        quality: 0.7,
      });

      if (result.canceled || !result.assets) return [];

      return result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        fileName: asset.fileName || `img_${Date.now()}.jpg`,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  return { pickImages, loading };
}