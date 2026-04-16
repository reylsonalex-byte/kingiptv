import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

  // ✅ TAMANHO DOS CARDS (ANTES DE USAR)
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 40) / 3;

  // 🔐 AUTH CORRIGIDO
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem('@iptv_login');

        if (!stored) {
          router.replace('/');
          return;
        }

        setUser(JSON.parse(stored));
      } catch (e) {
        router.replace('/');
      } finally {
        setIsAuthReady(true);
      }
    };

    checkAuth();
  }, []);

  // 📡 BUSCA DADOS
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const url = `${user.url}/player_api.php?username=${user.username}&password=${user.password}&action=get_vod_streams`;

        const res = await fetch(url);
        const json = await res.json();

        setData(Array.isArray(json) ? json : []);
      } catch (err) {
        console.log('Erro:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // 🔒 BLOQUEIA RENDER
  if (!isAuthReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  // 🎬 ITEM
  const renderItem = ({ item }: any) => {
    if (!item) return null;

    return (
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
        <Text style={{ color: '#fff' }}>
          {item.name || 'Sem nome'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
      {/* ✅ HEADER SEM BLOQUEAR TOQUE */}
      <View
        pointerEvents="box-none"
        style={{
          paddingTop: 40,
          paddingBottom: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 18 }}>
          King IPTV
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#7C3AED"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) =>
            item?.stream_id?.toString() || index.toString()
          }
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={{ padding: 10 }}
        />
      )}
    </View>
  );
}
