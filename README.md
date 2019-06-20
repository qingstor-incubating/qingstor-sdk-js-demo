# QingStor SDK JS Demo

## Uasge

### Clone this repo

```bash
git clone
```

### Setup signature server

```bash
cd signature_server
npm install
# Update server config into valid value
cp server_config.yaml.example server_config.yaml
npm run server
```

Now, we have a signature server locally.

### Use sdk on browser

```bash
cd web_with_signature_server
# Update config.js into valid value
cp config.js.example config.js
```

Visit `index.html` and open devtools to read logs.

### Use sdk to do multipart upload on browser

```bash
cd web_multipart_with_signature_server
# Update config.js into valid value
cp config.js.example config.js
```

Visit `index.html` and open devtools to read logs.
