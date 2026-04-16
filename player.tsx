import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as IntentLauncher from 'expo-intent-launcher';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video'; // Nova API
import React, { useEffect } from 'react';
import { Alert, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function Player() {
  const router = useRouter();
  const { dns, user, pass, tipo, streamId, name } = useLocalSearchParams();

  // Montagem da URL
  const urlVideo = `${dns}/${tipo === 'live' ? 'live' : 'movie'}/${user}/${pass}/${streamId}.ts`;

  // Configuração do Player Moderno
  const player = useVideoPlayer(urlVideo, (player) => {
    player.loop = false;
    player.play();
  });

  // --- CORREÇÃO DO ÁUDIO FANTASMA ---
  useEffect(() => {
    return () => {
      // No expo-video, basta pausar ou deixar que o hook limpe a instância
      player.pause();
    };
  }, [player]);

  const abrirVLC = async () => {
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: urlVideo,
        type: 'video/*',
        packageName: 'org.videolan.vlc',
      });
    } catch (e) {
      Alert.alert("VLC não encontrado", "Instale o VLC na Play Store.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* O VideoView é muito mais performático que o Video antigo */}
      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        allowsPictureInPicture
        startsPictureInPictureAutomatically
      />

      {/* OVERLAY DE CONTROLES CUSTOMIZADOS */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.vlcBtn} onPress={abrirVLC}>
          <MaterialCommunityIcons name="vlc" size={24} color="#fff" />
          <Text style={styles.vlcText}>ABRIR NO VLC</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.title}>{name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  backBtn: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 30 },
  vlcBtn: { 
    backgroundColor: '#FF8800', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderRadius: 25,
    gap: 8
  },
  vlcText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  title: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: '500' }
});