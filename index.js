const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const https = require('https');
const apiKey = 'd7a84374023c4d55991de13dba98f20f';
const notAvailable = 'N/A';

const formatDateToMSX = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', 
                      hour: '2-digit', minute: '2-digit', second: '2-digit', 
                      hour12: false, timeZone: 'America/Sao_Paulo' };
    return new Date(date).toLocaleString('pt-BR', options).replace(',', '');
};

const wrapText = (text, maxLength) => {
    const regex = new RegExp(`(.{1,${maxLength}})`, 'g');
    return text.match(regex).join('\n');
};

const removeAccents = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/g, 'c').replace(/Ç/g, 'C');
};

app.get('/news', (req, res) => {
    //const url = `https://newsapi.org/v2/everything?sources=google-news-br&from=${todayString}&sortBy=publishedAt&apiKey=${apiKey}`;
    const url = `https://newsapi.org/v2/everything?q=Brasil&sortBy=publishedAt&apiKey=${apiKey}`;

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
        const result = data.articles.map(article => {
            const formattedDate = formatDateToMSX(article.publishedAt);
            const maxLength = 40;

            let a = article.author ? article.author : notAvailable;
            let t = article.title ? article.title : notAvailable;
        
            const author = wrapText(removeAccents(`Autor: ${a}`), maxLength);
            const title = wrapText(removeAccents(`Titulo: ${t}`), maxLength);
            const publishedAt = wrapText(removeAccents(`Publicado em: ${formattedDate}`), maxLength);
        
            return `${author}\n\n${title}\n\n${publishedAt}\n\n---------------------------------`;
        }).join('\n\n');
        
        res.send(result);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

app.listen(port, () => {
  console.log(`New API for MSX is running on http://localhost:${port}`);
});