const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');

const [,, FILENAME] = process.argv;

function fetchURLContent(urlStr) {
    return new Promise((resolve, reject) => {
        const parsedUrl = url.parse(urlStr);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        
        protocol.get(urlStr, (response) => {
            if (response.statusCode !== 200) {
                reject(`Failed to get '${urlStr}' (Status Code: ${response.statusCode})`);
                return;
            }

            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(`Failed to get '${urlStr}' (${err.message})`);
        });
    });
}

function saveContentToFile(hostname, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(hostname, content, (err) => {
            if (err) {
                reject(`Failed to write to file '${hostname}' (${err.message})`);
            } else {
                resolve();
            }
        });
    });
}
fs.readFile(FILENAME, 'utf8', async (err, data) => {
    if (err) {
        console.error(`Error reading file '${FILENAME}': ${err.message}`);
        process.exit(1);
    }

    const urls = data.split('\n').filter(line => line.trim() !== '');
    for (const urlStr of urls) {
        const parsedUrl = url.parse(urlStr);
        const hostname = parsedUrl.hostname;

        try {
            const content = await fetchURLContent(urlStr);
            await saveContentToFile(hostname, content);
            console.log(`Successfully saved content from '${urlStr}' to '${hostname}'`);
        } catch (error) {
            console.error(error);
        }
    }
});
