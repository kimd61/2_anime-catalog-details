class AnimeApp {
    constructor() {
        this.currentPage = 1;
        this.searchTerm = '';
        this.initElements();
        this.addEventListeners();
        
        // Check if we're on the details page
        if (window.location.search.includes('id=')) {
            this.loadAnimeDetails();
        } else {
            // Only load top anime on the main page
            this.loadTopAnime();
        }
    }

    initElements() {
        this.searchInput = document.getElementById('search-input');
        this.searchButton = document.getElementById('search-button');
        this.animeGrid = document.getElementById('anime-grid');
        this.loadingSpinner = document.getElementById('loading');
        this.errorMessage = document.getElementById('error-message');
        this.pagination = document.getElementById('pagination');
        this.prevPageButton = document.getElementById('prev-page');
        this.nextPageButton = document.getElementById('next-page');
        this.currentPageSpan = document.getElementById('current-page');
        
        // Details page element
        this.animeDetailsContainer = document.getElementById('anime-details-container');
    }

    addEventListeners() {
        if (this.searchButton) {
            this.searchButton.addEventListener('click', () => this.searchAnime());
        }
        
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchAnime();
            });
        }
        
        if (this.prevPageButton) {
            this.prevPageButton.addEventListener('click', () => this.changePage(-1));
        }
        
        if (this.nextPageButton) {
            this.nextPageButton.addEventListener('click', () => this.changePage(1));
        }

        // Add event listeners for navigation links
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                if (page === 'top') this.loadTopAnime();
                if (page === 'search') this.searchInput.focus();
                if (page === 'home') window.location.href = 'index.html';
            });
        });
        
        // Back button on details page
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.history.back();
            });
        }
    }

    showLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.classList.remove('hidden');
        }
        if (this.animeGrid) {
            this.animeGrid.innerHTML = '';
        }
        if (this.errorMessage) {
            this.errorMessage.classList.add('hidden');
        }
    }

    hideLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.classList.add('hidden');
        }
    }

    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.classList.remove('hidden');
        }
        if (this.animeGrid) {
            this.animeGrid.innerHTML = '';
        }
    }

    async fetchAnimeDetails(id) {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            this.showError('Failed to fetch anime details: ' + error.message);
            return null;
        }
    }

    async loadAnimeDetails() {
        // Extract the anime ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const animeId = urlParams.get('id');
        
        if (!animeId) {
            this.showError('No anime ID provided');
            return;
        }
        
        this.showLoading();
        const data = await this.fetchAnimeDetails(animeId);
        this.hideLoading();
        
        if (data && this.animeDetailsContainer) {
            const anime = data.data;
            
            // Use large image when available
            const imageUrl = anime.images?.jpg?.large_image_url || 
                           anime.images?.jpg?.image_url || 
                           anime.image_url || 
                           'https://via.placeholder.com/450x650';
            
            // Render the details page content
            this.animeDetailsContainer.innerHTML = `
                <div class="anime-details-header">
                    <img src="${imageUrl}" alt="${anime.title}" class="anime-details-image">
                    <div class="anime-details-info">
                        <h1>${anime.title}</h1>
                        ${anime.title_english && anime.title_english !== anime.title ? 
                          `<h2 class="english-title">${anime.title_english}</h2>` : ''}
                        ${anime.title_japanese ? 
                          `<h3 class="japanese-title">${anime.title_japanese}</h3>` : ''}
                        
                        <div class="anime-stats">
                            <div class="stat">
                                <span class="stat-label">Score:</span>
                                <span class="stat-value">${anime.score || 'N/A'}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Rank:</span>
                                <span class="stat-value">${anime.rank ? '#' + anime.rank : 'N/A'}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Popularity:</span>
                                <span class="stat-value">${anime.popularity ? '#' + anime.popularity : 'N/A'}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Type:</span>
                                <span class="stat-value">${anime.type || 'Unknown'}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Episodes:</span>
                                <span class="stat-value">${anime.episodes || 'Unknown'}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Status:</span>
                                <span class="stat-value">${anime.status || 'Unknown'}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Aired:</span>
                                <span class="stat-value">${anime.aired?.string || 'Unknown'}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Duration:</span>
                                <span class="stat-value">${anime.duration || 'Unknown'}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Rating:</span>
                                <span class="stat-value">${anime.rating || 'Unknown'}</span>
                            </div>
                        </div>
                        
                        <div class="anime-genres">
                            ${anime.genres?.map(genre => 
                                `<span class="genre-tag">${genre.name}</span>`
                            ).join('') || 'No genres listed'}
                        </div>
                    </div>
                </div>
                
                <div class="anime-details-section">
                    <h3>Synopsis</h3>
                    <p>${anime.synopsis || 'No synopsis available.'}</p>
                </div>
                
                ${anime.background ? `
                <div class="anime-details-section">
                    <h3>Background</h3>
                    <p>${anime.background}</p>
                </div>` : ''}
                
                <div class="anime-details-section">
                    <h3>Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Source:</strong> ${anime.source || 'Unknown'}
                        </div>
                        <div class="info-item">
                            <strong>Season:</strong> ${anime.season ? anime.season.charAt(0).toUpperCase() + anime.season.slice(1) + ' ' + anime.year : 'Unknown'}
                        </div>
                        <div class="info-item">
                            <strong>Studios:</strong> ${anime.studios?.map(s => s.name).join(', ') || 'Unknown'}
                        </div>
                        <div class="info-item">
                            <strong>Producers:</strong> ${anime.producers?.map(p => p.name).join(', ') || 'None listed'}
                        </div>
                    </div>
                </div>
                
                ${anime.trailer?.embed_url ? `
                <div class="anime-details-section">
                    <h3>Trailer</h3>
                    <div class="trailer-container">
                        <iframe src="${anime.trailer.embed_url}" 
                                frameborder="0" 
                                allow="autoplay; encrypted-media" 
                                allowfullscreen>
                        </iframe>
                    </div>
                </div>` : ''}
                
                ${anime.relations && anime.relations.length > 0 ? `
                <div class="anime-details-section">
                    <h3>Related Anime</h3>
                    <ul class="related-list">
                        ${anime.relations.map(relation => `
                            <li>
                                <strong>${relation.relation}:</strong> 
                                ${relation.entry.map(entry => 
                                    `<a href="details.html?id=${entry.mal_id}">${entry.name}</a>`
                                ).join(', ')}
                            </li>
                        `).join('')}
                    </ul>
                </div>` : ''}
            `;
        }
    }

    async fetchAnime(url) {
        this.showLoading();
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            this.showError('Failed to fetch anime data: ' + error.message);
            return null;
        } finally {
            this.hideLoading();
        }
    }

    createAnimeCard(anime) {
        const card = document.createElement('div');
        card.classList.add('anime-card');

        // Handle different API response structures
        const title = anime.title || anime.title_english || 'Unknown Title';
        
        // Use large image when available for better quality
        const imageUrl = anime.images?.jpg?.large_image_url || 
                       anime.images?.jpg?.image_url || 
                       anime.image_url || 
                       'https://via.placeholder.com/225x350';
                       
        const score = anime.score || 'N/A';
        const episodes = anime.episodes || 'Unknown';
        const genres = anime.genres ? anime.genres.slice(0, 3).map(g => g.name || g) : [];

        card.innerHTML = `
            <img src="${imageUrl}" alt="${title}" class="anime-card-image">
            <div class="anime-card-content">
                <h3>${title}</h3>
                <div class="anime-details">
                    <span>Score: ${score}</span>
                    <span>Episodes: ${episodes}</span>
                </div>
                <div class="anime-genres">
                    ${genres.map(genre => 
                        `<span class="genre-tag">${genre}</span>`
                    ).join('')}
                </div>
            </div>
        `;
        
        // Navigate to details page on click
        card.addEventListener('click', () => {
            window.location.href = `details.html?id=${anime.mal_id}`;
        });
        
        return card;
    }

    renderAnimeGrid(animeList) {
        if (!this.animeGrid) return;
        
        this.animeGrid.innerHTML = '';
        animeList.forEach(anime => {
            const card = this.createAnimeCard(anime);
            this.animeGrid.appendChild(card);
        });
    }

    async loadTopAnime() {
        this.searchTerm = '';
        this.currentPage = 1;
        const url = `https://api.jikan.moe/v4/top/anime?page=${this.currentPage}&limit=25`;
        
        const data = await this.fetchAnime(url);
        if (data) {
            this.renderAnimeGrid(data.data);
            this.updatePagination(data);
        }
    }

    async searchAnime() {
        if (!this.searchInput) return;
        
        this.searchTerm = this.searchInput.value.trim();
        if (!this.searchTerm) return;

        this.currentPage = 1;
        const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(this.searchTerm)}&page=${this.currentPage}&limit=25`;
        
        const data = await this.fetchAnime(url);
        if (data) {
            this.renderAnimeGrid(data.data);
            this.updatePagination(data);
        }
    }

    updatePagination(data) {
        if (!this.pagination) return;
        
        // Show/hide pagination
        if (data.pagination) {
            this.pagination.classList.remove('hidden');
            
            // Update page number
            if (this.currentPageSpan) {
                this.currentPageSpan.textContent = `Page ${data.pagination.current_page}`;
            }
            
            // Enable/disable prev button
            if (this.prevPageButton) {
                this.prevPageButton.disabled = !data.pagination.has_previous_page;
            }
            
            // Enable/disable next button
            if (this.nextPageButton) {
                this.nextPageButton.disabled = !data.pagination.has_next_page;
            }
        } else {
            this.pagination.classList.add('hidden');
        }
    }

    async changePage(direction) {
        this.currentPage += direction;

        let url;
        if (this.searchTerm) {
            // Search results pagination
            url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(this.searchTerm)}&page=${this.currentPage}&limit=25`;
        } else {
            // Top anime pagination
            url = `https://api.jikan.moe/v4/top/anime?page=${this.currentPage}&limit=25`;
        }

        const data = await this.fetchAnime(url);
        if (data) {
            this.renderAnimeGrid(data.data);
            this.updatePagination(data);
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const animeApp = new AnimeApp();
});
