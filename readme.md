# Shortfolio

Shortfolio allows anyone to create their own clean and professional personal website, and have it hosted as a page on the shortfolio site.

## Server instructions

Server is running on a Microsoft Azure VM.

It runs on port 3000. We forward https requests from port 443 to 3000. For some reason http requests from port 80 sort themselves out without help.

```
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 3000
```

To view these rules use `iptables -L -t nat`.

To delete the first rule from the PREROUTING chain use `sudo iptables -t nat -D PREROUTING 1`.

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

In order for node to read these files it needs higher level permissions, so `sudo` it up.