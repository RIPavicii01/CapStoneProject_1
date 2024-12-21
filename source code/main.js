// TMDB API 키
const tmdbApiKey = "";

// 영화 제목으로 추천받기 페이지로 이동
function goToMovieSearch() {
    window.location.href = "movie1.html";
}

// 장르로 추천받기 페이지로 이동
function goToGenreSelection() {
    window.location.href = "movie2.html";
}

// 영화 검색
async function searchMovies() {
    const query = document.getElementById('searchInput').value;
    if (!query) return alert("영화 제목을 입력하세요!");

    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${tmdbApiKey}`
        }
    });

    const data = await response.json();
    displayMovies(data.results.slice(0, 6), "searchResults"); // 최대 6개만 표시
}

// 랜덤 영화 추천
async function getRandomRecommendation() {
    const chatGptApiKey = "";
    const url = "https://api.openai.com/v1/chat/completions";

    const prompt = `아무 영화 6개를 영어 제목으로만 추천해줘. 제목만 줄바꿈으로 구분해서 반환해줘.`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${chatGptApiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }]
        })
    });

    const data = await response.json();
    const randomTitles = data.choices[0].message.content
        .split('\n') // 줄바꿈으로 나눔
        .map(title => title.trim()) // 공백 제거
        .filter(title => title.length > 0) // 빈 줄 제거
        .slice(0, 6); // 6개 제한

    // TMDB API로 각 영화 정보 가져오기
    const tmdbResponses = await Promise.all(
        randomTitles.map(async title => {
            const tmdbResponse = await fetch(
                `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&include_adult=false`,
                {
                    headers: {
                        Authorization: `Bearer ${tmdbApiKey}`,
                    },
                }
            );
            return tmdbResponse.json();
        })
    );

    const movies = tmdbResponses
        .map(data => data.results[0]) // 첫 번째 검색 결과 가져오기
        .filter(movie => movie); // 유효한 결과만 필터링

    displayMovies(movies, "randomResults"); // 영화 표시
}

// 영화 정보 표시
function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ""; // 초기화

    movies.forEach(movie => {
        const div = document.createElement("div");
        div.className = "movie";

        const posterBaseUrl = "https://image.tmdb.org/t/p/w500";
        const posterUrl = movie.poster_path ? `${posterBaseUrl}${movie.poster_path}` : "";

        div.innerHTML = `
            ${posterUrl ? `<img src="${posterUrl}" alt="${movie.title}">` : ''}
            <div>
                <strong>${movie.title}</strong> (${movie.release_date?.split('-')[0] || 'N/A'})
                <br>평점: ${movie.vote_average || 'N/A'}
            </div>
        `;

        container.appendChild(div);
    });
}
