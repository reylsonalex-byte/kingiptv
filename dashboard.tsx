import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Dashboard() {
  const router = useRouter();

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cache = useRef<any>({});

  // 🔐 AUTH CORRIGIDO
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem('@iptv_login');

        if (!stored) {
          router.replace('/');
          return;
        }

        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        router.replace('/');
      } finally {
        setIsAuthReady(true);
      }
    };

    checkAuth();
  }, []);

  // 📡 FETCH SIMPLES (EXEMPLO)
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const url = `${user.url}/player_api.php?username=${user.username}&password=${user.password}&action=get_vod_streams`;

        const res = await fetch(url);
        const json = await res.json();

        setData(json);
      } catch (err) {
        console.log('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // 🔒 BLOQUEIA RENDER ATÉ VALIDAR LOGIN
  if (!isAuthReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 40) / 3;
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/player',
          params: { id: item.stream_id },
        })
      }
      style={{
        width: itemWidth,
        marginBottom: 12,
        backgroundColor: '#1F1F1F',
        padding: 10,
        borderRadius: 8,
      }}
    >
      <Text style={{ color: '#fff' }}>{item.name}</Text>
    </TouchableOpacity>
  );

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 40) / 3;

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
      {/* 🔥 HEADER CORRIGIDO */}
      <View
        pointerEvents="box-none"
        style={{
          paddingTop: 40,
          paddingBottom: 10,
          alignItems: 'center',
          backgroundColor: '#0F0F0F',
          zIndex: 10,
          elevation: 10,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 18 }}>
          King IPTV
        </Text>
      </View>

      {/* 📦 LISTA */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#7C3AED"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
  data={data || []}
  keyExtractor={(item, index) =>
    item?.stream_id?.toString() || index.toString()
  }
  renderItem={renderItem}
  numColumns={3}
  contentContainerStyle={{
    padding: 10,
  }}
/>
}
