let chartBar, chartScatter;
let carouselIndex = 0;

const imgConfig = {
    logos: {
        "Premier League": "images/logo-premier-league.png",
        "La Liga": "images/logo-laliga.png",
        "Serie A": "images/logo-seriea.jpeg",
        "Bundesliga": "images/logo-bundesliga.png",
        "Ligue 1": "images/logo-ligue1.jpg",
        "Liga Portugal": "images/logo-Ligaportugal.png"
    },
    players: {
        "Viktor Gyökeres": "images/player-gyokeres.jpeg",
        "Kylian Mbappé": "images/player-mbappe.jpeg",
        "Mohamed Salah": "images/player-salah.jpg",
        "Harry Kane": "images/player-kane.jpeg",
        "Robert Lewandowski": "images/player-lewandowski.jpeg",
        "Mateo Retegui": "images/player-Retegui.webp",
        "Mika Biereth": "images/player-biereth.webp",
        "Alexander Isak": "images/player-isak.jpeg",
        "Erling Haaland": "images/player-haaland.jpeg",
        "Jonathan David": "images/player-david.jpeg",
        "Bradley Barcola": "images/player-barcola.jpeg"
    },
    portraits: {
        "Viktor Gyökeres": "portraits/portrait-gyok.jpeg",
        "Kylian Mbappé": "portraits/portrait-mbappe.jpeg",
        "Mohamed Salah": "portraits/portrait-salah.jpeg",
        "Harry Kane": "portraits/portrait-kane.jpg",
        "Robert Lewandowski": "portraits/portrait-lewandowski.jpg",
        "Mateo Retegui": "portraits/portrait-Retegui.avif",
        "Mika Biereth": "portraits/portrait-Biereth.png",
        "Alexander Isak": "portraits/portrait-isak.webp",
        "Erling Haaland": "portraits/portrait-haaland.webp",
        "Jonathan David": "portraits/portrait-david.png",
        "Bradley Barcola": "portraits/portrait-barcola.jpeg"
    }
};

function updateDashboard() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const league = document.getElementById('leagueFilter').value;

    const filtered = playersData.filter(p => 
        p.joueur.toLowerCase().includes(query) && (league === 'all' || p.championnat === league)
    );

    document.getElementById('totalGoals').innerText = filtered.reduce((s, p) => s + p.buts, 0).toLocaleString();

    if (filtered.length > 0) {
        const top = filtered[0];
        document.getElementById('topPlayerName').innerText = top.joueur;
        document.getElementById('leagueName').innerText = top.championnat;
        document.getElementById('playerHeadshot').src = imgConfig.players[top.joueur] || "";
        document.getElementById('leagueImg').src = imgConfig.logos[top.championnat] || "";
    }
    renderCharts(filtered);
}

function initCarousel() {
    const track = document.getElementById('carouselTrack');
    track.innerHTML = playersData.map(p => `
        <div class="carousel-slide">
            <img src="${imgConfig.portraits[p.joueur]}" onerror="this.src='${imgConfig.players[p.joueur]}'">
            <div class="player-overlay">
                <div class="overlay-club">${p.club}</div>
                <div class="overlay-value">${p.valeur}</div>
            </div>
            <div class="slide-footer">${p.joueur}</div>
        </div>
    `).join('');
}

function renderCharts(data) {
    const ctxB = document.getElementById('barChart').getContext('2d');
    const ctxS = document.getElementById('scatterChart').getContext('2d');
    if (chartBar) chartBar.destroy();
    if (chartScatter) chartScatter.destroy();

    const top8 = data.slice(0, 8);
    chartBar = new Chart(ctxB, {
        type: 'bar',
        data: {
            labels: top8.map(p => p.joueur),
            datasets: [
                { label: 'Buts', data: top8.map(p => p.buts), backgroundColor: '#38bdf8' },
                { label: 'Passes D.', data: top8.map(p => p.passes), backgroundColor: '#fbbf24' }
            ]
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    labels: { color: 'white', font: { size: 10 } },
                    onClick: (e, legendItem, legend) => {
                        const index = legendItem.datasetIndex;
                        const ci = legend.chart;
                        ci.isDatasetVisible(index) ? ci.hide(index) : ci.show(index);
                    }
                } 
            },
            scales: { y: { ticks: { color: 'rgba(255,255,255,0.5)' } }, x: { ticks: { color: 'rgba(255,255,255,0.5)' } } }
        }
    });

    chartScatter = new Chart(ctxS, {
        type: 'scatter',
        data: {
            datasets: [{ 
                label: 'Joueurs', 
                data: data.map(p => ({ x: p.minutes_jouees, y: p.buts, name: p.joueur })), 
                backgroundColor: '#fbbf24' 
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            scales: { y: { ticks: { color: 'rgba(255,255,255,0.5)' } }, x: { ticks: { color: 'rgba(255,255,255,0.5)' } } }
        }
    });
}

function moveCarousel(dir) {
    const track = document.getElementById('carouselTrack');
    carouselIndex += dir;
    const maxIndex = playersData.length - 4; // Ajuste selon la largeur
    if (carouselIndex < 0) carouselIndex = 0;
    if (carouselIndex > maxIndex) carouselIndex = maxIndex;
    track.style.transform = `translateX(-${carouselIndex * 220}px)`;
}

function downloadChart(id) {
    const canvas = document.getElementById(id);
    const link = document.createElement('a');
    link.download = id + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(playersData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stats Joueurs");
    XLSX.writeFile(wb, "Elite_Football_Stats.xlsx");
}

window.onload = () => { updateDashboard(); initCarousel(); };