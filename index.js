const http = require('http');
const url = require('url');
const puppeteer = require("puppeteer");

let browser;
(async () => {
    browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']})
	// browser = await puppeteer.launch({
        // headless: false,
        // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    // });
})();

const QUERY_URL = 'https://wort.ir/woerterbuch/woerter?q=';
const QUERY_API_URL = 'https://api.wort.ir/api/vocab/search/de-fa/de?query=';
const DETAILS_URL = 'https://wort.ir/woerterbuch/deutsch-persisch/';
const DETAILS_API_URL = 'https://api.wort.ir/api/vocab/details/de?slug=/woerterbuch/deutsch-persisch/';

async function wortRequest(word, page_url, api_url) {
    let json;
    let page;
    try {
        page = await browser.newPage();
        await page.goto(page_url + word);
        console.log(page_url + word);

        const response = await page.waitForResponse(r => {
            return (r.url() === api_url + word) && r.status() === 200;
        }, { timeout: 10000 });

        json = await response.json();

    } catch (e) {
        console.log(e.message);
        json = { error: e.message };
    }
    finally {
        await page.close();
    }
    return json;
}

const server = http.createServer(async (req, res) => {
    const parsed = url.parse(req.url, true);
    let response = { error: "no query string 'word=?'" };
    if(parsed.query && parsed.query.word) {
        const key = parsed.query.word;
        const [ query, details ]= await Promise.all([
            wortRequest(key, QUERY_URL, QUERY_API_URL),
            wortRequest(key, DETAILS_URL, DETAILS_API_URL),
        ]);
        response = { details, query };
    }

    // res.writeHeader(200, {"Content-Type": "application/json; charset=utf-8"});
    res.writeHeader(200, {"Content-Type": "text/html; charset=utf-8"});
    // res.setHeader("Content-Type", "application/json; charset=utf-8");
	res.end(`
<!doctype html>
<html lang=en>
<head>
<meta charset=utf-8>
<title>blah</title>
</head>
<body>

<p>I'm the content</p>
<code>${
    JSON.stringify(response)
}</code>

</body>
</html>
`
    );
});

server.listen(8081, '0.0.0.0');
console.log('listening on 0.0.0.0:8081/');

