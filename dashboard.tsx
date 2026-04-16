import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getIptvData } from '../../services/iptvApi';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('filmes'); 
  const [categorias, setCategorias] = useState([]);
  const [conteudoFiltro, setConteudoFiltro] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('all');
  const router = useRouter();

  const abas = [
    { id: 'filmes', label: 'Filmes', action: 'get_vod_streams', catAction: 'get_vod_categories' },
    { id: 'canais', label: 'Canais', action: 'get_live_streams', catAction: 'get_live_categories' },
    { id: 'series', label: 'Séries', action: 'get_series', catAction: 'get_series_categories' },
  ];

  useEffect(() => {
    inicializarDados();
  }, [abaAtiva]);

  const inicializarDados = async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem('@iptv_login');
      
      // Se não houver login, redireciona, mas verifica se o router está pronto
      if (!raw) {
        return router.replace('/');
      }

      const { url, username, password } = JSON.parse(raw);
      const config = abas.find(a => a.id === abaAtiva);

      // Busca Categorias e Conteúdo em paralelo (Muito mais rápido)
      const [dataCats, dataCont] = await Promise.all([
        getIptvData(url, username, password, config?.catAction || ''),
        getIptvData(url, username, password, config?.action || '')
      ]);

      if (dataCats && dataCont) {
        setCategorias([{ category_id: 'all', category_name: 'Todos' }, ...dataCats]);
        setConteudoFiltro(dataCont);
        setCategoriaSelecionada('all');
      } else {
        // Se a API falhar, não desloga, apenas avisa
        console.warn("Falha ao receber dados da API");
      }
    } catch (e) {
      console.error("Erro no Dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  const irParaDetalhes = (item: any) => {
    const id = item.stream_id || item.series_id;
    if (id) {
      router.push({ pathname: '/detalhes', params: { id: id.toString() } });
    }
  };

  const renderConteudo = () => {
    const filtrados = categoriaSelecionada === 'all' 
      ? conteudoFiltro.slice(0, 60) 
      : conteudoFiltro.filter((i: any) => i.category_id === categoriaSelecionada).slice(0, 60);

    return filtrados.map((item: any) => (
      <TouchableOpacity 
        key={(item.stream_id || item.series_id).toString()}
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => irParaDetalhes(item)}
      >
        <Image 
          source={{ uri: item.stream_icon || item.cover || 'https://via.placeholder.com/150' }} 
          style={styles.cardImg} 
        />
        <Text numberOfLines={1} style={styles.cardTitle}>{item.name}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B0F" />
      
      {/* HEADER FIXO - Z-INDEX E ELEVATION PARA ANDROID */}
      <View style={styles.headerFixo}>
        <View style={styles.topRow}>
          <Text style={styles.logo}>KING<Text style={{color: '#fff'}}>IPTV</Text></Text>
          <View style={styles.abasRow}>
            {abas.map(aba => (
              <TouchableOpacity 
                key={aba.id} 
                onPress={() => setAbaAtiva(aba.id)} 
                style={[styles.abaBtn, abaAtiva === aba.id && styles.abaAtiva]}
              >
                <Text style={[styles.abaText, abaAtiva === aba.id && styles.abaTextAtiva]}>{aba.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* FILTRO DE CATEGORIAS POR ABA */}
        {!loading && categorias.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {categorias.map((cat: any) => (
              <TouchableOpacity 
                key={cat.category_id.toString()} 
                onPress={() => setCategoriaSelecionada(cat.category_id)}
                style={[styles.catBtn, categoriaSelecionada === cat.category_id && styles.catBtnAtiva]}
              >
                <Text style={[styles.catText, categoriaSelecionada === cat.category_id && styles.catTextAtiva]}>
                  {cat.category_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView 
        style={styles.scrollContent} 
        contentContainerStyle={{ paddingTop: 165, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Sincronizando Lista...</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {renderConteudo()}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#0B0B0F' },
  headerFixo: { 
    position: 'absolute', top: 0, left: 0, right: 0, 
    zIndex: 99, backgroundColor: '#0B0B0F', 
    paddingTop: Platform.OS === 'android' ? 45 : 10,
    elevation: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1E'
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60 },
  logo: { color: '#7C3AED', fontSize: 24, fontWeight: '900' },
  abasRow: { flexDirection: 'row', gap: 8 },
  abaBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  abaAtiva: { backgroundColor: 'rgba(124, 58, 237, 0.15)' },
  abaText: { color: '#888', fontWeight: 'bold', fontSize: 14 },
  abaTextAtiva: { color: '#7C3AED' },
  
  catScroll: { paddingVertical: 12, paddingLeft: 15 },
  catBtn: { marginRight: 10, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1A1A1E' },
  catBtnAtiva: { backgroundColor: '#7C3AED' },
  catText: { color: '#777', fontSize: 12, fontWeight: 'bold' },
  catTextAtiva: { color: '#fff' },

  scrollContent: { flex: 1 },
  loadingArea: { marginTop: 100, alignItems: 'center' },
  loadingText: { color: '#555', marginTop: 15, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  card: { width: (width - 40) / 3, margin: 5, marginBottom: 20 },
  cardImg: { width: '100%', aspectRatio: 2/3, borderRadius: 12, backgroundColor: '#1A1A1E' },
  cardTitle: { color: '#888', fontSize: 10, marginTop: 8, textAlign: 'center', fontWeight: '600' }
});