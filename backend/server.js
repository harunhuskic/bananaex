const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Base URL for Frankfurter API
const API_BASE_URL = 'https://api.frankfurter.app';

// Ruta za provjeru statusa servera
app.get('/', (req, res) => {
    res.send('Currency Converter API is running (Fiat Only + BAM Support)');
});

/**
 * GET /api/latest
 * Get latest rates.
 * Injects BAM (pegged to EUR) if missing.
 */
/**
 * GET /api/latest
 * Dohvata najnovije kurseve i dodaje BAM ako nedostaje.
 * Injects BAM (pegged to EUR) if missing.
 */
app.get('/api/latest', async (req, res) => {
    try {
        const from = req.query.from || 'USD';
        const to = req.query.to;

        // Prepare params for Frankfurter
        // CRITICAL: Frankfurter might error if we send 'BAM'. Remove it from upstream request.
        let upstreamTo = to;

        if (to) {
            let toList = to.split(',');
            // Remove BAM from list sent to API
            toList = toList.filter(c => c !== 'BAM');

            // Ensure EUR is present to calculate BAM (since BAM is EUR pegged)
            if (!toList.includes('EUR') && from !== 'EUR') {
                toList.push('EUR');
            }
            upstreamTo = toList.join(',');
        }

        const params = { from };
        if (upstreamTo && upstreamTo.length > 0) {
            params.to = upstreamTo;
        } else if (!upstreamTo && to) {
            // If user asked ONLY for BAM, upstreamTo is empty. 
            // We need at least one currency to get a valid response from Frankfurter if 'from' is not EUR?
            // Actually Frankfurter default is ALL if no 'to'. 
            // But if we want to calculate BAM (from EUR), ensuring EUR is in response is handled below.
            // If from=USD and to=BAM, upstreamTo='EUR' (pushed above).
        }

        const response = await axios.get(`${API_BASE_URL}/latest`, { params });
        const data = response.data;

        // Custom BAM Injection (1 EUR = 1.95583 BAM)
        const BAM_PEG = 1.95583;

        // Calculate Rate: How many BAM for 1 'from'?
        let bamRate = 0;

        if (from === 'EUR') {
            bamRate = BAM_PEG;
        } else if (from === 'BAM') {
            // If base is BAM, calculation is harder without inversion, but dashboard usually asks base=USD
            // We'll leave this edge case for now.
        } else {
            // base is USD (or other). We need Rate(USD->BAM).
            // We have Rate(USD->EUR) in data.rates.EUR
            // 1 USD = X EUR.
            // 1 EUR = 1.95583 BAM.
            // 1 USD = X * 1.95583 BAM.
            if (data.rates.EUR) {
                bamRate = data.rates.EUR * BAM_PEG;
            }
        }

        // Inject BAM if we managed to calculate it
        if (bamRate > 0) {
            data.rates.BAM = bamRate;
        }

        // Final Filter: Ensure we return exactly what was asked + BAM if asked
        if (to) {
            const requested = to.split(',');
            const filtered = {};
            requested.forEach(c => {
                if (data.rates[c]) filtered[c] = data.rates[c];
            });
            // Implicitly add BAM if it was in the original 'to' list
            if (to.includes('BAM') && data.rates.BAM) {
                filtered.BAM = data.rates.BAM;
            }
            data.rates = filtered;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching latest rates:', error.message);
        if (error.response) {
            console.error('Upstream Status:', error.response.status);
            console.error('Upstream Data:', error.response.data);
            console.error('Params Sent:', params);
        }
        // If upstream fails, we can't do much.
        res.status(500).json({ error: 'Failed to fetch rates' });
    }
});

/**
 * GET /api/convert
 * Convert amount from one currency to another.
 * Handles BAM conversion manually.
 */
/**
 * GET /api/convert
 * Konvertuje iznos iz jedne valute u drugu.
 * Convert amount from one currency to another.
 * Handles BAM conversion manually.
 */
app.get('/api/convert', async (req, res) => {
    try {
        const { amount, from, to } = req.query;
        if (!amount || !from || !to) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        // Self-call logic via axios to leverage the injected rates in /latest
        // This handles "USD -> BAM" correctly because /latest?from=USD returns BAM.
        // It does NOT automatically handle "BAM -> USD" unless we add logic there.

        // Let's rely on /latest logic for "From != BAM".
        if (from !== 'BAM') {
            const response = await axios.get(`http://localhost:${PORT}/api/latest`, {
                params: { from, to }
            });

            const rate = response.data.rates[to];
            if (rate) {
                res.json({
                    amount: parseFloat(amount),
                    base: from,
                    date: new Date().toISOString().split('T')[0],
                    rates: { [to]: parseFloat(amount) * rate }
                });
                return;
            }
        }

        // Handle "From BAM" (BAM -> USD) manually if needed
        if (from === 'BAM') {
            // 1 BAM = (1/1.95583) EUR.

            let rateEurToTarget = 0;

            if (to === 'EUR') {
                rateEurToTarget = 1;
            } else {
                // Convert BAM -> EUR -> To.
                const eurResp = await axios.get(`${API_BASE_URL}/latest`, { params: { from: 'EUR', to } });
                rateEurToTarget = eurResp.data.rates[to];
            }

            if (rateEurToTarget || to === 'EUR') {
                const amountInEur = parseFloat(amount) / 1.95583;
                let result = 0;

                if (to === 'EUR') {
                    result = amountInEur;
                } else {
                    result = amountInEur * rateEurToTarget;
                }

                res.json({
                    amount: parseFloat(amount),
                    base: from,
                    date: new Date().toISOString().split('T')[0],
                    rates: { [to]: result }
                });
                return;
            }
        }

        // Directly proxy if no BAM involved (just in case)
        const response = await axios.get(`${API_BASE_URL}/latest`, {
            params: { amount, from, to }
        });
        res.json(response.data);

    } catch (error) {
        console.error('Conversion error:', error.message);
        // Don't crash on standard error, try to return useful message
        res.status(500).json({ error: 'Conversion failed' });
    }
});

// Dohvata historijske podatke za grafove
app.get('/api/history', async (req, res) => {
    try {
        const from = req.query.from || 'USD';
        const to = req.query.to || 'EUR';
        const days = parseInt(req.query.days) || 30;

        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        const formatDate = (date) => date.toISOString().split('T')[0];

        // BAM History Logic (Synthesized from EUR)
        if (from === 'BAM' || to === 'BAM') {
            const peg = 1.95583;

            // Case 1: BAM -> Other (e.g. BAM -> USD)
            // Logic: Fetch EUR -> USD. Then (EUR->USD) / 1.95583 = (BAM->USD)
            if (from === 'BAM') {
                try {
                    const response = await axios.get(`${API_BASE_URL}/${formatDate(start)}..${formatDate(end)}`, {
                        params: { from: 'EUR', to }
                    });

                    const newRates = {};
                    Object.keys(response.data.rates).forEach(date => {
                        const rate = response.data.rates[date][to];
                        if (rate) {
                            newRates[date] = { [to]: rate / peg };
                        }
                    });

                    return res.json({
                        amount: 1,
                        base: 'BAM',
                        start_date: formatDate(start),
                        end_date: formatDate(end),
                        rates: newRates
                    });
                } catch (e) {
                    console.error('BAM history error', e.message);
                    return res.json({ rates: {} });
                }
            }

            // Case 2: Other -> BAM (e.g. USD -> BAM)
            // Logic: Fetch USD -> EUR. Then (USD->EUR) * 1.95583 = (USD->BAM)
            if (to === 'BAM') {
                try {
                    const response = await axios.get(`${API_BASE_URL}/${formatDate(start)}..${formatDate(end)}`, {
                        params: { from, to: 'EUR' }
                    });

                    const newRates = {};
                    Object.keys(response.data.rates).forEach(date => {
                        const rate = response.data.rates[date]['EUR'];
                        if (rate) {
                            newRates[date] = { 'BAM': rate * peg };
                        }
                    });

                    return res.json({
                        amount: 1,
                        base: from,
                        start_date: formatDate(start),
                        end_date: formatDate(end),
                        rates: newRates
                    });
                } catch (e) {
                    console.error('BAM history error', e.message);
                    return res.json({ rates: {} });
                }
            }
        }

        const response = await axios.get(`${API_BASE_URL}/${formatDate(start)}..${formatDate(end)}`, {
            params: { from, to }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching history:', error.message);
        if (error.response) {
            console.error('History Upstream Status:', error.response.status);
            console.error('History Upstream Data:', error.response.data);
            console.error('History Params:', { from, to, days });
        }
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Fetch News
// Dohvata finansijske vijesti sa Yahoo Finance
app.get('/api/news', async (req, res) => {
    try {
        const feed = await parser.parseURL(NEWS_FEED_URL);
        const news = feed.items.slice(0, 5).map(item => ({
            title: item.title,
            link: item.link,
            source: 'Yahoo Finance',
            pubDate: item.pubDate
        }));
        res.json(news);
    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
