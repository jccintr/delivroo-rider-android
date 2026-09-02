// Modal para selecionar a cidade de atuação do entregador no cadastro.
// Mesmo estilo de cartão do ReasonModal (overlay + Pressable pra fechar),
// mas com uma lista buscável em vez de um campo de texto — a lista de
// cidades ativas vem da API (GET /cities) e tende a crescer com o tempo.
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radius, spacing } from '../../theme/theme';
import { cityService } from '../../services/cityService';

export default function CitySelectModal({ visible, selectedCityId, onSelect, onClose }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!visible) return;

    let active = true;
    setLoading(true);
    setError(null);

    cityService
      .listActive()
      .then((data) => {
        if (active) setCities(data);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar as cidades.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [visible]);

  const filteredCities = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cities;
    return cities.filter((city) => city.name.toLowerCase().includes(term));
  }, [cities, search]);

  function handleSelect(city) {
    onSelect(city);
    setSearch('');
  }

  function handleClose() {
    setSearch('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Selecione sua cidade</Text>
          <Text style={styles.message}>
            Você só receberá entregas de lojas na cidade escolhida.
          </Text>

          <View style={styles.searchField}>
            <Ionicons name="search-outline" size={18} color={colors.inkSoft} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar cidade..."
              placeholderTextColor={colors.inkSoft}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="words"
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.orange} style={styles.stateBox} />
          ) : error ? (
            <Text style={[styles.emptyText, styles.stateBox]}>{error}</Text>
          ) : (
            <FlatList
              style={styles.list}
              data={filteredCities}
              keyExtractor={(item) => item._id}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
              ListEmptyComponent={
                <Text style={[styles.emptyText, styles.stateBox]}>
                  Nenhuma cidade encontrada.
                </Text>
              }
              renderItem={({ item }) => {
                const selected = item._id === selectedCityId;
                return (
                  <TouchableOpacity
                    style={[styles.cityOption, selected && styles.cityOptionSelected]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[styles.cityLabel, selected && styles.cityLabelSelected]}>
                      {item.name} - {item.state}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(38, 33, 28, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.xl,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  searchField: {
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.cream,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.ink,
  },
  stateBox: {
    paddingVertical: spacing.xxl,
  },
  list: {
    maxHeight: 260,
  },
  emptyText: {
    fontFamily: fonts.bodyRegular,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  cityOption: {
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  cityOptionSelected: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  cityLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.ink,
  },
  cityLabelSelected: {
    color: colors.white,
  },
  closeButton: {
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
  },
  closeButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
  },
});