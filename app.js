const express = require("express");
const client = require("prom-client");
const app = express();

client.collectDefaultMetrics();
const httpRequests = new client.Counter({
    name: "http_requests_total",
    help: "Total HTTP requests",
    labelNames: ["method", "route", "status"],
});
const httpDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Request latency in seconds",
    labelNames: ["method", "route"],
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2],
});

app.use((req, res, next) => {
    const end = httpDuration.startTimer({
        method: req.method,
        route: req.path,
    });
    res.on("finish", () => {
        httpRequests.inc({
            method: req.method,
            route: req.path,
            status: res.statusCode,
        });
        end();
        console.log(
            JSON.stringify({
                timestamp: new Date().toISOString(),
                level: res.statusCode >= 500 ? "error" : "info",
                method: req.method,
                path: req.path,
                status: res.statusCode,
            }),
        );
    });
    next();
});

// Endpoints
app.get("/ping", (_, res) => {
    res.send("Pong!\n");
});

app.get("/health", (_, res) => {
    res.send("OK");
});

app.get("/metrics", async (_, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

app.get("/slow", async (_, res) => {
    await ((_) => new Promise((r) => setTimeout(r, 2000)))(); // this sleeps for 2s ok
    res.send("OK");
});

app.get("/error", (_, res) => {
    if (Math.random() >= 0.3) {
        res.send("OK");
    } else {
        res.status(500).send("KO");
    }
});

module.exports = app;
