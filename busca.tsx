import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getIptvData } from '../../services/iptvApi';

export default function Busca() {
  const [busca, setBusca] = useState('');
  const [lista, setLista] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('@iptv_login');
      if (raw) {
        const { url, username, password } = JSON.parse(raw);
        const data = await getIptvData(url, username, password, 'get_vod_streams');
        setLista(data || []);
      }
    })();
  }, []);

  const handleBusca = (t: string) => {
    setBusca(t);
    if (t.length > 2) {
      const res = lista.filter((i: any) => i.name.toLowerCase().includes(t.toLowerCase()));
      setFiltrados(res.slice(0, 30));
    } else {
      setFiltrados([]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput 
          placeholder="O que vamos assistir?" 
          placeholderTextColor="#666" 
          style={styles.input} 
          value={busca}
          onChangeText={handleBusca}
        />
      </View>

      <FlatList 
        data={filtrados}
        numColumns={3}
        keyExtractor={(item: any) => item.stream_id.toString()}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push({ pathname: '/detalhes', params: { id: item.stream_id }})}>
            <Image source={{ uri: item.stream_icon || 'https://via.placeholder.com/150' }} style={styles.img} />
            <Text numberOfLines={1} style={styles.title}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F', paddingHorizontal: 15 },
  searchBox: { backgroundColor: '#1C1C22', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginTop: 50, marginBottom: 20 },
  input: { flex: 1, color: '#fff', marginLeft: 10 },
  card: { flex: 1/3, margin: 5 },
  img: { width: '100%', aspectRatio: 2/3, borderRadius: 8 },
  title: { color: '#666', fontSize: 10, textAlign: 'center', marginTop: 5 }
});