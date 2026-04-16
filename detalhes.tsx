import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getIptvData } from '../services/iptvApi';

export default function Detalhes() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    carregarDetalhes();
  }, [id]);

  const carregarDetalhes = async () => {
    try {
      setLoading(true);
      const loginRaw = await AsyncStorage.getItem('@iptv_login');
      if (!loginRaw) return router.replace('/');

      const { url, username, password } = JSON.parse(loginRaw);
      // Busca info específica do VOD
      const data = await getIptvData(url, username, password, `get_vod_info&vod_id=${id}`);

      if (data && data.info) {
        setInfo(data);
      } else {
        throw new Error("Dados inválidos");
      }
    } catch (e) {
      Alert.alert("Aviso", "Não foi possível carregar os detalhes deste conteúdo.");
      if (router.canGoBack()) router.back();
    } finally {
      // O "finally" garante que o canal de loading seja fechado, sucesso ou erro
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/dashboard');
    }
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#7C3AED" /></View>
  );

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.header}>
        <Image source={{ uri: info?.info?.movie_image || 'https://via.placeholder.com/500' }} style={styles.poster} />
        
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{info?.info?.name}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{info?.info?.year || 'N/A'}</Text>
          <Text style={styles.metaText}>⭐ {info?.info?.rating || '0.0'}</Text>
          <Text style={styles.metaText}>{info?.info?.duration || ''}</Text>
        </View>

        <Pressable style={styles.playBtn} onPress={() => Alert.alert("Player", "Iniciando Player...")}>
          <Ionicons name="play" size={20} color="#000" />
          <Text style={styles.playText}>ASSISTIR AGORA</Text>
        </Pressable>

        <Text style={styles.subtitle}>Sinopse</Text>
        <Text style={styles.plot}>{info?.info?.plot || 'Sem descrição disponível.'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F' },
  center: { flex: 1, backgroundColor: '#0B0B0F', justifyContent: 'center', alignItems: 'center' },
  header: { height: 450, width: '100%' },
  poster: { width: '100%', height: '100%', resizeMode: 'cover' },
  backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 12 },
  content: { padding: 25, marginTop: -30, backgroundColor: '#0B0B0F', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  meta: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  metaText: { color: '#666', fontSize: 14, fontWeight: 'bold' },
  playBtn: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 18, borderRadius: 15, marginBottom: 30 },
  playText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  subtitle: { color: '#7C3AED', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  plot: { color: '#888', fontSize: 15, lineHeight: 24 }
});