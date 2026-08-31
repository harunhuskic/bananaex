import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';

// Glavna komponenta za 3D prikaz Zemlje
export default function Globe3D({ darkMode, rates, onCountryClick }) {
    const globeEl = useRef();
    const [countries, setCountries] = useState({ features: [] });
    const [hoverD, setHoverD] = useState();

    useEffect(() => {
        // Učitava podatke o granicama država
        // Load country polygons
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(setCountries);
    }, []);

    const containerRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        // Prilagođava veličinu globusa prozoru
        // Resize Observer to handle responsive sizing
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.5;
            // Force resize update
            globeEl.current.pointOfView({ altitude: 2.5 });
        }
    }, [globeEl.current]);

    // Mapira ISO kod države na njenu valutu
    // Extended mapping of ISO A3 country codes to Currency Codes
    const getCurrencyForCountry = (isoA3) => {
        const map = {
            'USA': 'USD', 'GBR': 'GBP', 'DEU': 'EUR', 'FRA': 'EUR', 'ITA': 'EUR', 'ESP': 'EUR',
            'JPN': 'JPY', 'CHE': 'CHF', 'CAN': 'CAD', 'AUS': 'AUD', 'BIH': 'BAM',
            'CHN': 'CNY', 'IND': 'INR', 'BRA': 'BRL', 'RUS': 'RUB', 'ZAF': 'ZAR',
            'MEX': 'MXN', 'TUR': 'TRY', 'SWE': 'SEK', 'NOR': 'NOK', 'DNK': 'DKK',
            'FIN': 'EUR', 'GRC': 'EUR', 'IRL': 'EUR', 'NLD': 'EUR', 'PRT': 'EUR',
            'AUT': 'EUR', 'BEL': 'EUR', 'CYP': 'EUR', 'EST': 'EUR', 'LVA': 'EUR',
            'LTU': 'EUR', 'LUX': 'EUR', 'MLT': 'EUR', 'SVK': 'EUR', 'SVN': 'EUR',
            'BGR': 'BGN', 'HRV': 'EUR', 'CZE': 'CZK', 'HUN': 'HUF', 'POL': 'PLN',
            'ROU': 'RON', 'IDN': 'IDR', 'MYS': 'MYR', 'PHL': 'PHP', 'SGP': 'SGD',
            'THA': 'THB', 'KOR': 'KRW', 'HKG': 'HKD', 'NZL': 'NZD', 'ISR': 'ILS'
        };
        return map[isoA3] || null;
    };

    // Generiše HTML za tooltip kada se pređe mišem preko države
    const getPolygonLabel = (d) => {
        const currency = getCurrencyForCountry(d.properties.ISO_A3);
        const rate = currency && rates && rates[currency] ? rates[currency].toFixed(2) : 'N/A';

        // Improved Tooltip Design
        return `
            <div style="
                background: ${darkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)'}; 
                color: ${darkMode ? '#fff' : '#0f172a'}; 
                padding: 12px 16px; 
                border-radius: 12px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                font-family: system-ui, -apple-system, sans-serif;
                border: 1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
                backdrop-filter: blur(8px);
                min-width: 150px;
                transform: translateY(-20px);
            ">
                <div style="font-size: 14px; font-weight: 800; margin-bottom: 4px; opacity: 0.9;">
                    ${d.properties.ADMIN}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.5px;">Currency</span>
                    <span style="font-size: 11px; font-weight: 700; background: ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}; padding: 2px 6px; border-radius: 4px;">
                        ${currency || '---'}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.5px;">Rate</span>
                    <span style="font-size: 18px; font-weight: 900; ${rate !== 'N/A' ? (rate > 1 ? 'color: #10b981;' : 'color: #f43f5e;') : ''}">
                        ${rate}
                    </span>
                </div>
            </div>
        `;
    };

    // Upravlja klikom na državu i šalje odabranu valutu nazad
    const handlePolygonClick = (d) => {
        const currency = getCurrencyForCountry(d.properties.ISO_A3);
        if (currency && onCountryClick) {
            onCountryClick(currency);
        }
    };

    return (
        <div ref={containerRef} className={`rounded-[2.5rem] overflow-hidden border transition-all h-[500px] relative ${darkMode ? 'bg-[#112240]/50 border-white/5' : 'bg-white shadow-xl shadow-blue-100/50 border-white'}`}>
            <div className="absolute top-6 left-8 z-10 pointer-events-none">
                <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>Global Currency View</h3>
                <p className={`text-sm font-bold opacity-60 ${darkMode ? 'text-white' : 'text-slate-500'}`}>Interactive 3D Market Visualization</p>
                <p className={`text-[10px] mt-2 font-bold opacity-40 uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-500'}`}>Click Country to View Chart</p>
            </div>

            <Globe
                ref={globeEl}
                width={dimensions.width}
                height={dimensions.height}
                globeImageUrl={darkMode ? "//unpkg.com/three-globe/example/img/earth-night.jpg" : "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"}
                backgroundImageUrl={darkMode ? "//unpkg.com/three-globe/example/img/night-sky.png" : null}
                backgroundColor="rgba(0,0,0,0)"
                polygonsData={countries.features}
                polygonAltitude={d => d === hoverD ? 0.12 : 0.06}
                polygonCapColor={d => d === hoverD ? (darkMode ? 'rgba(6, 182, 212, 0.9)' : 'rgba(14, 165, 233, 0.9)') : (darkMode ? 'rgba(255,255,255, 0.08)' : 'rgba(255,255,255, 0.2)')}
                polygonSideColor={() => 'rgba(0, 0, 0, 0.05)'}
                polygonStrokeColor={() => '#111'}
                polygonLabel={getPolygonLabel}
                onPolygonHover={setHoverD}
                onPolygonClick={handlePolygonClick}
                polygonsTransitionDuration={300}
            />
        </div>
    );
}
