const socket = io();
let myHand = [];
let myNote = [];

// ENTER KEY LISTENER
document.getElementById('username').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinGame();
});

function getWordStyle(word) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
        hash = word.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const styles = [
        { bg: '#fdfbf7', color: '#111', font: "'Tinos', serif", weight: '400', trans: 'none', border: 'none' },
        { bg: '#ffffff', color: '#000', font: "'Oswald', sans-serif", weight: '700', trans: 'uppercase', border: 'none' },
        { bg: '#111111', color: '#fdfbf7', font: "'Oswald', sans-serif", weight: '400', trans: 'uppercase', border: 'none' },
        { bg: '#ff80ab', color: '#000', font: "'Oswald', sans-serif", weight: '700', trans: 'uppercase', border: 'none' },
        { bg: '#ffeb3b', color: '#000', font: "'Special Elite', cursive", weight: '700', trans: 'none', border: '1px dashed #000' },
        { bg: '#80d8ff', color: '#000', font: "'Tinos', serif", weight: '700', trans: 'none', border: '2px dotted #000' },
        { bg: '#d32f2f', color: '#fff', font: "'Impact', sans-serif", weight: '400', trans: 'uppercase', border: 'none' }
    ];

    const index = Math.abs(hash) % styles.length;
    const s = styles[index];
    const rot = (Math.abs(hash * 2) % 10) - 5; 
    const clip = `polygon(${2+Math.abs(hash)%3}% ${0+Math.abs(hash)%4}%, ${96+Math.abs(hash)%3}% ${2+Math.abs(hash)%2}%, ${98+Math.abs(hash)%2}% ${95+Math.abs(hash)%3}%, ${2+Math.abs(hash)%2}% ${98+Math.abs(hash)%2}%)`;

    return `
        background:${s.bg}; 
        color:${s.color}; 
        font-family:${s.font}; 
        font-weight:${s.weight}; 
        text-transform:${s.trans}; 
        border:${s.border};
        transform: rotate(${rot}deg);
        clip-path: ${clip};
    `;
}

function joinGame() {
    const name = document.getElementById('username').value;
    if(name) {
        socket.emit('joinGame', name);
        // Switch to the water cooler immediately while waiting for server confirmation
        showScreen('lobbyScreen'); 
    }
}

// Ensure this matches your server's event name
socket.on('gameStarted', (data) => {
    console.log("Game starting..."); // Debug line
    showScreen('gameScreen');
    document.getElementById('promptText').textContent = data.prompt;
    document.getElementById('timer').textContent = data.time;
    
    // Safety check: make sure word bank is visible
    document.getElementById('wordBank').style.display = 'flex';
});

function startGame() {
    socket.emit('startGame');
}

function startNextRound() {
    socket.emit('startNextRound');
}

socket.on('updateLobby', (data) => {
    const list = document.getElementById('lobbyList');
    list.innerHTML = '';
    
    const isHost = (socket.id === data.hostId);
    const startBtn = document.getElementById('startBtn');
    startBtn.style.display = isHost ? 'inline-block' : 'none';

    Object.values(data.players).forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<span style="background:#fff; font-family:'Permanent Marker'; padding: 5px 15px; border: 2px solid #333; transform: rotate(${Math.random()*4-2}deg); display:inline-block; font-size:1.4rem; box-shadow:3px 3px 0 rgba(0,0,0,0.2);">${p.name} ${p.submission ? '✅' : ''} ${p.id === data.hostId ? '👑' : ''}</span>`;
        li.style.margin = '10px 0';
        list.appendChild(li);
    });
});

socket.on('gameStarted', (data) => {
    showScreen('gameScreen');
    document.getElementById('promptText').textContent = data.prompt;
    document.getElementById('timer').textContent = data.time;
});

socket.on('timerUpdate', (t) => {
    document.getElementById('timer').textContent = t;
});

socket.on('dealHand', (data) => {
    myHand = data.hand;
    myNote = [];
    renderBoard();
});

function renderBoard() {
    const bank = document.getElementById('wordBank');
    const board = document.getElementById('corkboard');
    bank.innerHTML = '';
    board.innerHTML = '';

    myHand.forEach((word, index) => {
        const span = document.createElement('span');
        span.className = 'magnet';
        span.textContent = word;
        span.style.cssText = getWordStyle(word);
        
        span.onclick = () => {
            myHand.splice(index, 1);
            myNote.push(word);
            renderBoard();
        };
        bank.appendChild(span);
    });

    if(myNote.length === 0) {
        board.innerHTML = '<span class="corkboard-placeholder">Pin scraps here...</span>';
    } else {
        myNote.forEach((word, index) => {
            const span = document.createElement('span');
            span.className = 'magnet';
            span.textContent = word;
            span.style.cssText = getWordStyle(word); 
            
            span.onclick = () => {
                myNote.splice(index, 1);
                myHand.push(word);
                renderBoard();
            };
            board.appendChild(span);
        });
    }
}

function submitNote() {
    if(myNote.length > 0) {
        socket.emit('submitNote', myNote);
        document.getElementById('corkboard').innerHTML = "<h2 style='background:#fff; padding:10px; border:3px solid #000; transform:rotate(-2deg); display:inline-block;'>RESPONSE SENT.</h2>";
        document.getElementById('wordBank').style.display = 'none';
    }
}

socket.on('startVoting', (submissions) => {
    showScreen('votingScreen');
    document.getElementById('votePrompt').textContent = document.getElementById('promptText').textContent;
    const list = document.getElementById('submissionsList');
    list.innerHTML = '';

    submissions.forEach(sub => {
        const div = document.createElement('div');
        div.className = 'vote-card';
        div.innerHTML = sub.note.map(w => {
            return `<span style="display:inline-block; padding:4px 8px; margin:4px; box-shadow:2px 2px 5px rgba(0,0,0,0.2); ${getWordStyle(w)} font-size:1rem;">${w}</span>`
        }).join(' ');
        
        div.onclick = () => {
            socket.emit('submitVote', sub.id);
            list.innerHTML = "<h2 style='background:#fff; padding:10px; border:3px solid #000; transform:rotate(-2deg); display:inline-block;'>REVIEW FILED.</h2>";
        };
        list.appendChild(div);
    });
});

socket.on('roundEnded', (data) => {
    showScreen('resultScreen');
    const winnerNameBox = document.getElementById('winnerName');
    const noteDiv = document.getElementById('winningNote');
    
    const isHost = (socket.id === data.hostId);
    const nextBtn = document.getElementById('nextRoundBtn');
    const waitMsg = document.getElementById('waitingMsg');
    
    if (isHost) {
        nextBtn.style.display = 'inline-block';
        waitMsg.style.display = 'none';
    } else {
        nextBtn.style.display = 'none';
        waitMsg.style.display = 'block';
    }

    if (data.isTie) {
        winnerNameBox.textContent = "ADMINISTRATIVE DEADLOCK: " + data.winnerName;
        winnerNameBox.style.background = "#999"; 
        noteDiv.innerHTML = "<h2 style='background:#fff; padding:15px; border:2px solid #000; transform:rotate(2deg);'>BUDGET FROZEN.<br>(VOTES WERE TIED)</h2>";
    } else {
        winnerNameBox.textContent = "BEST EMPLOYEE: " + data.winnerName;
        winnerNameBox.style.background = "#fbc02d"; 
        
        if(data.winnerNote && data.winnerNote.length > 0) {
            noteDiv.innerHTML = data.winnerNote.map(w => `<span style="display:inline-block; padding:8px 15px; margin:5px; box-shadow:4px 4px 10px rgba(0,0,0,0.4); ${getWordStyle(w)} font-size:1.5rem;">${w}</span>`).join(' ');
        } else {
            noteDiv.innerHTML = "<span style='background:#fff; padding:10px;'>File Corrupted.</span>";
        }
    }

    const scoreList = document.getElementById('scoreList');
    scoreList.innerHTML = '';
    Object.values(data.scores).sort((a,b) => b.score - a.score).forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<span style="background:#fff; font-family:'Permanent Marker'; padding: 5px 15px; border: 2px solid #333; transform: rotate(${Math.random()*4-2}deg); display:inline-block; margin: 5px;">${p.name}: ${p.score}</span>`;
        scoreList.appendChild(li);
    });
});

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if(target) target.classList.add('active');
    
    // Manage body scrolling: only allow it on the lobby/results
    if(id === 'gameScreen') {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}
