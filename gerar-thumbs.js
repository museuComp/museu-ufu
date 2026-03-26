const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Caminho para a pasta onde estão suas imagens
// Se o seu Angular for mais antigo (pasta assets), mude para './src/assets/itens'
const diretorioImagens = 'src/public/itens'; 

// Largura da miniatura (400px é um ótimo tamanho para o seu grid)
const LARGURA_THUMB = 400;

// Lê todos os arquivos da pasta
fs.readdir(diretorioImagens, (err, arquivos) => {
  if (err) {
    return console.error('Erro ao ler a pasta:', err);
  }

  arquivos.forEach(arquivo => {
    // Filtra para pegar apenas imagens e ignorar os thumbs que já existem
    if (arquivo.match(/\.(jpg|jpeg|png)$/i) && !arquivo.includes('_thumb')) {
      
      const caminhoOriginal = path.join(diretorioImagens, arquivo);
      const nomeSemExtensao = path.parse(arquivo).name;
      const extensao = path.parse(arquivo).ext;
      
      // Monta o novo nome com _thumb (ex: gravador_thumb.jpg)
      const nomeThumb = `${nomeSemExtensao}_thumb${extensao}`;
      const caminhoThumb = path.join(diretorioImagens, nomeThumb);

      // Redimensiona e salva
      sharp(caminhoOriginal)
        .resize({ width: LARGURA_THUMB }) // A altura é calculada automaticamente
        .jpeg({ quality: 80 }) // Otimiza a qualidade para web
        .toFile(caminhoThumb)
        .then(() => {
          console.log(`✅ Miniatura criada: ${nomeThumb}`);
        })
        .catch(erro => {
          console.error(`❌ Erro ao processar ${arquivo}:`, erro);
        });
    }
  });
});