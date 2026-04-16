import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getIptvData } from '../services/iptvApi';

export default function ListaConteudo() {
  const [loading, setLoading] = useState(true);
  const [listaCompleta, setListaCompleta] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const loginRaw = await AsyncStorage.getItem('@iptv_login');
        if (loginRaw) {
          const { url, username, password } = JSON.parse(loginRaw);
          // Buscamos todos os VODs
          const data = await getIptvData(url, username, password, 'get_vod_streams');
          
          if (data && Array.isArray(data)) {
            setListaCompleta(data);
            setFiltrados(data.slice(0, 50)); // Começamos mostrando só 50 para voar
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Lógica de busca em tempo real
  const handleBusca = (texto: string) => {
    setBusca(texto);
    if (texto.length > 2) {
      const resultado = listaCompleta.filter((item: any) => 
        item.name.toLowerCase().includes(texto.toLowerCase())
      );
      setFiltrados(resultado.slice(0, 50));
    } else {
      setFiltrados(listaCompleta.slice(0, 50));
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
      {/* HEADER DE BUSCA */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput 
            placeholder="Buscar filmes no King..." 
            placeholderTextColor="#666"
            style={styles.input}
            value={busca}
            onChangeText={handleBusca}
          />
        </View>
      </View>

      <FlatList
        data={filtrados}
        numColumns={3}
        keyExtractor={(item: any) => item.stream_id.toString()}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.card} 
            onPress={() => router.push({ pathname: '/detalhes', params: { id: item.stream_id, name: item.name }})}
          >
            <Image 
              source={{ uri: item.stream_icon || 'https://via.placeholder.com/120x180' }} 
              style={styles.cardImg} 
            />
            <Text numberOfLines={1} style={styles.cardTitle}>{item.name}</Text>
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 10 }}
        // Performance: não carrega tudo de uma vez
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F' },
  center: { flex: 1, backgroundColor: '#0B0B0F', justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  backBtn: { marginRight: 15 },
  searchBar: { flex: 1, backgroundColor: '#1C1C22', height: 45, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  input: { flex: 1, color: '#fff', marginLeft: 10, fontSize: 14 },
  card: { flex: 1/3, margin: 5, alignItems: 'center' },
  cardImg: { width: '100%', aspectRatio: 2/3, borderRadius: 10, backgroundColor: '#1C1C22' },
  cardTitle: { color: '#888', fontSize: 11, marginTop: 5, textAlign: 'center' }
});