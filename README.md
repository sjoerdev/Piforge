# ⬡ PiForge — Custom Raspberry Pi Builds Website

Professionele website voor het aanbieden van custom Raspberry Pi builds.
Volledig lokaal te draaien op je eigen Raspberry Pi met Node.js.

## 🚀 Installatie & starten

### Vereisten
- Node.js 14+ (geïnstalleerd op je Pi: `sudo apt install nodejs`)
- Geen npm packages nodig — puur Node.js standaardbibliotheek

### Stappen

```bash
# 1. Kopieer de map naar je Pi (of unzip hier)
cd piforge-website

# 2. Start de server
node server.js

# 3. Open in browser
# Lokaal:  http://localhost:3000
# Netwerk: http://<ip-van-je-pi>:3000
```

### Automatisch starten bij boot (optioneel)

```bash
# Met PM2 (aanbevolen)
npm install -g pm2
pm2 start server.js --name piforge
pm2 startup
pm2 save

# Of met systemd service
sudo nano /etc/systemd/system/piforge.service
```

**systemd service bestand:**
```ini
[Unit]
Description=PiForge Website
After=network.target

[Service]
ExecStart=/usr/bin/node /home/pi/piforge-website/server.js
WorkingDirectory=/home/pi/piforge-website
Restart=always
User=pi
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable piforge
sudo systemctl start piforge
```

## 📁 Bestandsstructuur

```
piforge-website/
├── server.js          ← Node.js webserver (geen dependencies!)
├── package.json       ← Project info
├── README.md          ← Dit bestand
└── public/
    ├── index.html     ← Volledige website (één pagina)
    ├── style.css      ← Alle styling
    └── app.js         ← Animaties, formulier, interactie
```

## ✏️ Aanpassen

- **Bedrijfsnaam / logo:** zoek `PiForge` in `index.html` en vervang
- **E-mailadres:** zoek `info@piforge.nl` in `index.html`
- **Kleuren:** pas CSS variabelen aan in `style.css` (:root sectie)
- **Builds toevoegen:** kopieer een `.build-card` blok in `index.html`
- **Poort wijzigen:** `PORT=8080 node server.js` of in server.js

## 🎨 Design

- **Donker thema** met raspberry-rood en circuit-groen accenten
- **Animerende circuit-board** achtergrond (canvas)
- **Scroll reveal** animaties op cards
- **4-stappen configurator** formulier
- **Volledig responsive** (mobiel, tablet, desktop)
- **Geen externe dependencies** — werkt offline!

## 🌐 Bereikbaar via internet (optioneel)

```bash
# Via Cloudflare Tunnel (gratis, veilig)
cloudflared tunnel --url http://localhost:3000

# Of via ngrok
ngrok http 3000
```
