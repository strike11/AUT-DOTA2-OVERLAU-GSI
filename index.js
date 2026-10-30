var express = require('express');
var cors = require('cors');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
    cors: {
        origin: true,
        methods: ["GET", "POST"]
    }
});
var d2gsi = require('dota2-gsi');
var path = require('path');
const { log } = require('console');

process.on("uncaughtException", (err) => {
    if (err && err.code === "EADDRINUSE" && String(err.port) === "3000") {
        console.error("Dota GSI port 3000 is already in use. Alert cues still listen on 3001.");
        return;
    }
    console.error(err);
    process.exit(1);
});

var server = new d2gsi({
    port: 3000,
    tokens: ["production"]
});

app.use(cors()); // Use cors middleware
app.use(express.static(path.join(__dirname, 'svelte-app/public'))); // Serve static files from Svelte app

io.on("connection", (socket) => {
    socket.on("alert-cue", (cue) => {
        if (!cue || typeof cue !== "object") return;
        const title = String(cue.title || "").trim().slice(0, 32);
        if (!title) return;
        const team = cue.team === "radiant" || cue.team === "dire" ? cue.team : null;
        io.emit("alert-cue", {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            kind: String(cue.kind || "rune").slice(0, 24),
            title,
            subtitle: String(cue.subtitle || "").trim().slice(0, 40),
            detail: String(cue.detail || "").trim().slice(0, 40),
            team,
            hero: String(cue.hero || "").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 40),
        });
    });
});




server.events.on('newclient', function (client) {
    console.log("New client connection, IP address: " + client.ip);
    if (client.auth && client.auth.token) {
        console.log("Auth token: " + client.auth.token);
    } else {
        console.log("No Auth token");
    }

    client.on('newdata', function (newdata) {
        if (newdata) {
            io.emit('newdata', newdata); // Emit the newdata to the client
        }
    });

    client.on('newdata', function (newdata) {
        try {
            if (newdata) {
                const {
                    activeteam,
                    pick,
                    activeteam_time_remaining,
                    radiant_bonus_time,
                    dire_bonus_time,
                    team2,
                    team3
                } = newdata.draft;

                io.emit('activeteam', activeteam);
                io.emit('pick', pick);
                io.emit('activeteam_time_remaining', activeteam_time_remaining);
                io.emit('radiant_bonus_time', radiant_bonus_time);
                io.emit('dire_bonus_time', dire_bonus_time);

                const radiant_picks = ['pick0_class', 'pick1_class', 'pick2_class', 'pick3_class', 'pick4_class'];
                const dire_picks = ['pick0_class', 'pick1_class', 'pick2_class', 'pick3_class', 'pick4_class'];
                const radiant_bans = ['ban0_class', 'ban1_class', 'ban2_class', 'ban3_class', 'ban4_class', 'ban5_class', 'ban6_class'];
                const dire_bans = ['ban0_class', 'ban1_class', 'ban2_class', 'ban3_class', 'ban4_class', 'ban5_class', 'ban6_class'];

                radiant_picks.forEach(key => {
                    if (team2.hasOwnProperty(key)) {
                        io.emit(`radiant_pick:${key}`, team2[key]);
                    }
                });

                dire_picks.forEach(key => {
                    if (team3.hasOwnProperty(key)) {
                        io.emit(`dire_pick:${key}`, team3[key]);
                    }
                });

                radiant_bans.forEach(key => {
                    if (team2.hasOwnProperty(key)) {
                        io.emit(`radiant_ban:${key}`, team2[key]);
                        // console.log(team2[key]);
                    }
                });

                dire_bans.forEach(key => {
                    if (team3.hasOwnProperty(key)) {
                        io.emit(`dire_ban:${key}`, team3[key]);
                        // console.log(team3[key]);
                    }
                });
            }
        } catch (error) {
            console.error('Error handling newdata', error);
        }
    });
});

http.listen(3001, function () { // Start the Express server on port 3001
    console.log('listening on *:3001');
});