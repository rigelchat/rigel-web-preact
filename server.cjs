require("dotenv").config({ path: ".env.production.local", quiet: true });

const fastify = require("fastify")();
const fs = require("fs");
const path = require("path");

const distPath = path.join(__dirname, "dist");

fastify.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send([
        "User-agent: *",
        "Disallow: /"
    ].join("\n"));
});

fastify.register(require("@fastify/static"), {
    root: distPath,
    prefix: "/",
    decorateReply: false,
    setHeaders: (res, filePath) => {
        if (filePath.includes("/assets/") || filePath.includes("\\assets\\")) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.endsWith("sw.js") || filePath.includes("workbox-")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Service-Worker-Allowed", "/");
        } else if (filePath.endsWith("manifest.webmanifest")) {
            res.setHeader("Cache-Control", "public, max-age=86400");
        } else if (filePath.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else {
            res.setHeader("Cache-Control", "public, max-age=3600");
        };
    }
});

fastify.setNotFoundHandler((req, res) => {
    const hasExtension = path.extname(req.url.split("?")[0]) !== "";
    if (hasExtension) {
        res.code(404).send();
        return;
    };

    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.type("text/html");
        res.send(fs.readFileSync(indexPath, "utf-8"));
    } else {
        res.code(500).send({ error: "Application not built. Run 'npm run build' first." });
    };
});

fastify.listen({ port: process.env.PORT }).then((address) => {
    console.log(`App running at ${address}`);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});