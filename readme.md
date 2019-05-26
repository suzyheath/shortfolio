# Shortfolio

Shortfolio allows anyone to create their own clean and professional personal website, and have it hosted as a page on the shortfolio site.

## Server instructions

Server is running on a Microsoft Azure VM.

It runs on port 8080 so ports 80 and 443 need to be redirected;

```
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 8080
```

The npm package [forever](https://github.com/foreverjs/forever) is used to run the server in background through the ssh terminal.

```
forever start server/index.js
```

Use `forever list` to see currently running processes.

### HTTPS

Install [certbot](https://certbot.eff.org/) on the VM.

```
sudo certbot certonly --webroot -w /home/lh16421/shortfolio/public/ -d shortfolio.site -d www.shortfolio.site
```

To pull this off the website needs to be accessible via standard HTTP, rather than HTTPS.

Once generated, put the paths to the key and cert files into environment variables HTTPS_KEY and HTTPS_CERT respectively.