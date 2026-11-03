import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";

export default function useImagePicker() {
  const [loading, setLoading] = useState(false);

  const normalizeAsset = useCallback((asset) => ({
    uri: asset.uri,
    type: asset.mimeType || "image/jpeg",
    fileName: asset.fileName || `img_${Date.now()}.jpg`,
  }), []);

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

      return result.assets.map(normalizeAsset);
    } finally {
      setLoading(false);
    }
  }, [normalizeAsset]);

  const pickImage = useCallback(async (options = {}) => {
    setLoading(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return { status: "denied", asset: null };

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [1, 1],
        quality: options.quality ?? 0.7,
      });

      if (result.canceled || !result.assets?.[0]) {
        return { status: "cancelled", asset: null };
      }

      return { status: "selected", asset: normalizeAsset(result.assets[0]) };
    } finally {
      setLoading(false);
    }
  }, [normalizeAsset]);

  const takePhoto = useCallback(async (options = {}) => {
    setLoading(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") return { status: "denied", asset: null };

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: options.allowsEditing ?? true,
        quality: options.quality ?? 0.7,
      });

      if (result.canceled || !result.assets?.[0]) {
        return { status: "cancelled", asset: null };
      }

      return { status: "selected", asset: normalizeAsset(result.assets[0]) };
    } finally {
      setLoading(false);
    }
  }, [normalizeAsset]);

  return { pickImages, pickImage, takePhoto, loading };
}