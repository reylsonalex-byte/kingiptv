import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Login() {
  const [url, setUrl] = useState('');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!url || !user || !pass) return alert("Preencha todos os campos!");
    
    try {
      const loginData = { url, username: user, password: pass };
      await AsyncStorage.setItem('@iptv_login', JSON.stringify(loginData));
      router.replace('/dashboard');
    } catch (e) {
      alert("Erro ao salvar login");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>KING<Text style={{color:'#7C3AED'}}>IPTV</Text></Text>
      <TextInput placeholder="http://seu-dns.com:8080" placeholderTextColor="#666" style={styles.input} value={url} onChangeText={setUrl} autoCapitalize="none" />
      <TextInput placeholder="Usuário" placeholderTextColor="#666" style={styles.input} value={user} onChangeText={setUser} autoCapitalize="none" />
      <TextInput placeholder="Senha" placeholderTextColor="#666" style={styles.input} value={pass} secureTextEntry onChangeText={setPass} />
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>ENTRAR NO REINO</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F', justifyContent: 'center', padding: 30 },
  logo: { color: '#fff', fontSize: 40, fontWeight: '900', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#1C1C22', color: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#7C3AED', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});