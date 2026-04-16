import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getIptvData } from '../../services/iptvApi';

export default function Favoritos() {
  const [loading, setLoading] = useState(true);
  const [favItems, setFavItems] = useState([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      carregarFavoritos();
    }, [])
  );

  const carregarFavoritos = async () => {
    try {
      setLoading(true);
      const loginRaw = await AsyncStorage.getItem('@iptv_login');
      const favsRaw = await AsyncStorage.getItem('@favoritos_ids');
      
      if (!loginRaw || !favsRaw) {
        setFavItems([]);
        setLoading(false);
        return;
      }

      const { url, username, password } = JSON.parse(loginRaw);
      const favoritosIds = JSON.parse(favsRaw);

      const allVod = await getIptvData(url, username, password, 'get_vod_streams');
      
      if (allVod && Array.isArray(allVod)) {
        const filtrados = allVod.filter((filme: any) => 
          favoritosIds.includes(filme.stream_id.toString()) || favoritosIds.includes(filme.stream_id)
        );
        setFavItems(filtrados);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Favoritos</Text>
      </View>

      {favItems.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-dislike-outline" size={60} color="#333" />
          <Text style={styles.emptyText}>Sua lista está vazia.</Text>
          <Pressable style={styles.btnExplorar} onPress={() => router.push('/(tabs)/dashboard')}>
            <Text style={styles.btnText}>Explorar Filmes</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={favItems}
          numColumns={3}
          keyExtractor={(item: any) => item.stream_id.toString()}
          renderItem={({ item }) => (
            <Pressable 
              style={styles.card} 
              onPress={() => router.push({ pathname: '/detalhes', params: { id: item.stream_id }})}
            >
              <Image 
                source={{ uri: item.stream_icon || 'https://via.placeholder.com/150' }} 
                style={styles.cardImg} 
              />
              <Text numberOfLines={1} style={styles.cardTitle}>{item.name}</Text>
            </Pressable>
          )}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F' },
  center: { flex: 1, backgroundColor: '#0B0B0F', justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { color: '#666', marginTop: 15, fontSize: 16 },
  btnExplorar: { 
    marginTop: 20, 
    backgroundColor: '#1C1C22', 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#7C3AED' 
  },
  btnText: { color: '#7C3AED', fontWeight: 'bold' },
  card: { 
    flex: 1, 
    maxWidth: '33.33%', 
    margin: 5, 
    alignItems: 'center' 
  },
  cardImg: { 
    width: '100%', 
    aspectRatio: 2/3, 
    borderRadius: 10, 
    backgroundColor: '#1C1C22' 
  },
  cardTitle: { 
    color: '#888', 
    fontSize: 11, 
    marginTop: 5, 
    textAlign: 'center' 
  }
});