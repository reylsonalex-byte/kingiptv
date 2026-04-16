import axios from 'axios';

export const getIptvData = async (url: string, user: string, pass: string, action: string) => {
  try {
    const baseUrl = url.trim().endsWith('/') ? url.trim().slice(0, -1) : url.trim();
    const finalUrl = `${baseUrl}/player_api.php`;
    
    const response = await axios.get(finalUrl, {
      params: {
        username: user.trim(),
        password: pass.trim(),
        action: action
      },
      // Aumentado para 30 segundos conforme sua análise de timeout
      timeout: 30000 
    });

    return response.data || [];
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      console.error('O tempo de resposta do servidor KingIPTV excedeu 30s.');
    } else {
      console.error("Erro na comunicação com a API:", error.message);
    }
    
    // Retornamos null para que as telas (Dashboard/Detalhes) saibam que não há dados
    return null; 
  }
};