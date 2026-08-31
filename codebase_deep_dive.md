# BananaEx Codebase Deep Dive

---

## 1. Backend: `server.js` (The Brain)
**Purpose**: Acts as a proxy server to fetch data from the external API (`frankfurter.app`) and injects custom logic for currencies not supported natively (like BAM).

### Code Breakdown:
*   **Lines 1-4 (Imports)**:
    *   `express`: The web server framework for Node.js.
    *   `cors`: "Cross-Origin Resource Sharing". Allows your frontend (localhost:5173) to talk to this backend (localhost:5000) without browser security errors.
    *   `axios`: A library to make HTTP requests (like fetching data from Frankfurter).
    *   `dotenv`: Loads hidden variables (like API keys or PORT) from a `.env` file.
*   **Lines 24-111 (`/api/latest` Endpoint)**:
    *   **Goal**: Get current rates.
    *   **Lines 31-43**: Filters out `BAM` from the upstream request because the external API doesn't know it, but adds `EUR` so we can calculate it manually.
    *   **Lines 59-84 (The BAM Peg Logic)**:
        *   **Line 60**: `const BAM_PEG = 1.95583;` -> The official fixed exchange rate.
        *   **Line 77**: `bamRate = data.rates.EUR * BAM_PEG;` -> Calculates BAM rate derived from EUR.
        *   **Line 83**: `data.rates.BAM = bamRate;` -> Manually injects this simulated rate into the response.
*   **Lines 118-192 (`/api/convert` Endpoint)**:
    *   **Goal**: Convert specific amount.
    *   **Line 131**: Calls its own `/latest` endpoint to reuse the BAM logic (DRY Principle).
    *   **Lines 148-179**: Handles `From BAM` conversion manually by dividing by the peg (`amount / 1.95583`).

---

## 2. Frontend Core: `App.jsx` & Services

### `src/services/api.js`
*   **Line 3**: `API_BASE_URL = 'http://localhost:5000/api';` -> Points to your local backend.
*   **Line 9**: `getLatestRates` -> Wrapper function for fetching rates.

### `src/App.jsx` (Global State Manager)
*   **Lines 20-29 (Dark Mode)**: Checks `localStorage` or System Preference before paint to prevent "Flash of White".
*   **Line 47 (Auth)**: Listens for Supabase login using `onAuthStateChange`. If logged in, calls `fetchData(userId)`.
*   **Line 67 (Price Alerts)**:
    *   `setInterval(checkAlerts, 10000)`: Every 10 seconds, fetches 'USD' rates.
    *   **Line 87**: `Math.random() > 0.95`. Simulation logic for the demo to randomly trigger a notification, showing off features easily.
*   **Line 177 (`handleConversion`)**:
    *   **Optimistic UI**: Updates local `history` state immediately (Lines 179-185) so the app feels instant, *then* saves to Supabase (Lines 187-196) in the background.

---

## 3. Visualization Components

### `Dashboard.jsx` (The Controller)
*   **Purpose**: Manages the main view (Cards vs Globe).
*   **Line 26**: `useState('cards')` -> Controls which view is active.
*   **Line 77**: conditionally renders `<Globe3D />` or the Card Grid.

### `Globe3D.jsx` (The "Wow" Factor)
*   **Library**: Uses `react-globe.gl` (Three.js wrapper).
*   **Line 45 (`getCurrencyForCountry`)**: Maps Country Codes (ISO A3 like `USA`) to Currency Codes (`USD`). This is manual mapping because map data doesn't include currencies.
*   **Line 117 (`globeImageUrl`)**: Swaps texture URL based on `darkMode`. "Blue Marble" for light, "Earth Night Lights" for dark.
*   **Line 122 (`polygonCapColor`)**:
    *   `(d) => d === hoverD ? ... : ...`
    *   Dynamic coloring: If the country is hovered (`hoverD`), it turns Cyan. Otherwise, it's transparent white/black.

### `Graph.jsx`
*   **Library**: `recharts`.
*   **Line 17 (`useEffect`)**: When `from`, `to`, or `days` changes, it calls `getHistory`.
*   **Line 101 (`CustomTooltip`)**:
    *   Custom rendering for the hover tooltip on the chart.
    *   Uses `backdrop-blur-md` for that glass/frosted effect.
*   **Line 108 (`fill="url(#colorValue)"`)**:
    *   Uses the `<linearGradient>` defined in Lines 84-87 to create the fading blue area under the line.

### `CurrencyHeatmap.jsx`
*   **Data**: Currently uses static `HEATMAP_DATA` (Lines 4-13) for demo purposes.
*   **Line 32**: Generates a grid of colored tiles.
*   **Line 34/35**: Green gradient for positive change, Red gradient for negative.

---

## 4. Feature Components

### `Converter.jsx` (The Utility)
*   **Line 67 (`handleConvert`)**:
    *   Calls `convertCurrency` API.
    *   On success, calls `onConvert(data)` which bubbles up to `App.jsx` to save history.
*   **Lines 114 & 144 (Dark Mode Fix)**:
    *   `<option className={darkMode ? 'bg-[#112240]' ...}>`
    *   Explicitly styles dropdown options because native `<select>` dropdowns are notoriously hard to style in dark mode otherwise.

### `PriceAlerts.jsx`
*   **Lines 72-88**: Renders the list of active alerts.
*   **Line 61 (`e.preventDefault()`)**: Prevents the form from reloading the page when submitting.
*   **Line 81**: A pulsing green dot (`animate-pulse`) indicates the alert is "Active" and listening.

### `QuickSplit.jsx`
*   **Line 36 (`useEffect`)**:
    *   Debounce Logic: `setTimeout(calculate, 500)`.
    *   Waits 500ms after user stops typing before calling the API. Prevents spamming the server while typing numbers.
*   **Line 19**: Calculates share per person (Total / People).
*   **Line 23**: Converts that share from Bill Currency -> Your Currency.

### `BananaIndex.jsx` (Fun Feature)
*   **Concept**: Purchasing Power Parity demo. "How many Bananas/Big Macs can $50 buy in X city?"
*   **Lines 7-23 (`ITEMS`)**: Static data comparing prices in NYC, Berlin, Sarajevo.
*   **Line 58**: `Math.floor(budget / price)` -> Calculates quantity.
*   **Line 60**: `barHeight` -> Visualizes the quantity simply by setting pixel height.

### `Auth.jsx`
*   **Lines 20 & 28**:
    *   `supabase.auth.signUp` / `signInWithPassword`.
    *   Standard Supabase Auth methods. Handles all the secure token exchange automatically.

---

## 5. Database Schema (Supabase)
*   **`profiles`**: `id`, `theme`, `language`.
*   **`conversion_history`**: `id`, `user_id`, `from_currency`, `to_currency`, `amount`, `result`, `created_at`.
*   **`price_alerts`**: `id`, `user_id`, `pair`, `target_rate`, `condition` (above/below), `is_active`.
