import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function Player() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔐 CARREGA STREAM
  useEffect(() => {
    const loadStream = async () => {
      try {
        const stored = await AsyncStorage.getItem('@iptv_login');

        if (!stored) {
          router.replace('/');
          return;
        }

        const user = JSON.parse(stored);

        // 🔥 AJUSTA AQUI
        const url = `${user.url}/movie/${user.username}/${user.password}/${id}.mp4`;

        setStreamUrl(url);
      } catch (err) {
        console.log('Erro ao montar stream:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStream();
  }, []);

  // ⏳ LOADING PRIMEIRO (ANTES DO PLAYER EXISTIR)
  if (loading || !streamUrl) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
        }}
      >
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={{ color: '#fff', marginTop: 10 }}>
          Carregando vídeo...
        </Text>
      </View>
    );
  }

  // 🎥 AGORA SIM cria o player (URL garantida)
  const player = useVideoPlayer(streamUrl, (p) => {
    p.play();
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <VideoView
        player={player}
        style={{ flex: 1 }}
      />
    </View>
  );
}
