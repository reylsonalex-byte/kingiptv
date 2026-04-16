import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, View } from 'react-native';

export default function Perfil() {
  const router = useRouter();
  const [parentalLock, setParentalLock] = useState(false);
  const [externalPlayer, setExternalPlayer] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    carregarPreferencias();
  }, []);

  const carregarPreferencias = async () => {
    try {
      const login = await AsyncStorage.getItem('@iptv_login');
      const playerPref = await AsyncStorage.getItem('@pref_external_player');
      const parentalPref = await AsyncStorage.getItem('@pref_parental');
      
      if (login) setUserData(JSON.parse(login));
      if (playerPref) setExternalPlayer(JSON.parse(playerPref));
      if (parentalPref) setParentalLock(JSON.parse(parentalPref));
    } catch (e) {
      console.error("Erro ao carregar preferências", e);
    }
  };

  const toggleSwitch = async (key: string, value: boolean, setter: any) => {
    setter(value);
    await AsyncStorage.setItem(key, JSON.stringify(value));
    // Dica: No player de vídeo, você vai ler '@pref_external_player' para saber se abre o VLC ou o player interno.
  };

  const limparCache = async () => {
    Alert.alert("Otimização", "Deseja limpar o cache de capas e dados temporários?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Limpar", onPress: () => Alert.alert("Sucesso", "O app ficou mais leve!") }
    ]);
  };

  const logout = async () => {
    Alert.alert("Sair", "Deseja desconectar sua conta KingIPTV?", [
      { text: "Ficar" },
      { text: "Sair", style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem('@iptv_login');
          router.replace('/');
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minha Conta</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* CARD DO USUÁRIO */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <FontAwesome5 name="user-crown" size={26} color="#7C3AED" />
          </View>
          <View>
            <Text style={styles.userName}>{userData?.username || 'Usuário King'}</Text>
            <Text style={styles.userStatus}>● Assinatura Ativa</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>PREFERÊNCIAS</Text>
        <View style={styles.menuGroup}>
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <MaterialCommunityIcons name="play-box-outline" size={24} color="#7C3AED" />
              <View>
                <Text style={styles.optionText}>Player Externo</Text>
                <Text style={styles.optionSub}>Usar VLC ou MX Player</Text>
              </View>
            </View>
            <Switch 
              value={externalPlayer} 
              onValueChange={(v) => toggleSwitch('@pref_external_player', v, setExternalPlayer)}
              trackColor={{ false: "#333", true: "#7C3AED" }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.option, { borderTopWidth: 1, borderTopColor: '#1C1C22' }]}>
            <View style={styles.optionLeft}>
              <MaterialCommunityIcons name="shield-lock" size={24} color="#7C3AED" />
              <View>
                <Text style={styles.optionText}>Bloqueio Parental</Text>
                <Text style={styles.optionSub}>Ocultar conteúdo 18+</Text>
              </View>
            </View>
            <Switch 
              value={parentalLock} 
              onValueChange={(v) => toggleSwitch('@pref_parental', v, setParentalLock)}
              trackColor={{ false: "#333", true: "#7C3AED" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>MANUTENÇÃO</Text>
        <View style={styles.menuGroup}>
          <Pressable style={styles.menuItem} onPress={limparCache}>
            <View style={styles.optionLeft}>
              <Ionicons name="flash-outline" size={22} color="#EAB308" />
              <Text style={styles.menuText}>Otimizar Sistema</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#444" />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => Alert.alert("Suporte", "Contate seu revendedor para renovar.")}>
            <View style={styles.optionLeft}>
              <Ionicons name="card-outline" size={22} color="#7C3AED" />
              <Text style={styles.menuText}>Dados da Assinatura</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#444" />
          </Pressable>
        </View>

        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>SAIR DA CONTA</Text>
        </Pressable>
        
        <Text style={styles.version}>KingIPTV v2.0.4 - Premium Edition</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 25, backgroundColor: '#0B0B0F' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: '#141418', padding: 20, borderRadius: 20, marginBottom: 25, borderWidth: 1, borderColor: '#1C1C22' },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#7C3AED22', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#7C3AED44' },
  userName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  userStatus: { color: '#22C55E', fontSize: 12, fontWeight: '600', marginTop: 2 },
  sectionLabel: { color: '#444', fontSize: 11, fontWeight: '900', marginBottom: 10, marginLeft: 5, letterSpacing: 1 },
  menuGroup: { backgroundColor: '#141418', borderRadius: 20, paddingHorizontal: 15, marginBottom: 25, borderWidth: 1, borderColor: '#1C1C22' },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  optionSub: { color: '#666', fontSize: 12 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 },
  menuText: { color: '#fff', fontSize: 15 },
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 18, borderRadius: 15, backgroundColor: '#EF444411', borderWidth: 1, borderColor: '#EF444422' },
  logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 14 },
  version: { textAlign: 'center', color: '#333', fontSize: 10, marginTop: 20, letterSpacing: 1 }
});