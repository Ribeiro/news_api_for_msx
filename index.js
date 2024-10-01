const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const https = require('https');
const url = 'https://newsapi.org/v2/top-headlines?sources=google-news-br&apiKey=d7a84374023c4d55991de13dba98f20f';

const formatDateToMSX = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' };
    return new Date(date).toLocaleString('pt-BR', options).replace(',', '');
};

const wrapText = (text, maxLength) => {
    const regex = new RegExp(`(.{1,${maxLength}})`, 'g');
    return text.match(regex).join('\n');
};

app.get('/news', (req, res) => {
    fetch(url, {
        method: 'GET',
        headers: {
            'User-Agent': 'NewsApiForMsx/1.0',
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        //let json = JSON.parse(data)
        const result = data.articles.map(article => {
            const formattedDate = formatDateToMSX(article.publishedAt);
        
            // Limitação de 40 colunas por linha
            const maxLength = 40;
        
            const author = wrapText(`Autor: ${article.author}`, maxLength);
            const title = wrapText(`Título: ${article.title}`, maxLength);
            const publishedAt = wrapText(`Publicado em: ${formattedDate}`, maxLength);
        
            return `${author}\n\n${title}\n\n${publishedAt}\n\n---------------------------------`;
        }).join('\n\n');
        
        res.send(result);
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});

app.listen(port, () => {
  console.log(`New API for MSX is running on http://localhost:${port}`);
});