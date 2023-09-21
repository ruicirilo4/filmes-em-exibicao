const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const http = require('http');

// URL da página com os filmes em exibição
const url = 'https://filmspot.pt/filmes/';

// Realizar uma solicitação HTTP para obter o conteúdo da página
request(url, (error, response, html) => {
  if (!error && response.statusCode === 200) {
    // Carregar o HTML da página usando Cheerio
    const $ = cheerio.load(html);

    // Array para armazenar informações dos filmes
    const filmes = [];

    // Encontrar todos os elementos de filme na página
    $('.filmeLista').each((index, element) => {
      const $element = $(element);
      const titulo = $element.find('h2 a span:first-child').text().trim();
      const tituloOriginal = $element.find('h2 a span.tituloOriginal span').text().trim();
      const ano = $element.find('.zsmall').eq(0).text().trim();
      const genero = $element.find('.zsmall').eq(1).text().trim();
      const elenco = $element.find('.zsmall').eq(2).text().trim();
      const realizacao = $element.find('.zsmall').eq(3).text().trim();
      const distribuidor = $element.find('.filmeListaDistribuidor').text().trim();
      const trailerLink = $element.find('.filmeListaTrailerP a').attr('href');
      const capaLink = $element.find('.filmeListaPoster img').attr('src');

      // Adicionar informações do filme ao array
      filmes.push({
        titulo,
        tituloOriginal,
        ano,
        genero,
        elenco,
        realizacao,
        distribuidor,
        trailerLink,
        capaLink,
      });
    });

    // Gerar o HTML da página com os filmes
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f0f0f0;
              margin: 0;
              padding: 0;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            
            h1 {
              text-align: center;
            }
            
            .filme {
              background-color: #fff;
              border-radius: 10px;
              margin-bottom: 20px;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            
            img {
              max-width: 100%;
              height: auto;
            }
            
            h2 {
              text-align: center;
            }
          </style>
          <title>Filmes em Exibição</title>
      </head>
      <body>
          <div class="container">
            <h1>Filmes em Exibição</h1>
            ${filmes.map(filme => `
              <div class="filme">
                <img src="${filme.capaLink}" alt="${filme.titulo}">
                <h2>${filme.titulo}</h2>
                <p><strong>Título Original:</strong> ${filme.tituloOriginal}</p>
                <p><strong>Ano:</strong> ${filme.ano}</p>
                <p><strong>Gênero:</strong> ${filme.genero}</p>
                <p><strong>Elenco:</strong> ${filme.elenco}</p>
                <p><strong>Realização:</strong> ${filme.realizacao}</p>
                <p><strong>Distribuidor:</strong> ${filme.distribuidor}</p>
                <p><strong>Link do Trailer:</strong> <a href="https://filmspot.pt${filme.trailerLink}">Ver Trailer</a></p>
              </div>
            `).join('')}
          </div>
      </body>
      </html>
    `;

    // Escrever o conteúdo HTML em um arquivo
    fs.writeFileSync('index.html', htmlContent);

    // Iniciar o servidor web para exibir a página HTML
    const server = http.createServer((req, res) => {
      const html = fs.readFileSync('index.html', 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } else {
    console.error('Falha ao acessar a página.');
  }
});
