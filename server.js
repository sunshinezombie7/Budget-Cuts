const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// --- GAME DATA: DEPT OF EVERYTHING ---
const PROMPTS = [
    // Normal Office Tickets
    "The real reason I was late to the meeting.",
    "Why the server actually crashed.",
    "The cafeteria's new rejected ice cream flavor.",
    "The worst thing to say in the elevator with the CEO.",
    "What I actually found in the back of the office fridge.",
    "The real reason I put you on hold.",
    "Translation of: 'Let me check that for you'.",
    "What I'm actually doing while you scream at me.",
    "Why the system is 'running slow' today.",
    "The worst thing to say when the mic is NOT muted.",
    "How to instantly fail Quality Assurance.",
    "The customer is demanding a _____.",
    "My secret note on this customer's account.",
    "The only way to get a refund is to...",
    
    // The "We Fired The Specialists" Tickets
    "Describe the 'Kangaroo Incident' that happened in the break room.",
    "Draft a breakup text... to your employer.",
    "Describe the emotional rollercoaster of a Monday morning.",
    "Explain why a hippopotamus would make a better Manager.",
    "Formally apologize to the office dog for stepping on its tail.",
    "Submit a hazard report: Giant Spider on the Boss's shoulder.",
    "Politely tell the CEO they have spinach in their teeth.",
    "Explain the 'Metamorphosis' of our restructuring plan (Layoffs).",
    "Romeo's inappropriate Slack message to Juliet.",
    "The hardest part about being a 'Ghost Employee' (Nobody sees me).",
    "Explain why the free coffee tastes like Marmite.",
    "Describe the Company Hierarchy using the Solar System.",
    "Explain to IT why your laptop is making that screaming noise.",
    "Urgent Memo: I am slowly sinking in 'Administrative Quicksand'.",
    "A convincing argument for why I deserve a Raise (Threatening).",
    "Proof that the Board of Directors are actual dinosaurs.",
    "Tips for protecting your lunch from the 'Sales Team Vultures'.",
    "Meeting Minutes: What the office dog was actually thinking."
];

// --- WORD BANK ---
const WORD_BANK = [
    "the", "a", "is", "of", "in", "on", "at", "and", "but", "with", "for", "very", "too", "my", "your",
    "his", "her", "he", "she", "it", "we", "they", "me", "you", "him", "us", "them", "i", "who", "what",
    "where", "when", "why", "how", "because", "if", "or", "so", "as", "by", "from", "to", "up", "down",
    "out", "over", "under", "about", "after", "before", "while", "until", "never", "always", "not", "no", 
    "yes", "maybe", "please", "sorry", "thank you", "hello", "goodbye", "this", "that", "these", "those",
    "refund", "manager", "escalate", "mute", "hold", "scream", "headset", "toilet", "ticket", "system", 
    "loop", "survey", "zero", "transfer", "hang-up", "KPIs", "quality", "assurance", "script", "robot", 
    "human", "dumb", "angry", "lying", "slow", "broken", "virus", "demon", "spider", "fingers", "mouth", 
    "void", "pants", "click", "type", "ignore", "delete", "save", "burn", "worship", "blame", "urgent", 
    "tech", "support", "customer", "service", "boss", "break", "lunch", "email", "chat", "phone",
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
let votes = {};
let roundTimer = null;

// Track who has already voted
let voters = new Set();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinGame', (name) => {
        players[socket.id] = {
            id: socket.id,
            name: name || `Employee ${socket.id.substr(0,4)}`,
            score: 0,
            hand: [],
            submission: null
        };
        io.emit('updateLobby', { players, state: gameState });
    });

    socket.on('startGame', () => {
        gameState = 'crafting';
        currentPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
        votes = {};
        voters.clear();

        // Reset submissions
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
        if (roundTimer) clearInterval(roundTimer);
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
            
            // Check if everyone has submitted
            const allSubmitted = Object.values(players).every(p => p.submission !== null);
            if(allSubmitted && Object.keys(players).length > 0) {
                clearInterval(roundTimer);
                startVotingPhase();
            }
        }
    });

    socket.on('submitVote', (targetId) => {
        // --- FIXED: ALLOW SELF VOTING FOR TESTING ---
        // We only check if YOU have voted before, not WHO you voted for.
        if (voters.has(socket.id)) return; 

        console.log(`Vote registered: ${socket.id} voted for ${targetId}`);

        if(!votes[targetId]) votes[targetId] = 0;
        votes[targetId]++;
        voters.add(socket.id);
        
        const totalVotes = voters.size;
        const totalPlayers = Object.keys(players).length;
        
        if(totalVotes >= totalPlayers) {
            endRound();
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        voters.delete(socket.id);
        io.emit('updateLobby', { players, state: gameState });
    });
});

function startVotingPhase() {
    gameState = 'voting';
    // Only send submissions that actually exist
    const subList = Object.values(players)
        .filter(p => p.submission)
        .map(p => ({ id: p.id, note: p.submission }));
    
    io.emit('startVoting', subList);
}

function endRound() {
    gameState = 'results';
    
    let maxVotes = -1;
    let winners = [];
    
    // Find highest vote count
    Object.keys(votes).forEach(id => {
        if(votes[id] > maxVotes) {
            maxVotes = votes[id];
        }
    });

    // Find everyone who tied for first place
    Object.keys(votes).forEach(id => {
        if(votes[id] === maxVotes) {
            winners.push(id);
        }
    });

    // Pick a random winner from the ties
    let winnerId = null;
    if (winners.length > 0) {
        winnerId = winners[Math.floor(Math.random() * winners.length)];
    }

    let winnerName = "Nobody";
    let winnerNote = [];
    
    if(winnerId && players[winnerId]) {
        players[winnerId].score += 1;
        winnerName = players[winnerId].name;
        winnerNote = players[winnerId].submission;
    }

    console.log("Round Over. Winner:", winnerName);

    io.emit('roundEnded', { 
        winner: winnerName,
        note: winnerNote,
        scores: players
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
