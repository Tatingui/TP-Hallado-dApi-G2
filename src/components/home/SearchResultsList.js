import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Colors } from '../../constants/theme';
import PublicationCard from '../PublicationCard';
import EmptySearchResults from '../EmptySearchResults';
import StartSearchPrompt from '../StartSearchPrompt';

/**
 * Lista de resultados del inicio con pull-to-refresh y paginación.
 * Antes de la primera búsqueda (hasSearched = false) muestra StartSearchPrompt;
 * después, si no hay resultados, muestra EmptySearchResults.
 */
export default function SearchResultsList({
  loading,
  loadingMore,
  publications,
  refreshing,
  onRefresh,
  onLoadMore,
  hasSearched,
  searchCriteria,
  onSaveAlert,
  onStartSearch,
  onPressPublication,
}) {
  // El indicador a pantalla completa solo en la primera carga; al paginar o
  // refrescar se mantiene la lista y el indicador va al pie.
  if (loading && publications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Buscando publicaciones...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={publications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <PublicationCard
          publication={item}
          onPress={() => onPressPublication(item)}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
        />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={
        hasSearched ? (
          <EmptySearchResults searchCriteria={searchCriteria} onSaveAlert={onSaveAlert} />
        ) : (
          <StartSearchPrompt onStart={onStartSearch} />
        )
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.gray500,
    fontWeight: '500',
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
