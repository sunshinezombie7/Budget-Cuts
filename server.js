const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// --- GAME DATA: UPDATED PROMPTS ---
const PROMPTS = [
    "The real reason I was late to the meeting.",
    "Why the server crashed.",
    "A rejected flavor of ice cream.",
    "The worst thing to say in an elevator.",
    "What I found in the office fridge.",
    "The real reason I put you on hold.",
    "Translation of: 'Let me check that for you'.",
    "What I'm actually doing while you scream at me.",
    "Why the system is 'running slow' today.",
    "The worst thing to say when the mic is NOT muted.",
    "How to instantly fail Quality Assurance.",
    "The customer is demanding a _____.",
    "My note on this customer's account says...",
    "The only way to get a refund is to...",
    "Describe kangaroos.",
    "Break up with someone in a text message.",
    "Explain the feeling of riding a rollercoaster.",
    "Describe a hippopotamus.",
    "Apologise to your dog for stepping on their tail.",
    "Warn someone there's a giant, hairy spider on their shoulder.",
    "Tell a friend they have something stuck in their teeth.",
    "Describe how a caterpillar becomes a butterfly.",
    "Romeo's most quoted line to Juliet is...",
    "What is the hardest part about being a ghost?",
    "Explain Marmite.",
    "Describe the solar system.",
    "Tell a mechanic what's wrong with your car.",
    "Alert someone that you are slowly sinking in quicksand.",
    "Tell your boss why you deserve a promotion.",
    "Write a convincing argument claiming dinosaurs weren't real.",
    "What are some tips for keeping your food safe from seagulls?",
    "Describe the inner thoughts of a dog."
];

// --- WORD BANK (MERGED & DE-DUPLICATED) ---
const WORD_BANK = [
    // BASICS
    "the", "a", "is", "of", "in", "on", "at", "and", "but", "with", "for", "very", "too", "my", "your",
    "his", "her", "he", "she", "it", "we", "they", "me", "you", "him", "us", "them", "i", "who", "what",
    "where", "when", "why", "how", "because", "if", "or", "so", "as", "by", "from", "to", "up", "down",
    "out", "over", "under", "about", "after", "before", "while", "until", "never", "always", "not", "no", 
    "yes", "maybe", "please", "sorry", "thank you", "hello", "goodbye", "this", "that", "these", "those",
    
    // CALL CENTER
    "refund", "manager", "escalate", "mute", "hold", "scream", "headset", "toilet", "ticket", "system", 
    "loop", "survey", "zero", "transfer", "hang-up", "KPIs", "quality", "assurance", "script", "robot", 
    "human", "dumb", "angry", "lying", "slow", "broken", "virus", "demon", "spider", "fingers", "mouth", 
    "void", "pants", "click", "type", "ignore", "delete", "save", "burn", "worship", "blame", "urgent", 
    "tech", "support", "customer", "service", "boss", "break", "lunch", "email", "chat", "phone",
    
    // CHAOS & RANDOM
    "test", "block", "mean", "zone", "incident", "explosion", "animal", "adventure", "sign", "light", 
    "give", "reveal", "display", "have", "can", "charge", "assassin", "advance", "none", "swap", "purge", 
    "anguish", "organic", "anatomy", "foul", "cut", "finally", "visit", "heart", "firm", "smart", "suffer", 
    "kick", "beat", "cloth", "anxiety", "man", "ahead", "need", "like", "cruel", "crunch", "pump", 
    "promise", "walk", "mug", "chaos", "surge", "atrocity", "belt", "matter", "torture", "hammer", 
    "sleep", "ban", "more", "large", "thousand", "between", "guide", "conflict", "weapon", "slouch", 
    "ly", "apply", "game", "vision", "answer", "hey", "be", "move", "crazy", "hose", "elegant", "nice", 
    "old", "average", "ruin", "nose", "ing", "remember", "study", "million", "child", "companion", "was", 
    "fly", "queasy", "horror", "soldier", "could", "then", "grunt", "judge", "murder", "do", "hostile", 
    "s", "lady", "filth", "yummy", "amazing", "place", "touch", "also", "try", "spirit", "heat", "paste", 
    "champion", "despise", "wife", "around", "decide", "dump", "last", "day", "cry", "finish", "swear", 
    "charm", "said", "weather", "tough", "think", "dangerous", "ancient", "dazzling", "let", "terrify", 
    "already", "been", "trouble", "arrest", "back", "yo", "chemical", "demand", "board", "righteous", 
    "creep", "non", "dance", "influence", "slice", "insidious", "hurt", "all", "today", "company", "cycle", 
    "fun", "happy", "excite", "catch", "inquiry", "bird", "tear", "world", "hunt", "scab", "war", 
    "palpitate", "craft", "i'd", "revolt", "love", "stop", "ask", "balloon", "saggy", "ed", "friend", 
    "elaborate", "flame", "night", "beautiful", "recoil", "show", "decrease", "alien", "some", "question", 
    "people", "has", "beneath", "wrinkly", "travel", "search", "jowls", "attain", "long", "air", "float", 
    "basic", "impact", "trade", "plug", "nibble", "group", "stick", "nugget", "dubious", "any", "part", 
    "chocolate", "pinch", "protrude", "being", "anger", "wound", "life", "son", "work", "home", "had", 
    "protest", "virtue", "don't", "accident", "shelter", "bag", "bottom", "top", "pantsuit", "challenge", 
    "soul", "one", "asleep", "poke", "come", "blunder", "cure", "orbit", "disease", "own", "approach", 
    "amount", "lift", "wear", "dude", "accuse", "riot", "fold", "supple", "juicy", "duck", "fluff", 
    "calculate", "objective", "stain", "moist", "affair", "admit", "storm", "hate", "lead", "check", 
    "gross", "nature", "run", "sweep", "beer", "space", "area", "low", "threat", "excuse", "afraid", 
    "damage", "aim", "deception", "snack", "punch", "esteem", "hear", "spray", "mistake", "tug", "hope", 
    "fall", "jump", "cyst", "count", "claim", "commit", "attack", "hand", "grill", "clue", "dark", "match", 
    "rule", "our", "did", "supply", "weird", "abandon", "hike", "smoke", "vegetable", "crush", "odor", 
    "through", "analysis", "forbidden", "bed", "record", "go", "defend", "play", "tip", "trillion", 
    "treasure", "argue", "melon", "admire", "knowledge", "drip", "high", "drain", "below", "tie", 
    "mingle", "cherish", "adequate", "object", "power", "sense", "end", "dress", "buy", "lovely", "pain", 
    "grand", "peel", "surrender", "value", "darkness", "fool", "wet", "alarm", "lie", "now", "wave", 
    "forge", "pay", "unlikely", "garden", "majesty", "freeze", "evolve", "crack", "yet", "roar", "less", 
    "commotion", "noise", "fish", "kingdom", "stress", "vile", "way", "hideous", "time", "leave", 
    "absorb", "crusty", "train", "thunder", "alone", "copy", "bad", "overthrow", "money", "itch", "dream", 
    "seem", "bear", "limb", "barrier", "share", "soft", "delay", "snake", "alcohol", "confess", "behind", 
    "force", "bro", "beam", "compete", "rogue", "care", "rock", "disgust", "delight", "small", "behavior", 
    "crawl", "along", "wish", "chain", "jerk", "cadaver", "betrayal", "clogged", "wail", "rough", 
    "strategy", "feel", "taste", "sing", "cheat", "young", "plop", "flight", "fight", "pull", "ooze", 
    "laugh", "control", "wreck", "eye", "miss", "fill", "avoid", "slay", "arm", "discover", "dive", 
    "woman", "hack", "step", "goddess", "guy", "fester", "relish", "drink", "tease", "call", "cover", 
    "hit", "hero", "assume", "hundred", "shine", "race", "jam", "help", "flap", "damp", "pause", "jelly", 
    "flow", "afford", "possess", "battle", "talk", "require", "blast", "chunk", "instead", "box", 
    "business", "escape", "mister", "say", "defeat", "treat", "goal", "allow", "shop", "permit", "sin", 
    "baby", "mind", "bite", "shape", "cute", "bungle", "against", "batter", "mishap", "stomach", "rotten", 
    "wash", "absence", "listen", "face", "should", "adjust", "robust", "juice", "devil", "surprise", 
    "grip", "horrible", "whole", "doubt", "fear", "crave", "complex", "art", "destroy", "away", "lucky", 
    "make", "disappear", "consume", "crash", "skeleton", "struggle", "aircraft", "sad", "grate", "across", 
    "grisly", "thing", "rant", "awful", "guard", "random", "yeast", "above", "hardware", "cake", 
    "actually", "asset", "school", "steer", "pray", "change", "jumbo", "beast", "immense", "tactic", 
    "body", "bowel", "y'all", "fix", "land", "creature", "repair", "princess", "decay", "UFO", "bone", 
    "saw", "barrel", "acquire", "insult", "kiss", "bump", "squeeze", "oppose", "scratch", "pink", "blue", 
    "green", "yellow", "red", "orange", "white", "black", "grey", "purple", "belief", "quiet", "torment", 
    "eat", "crisis", "coach", "quest", "head", "smooth", "act", "cause", "grasp", "warrior", "curious", 
    "fantasy", "chick", "adult", "look", "burn", "see", "want", "pop", "turn", "gear", "unlucky", 
    "!!!", "?", "...", " :( ", " :) ", " *click* "
];

let players = {};
let gameState = 'lobby'; 
let currentPrompt = "";
let submissions = [];
let votes = {};
let roundTimer = null;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinGame', (name) => {
        players[socket.id] = {
            id: socket.id,
            name: name || `Agent ${socket.id.substr(0,4)}`,
            score: 0,
            hand: [],
            submission: null
        };
        io.emit('updateLobby', { players, state: gameState });
    });

    socket.on('startGame', () => {
        gameState = 'crafting';
        currentPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
        submissions = [];
        votes = {};

        // Deal 60 random words 
        Object.keys(players).forEach(id => {
            players[id].submission = null;
            players[id].hand = [];
            for(let i=0; i<60; i++) {
                players[id].hand.push(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
            }
            io.to(id).emit('dealHand', { hand: players[id].hand, prompt: currentPrompt });
        });

        io.emit('gameStarted', { prompt: currentPrompt, time: 90 });
        
        // Start 90s Timer
        let timeLeft = 90;
        roundTimer = setInterval(() => {
            timeLeft--;
            io.emit('timerUpdate', timeLeft);
            if(timeLeft <= 0) {
                clearInterval(roundTimer);
                startVotingPhase();
            }
        }, 1000);
    });

    socket.on('submitNote', (noteArray) => {
        if(players[socket.id]) {
            players[socket.id].submission = noteArray; 
            io.emit('playerSubmitted', socket.id);
            
            const allSubmitted = Object.values(players).every(p => p.submission !== null);
            if(allSubmitted) {
                clearInterval(roundTimer);
                startVotingPhase();
            }
        }
    });

    socket.on('submitVote', (targetId) => {
        if(targetId === socket.id) return; 

        if(!votes[targetId]) votes[targetId] = 0;
        votes[targetId]++;
        
        const totalVotes = Object.values(votes).reduce((a,b) => a+b, 0);
        const totalPlayers = Object.keys(players).length;
        
        if(totalVotes >= totalPlayers) {
            endRound();
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updateLobby', { players, state: gameState });
    });
});

function startVotingPhase() {
    gameState = 'voting';
    const subList = Object.values(players)
        .filter(p => p.submission)
        .map(p => ({ id: p.id, note: p.submission }));
    
    io.emit('startVoting', subList);
}

function endRound() {
    gameState = 'results';
    
    let maxVotes = -1;
    let winnerId = null;
    
    Object.keys(votes).forEach(id => {
        if(votes[id] > maxVotes) {
            maxVotes = votes[id];
            winnerId = id;
        }
    });

    if(winnerId && players[winnerId]) {
        players[winnerId].score += 1;
    }

    io.emit('roundEnded', { 
        winner: winnerId ? players[winnerId].name : "Nobody",
        note: winnerId ? players[winnerId].submission : [],
        scores: players
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
