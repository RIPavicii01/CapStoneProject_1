// 장르 목록 (TMDB 영어-한국어 매핑)
const genres = [
    { en: "Action", ko: "액션" },
    { en: "Adventure", ko: "모험" },
    { en: "Animation", ko: "애니메이션" },
    { en: "Comedy", ko: "코미디" },
    { en: "Crime", ko: "범죄" },
    { en: "Documentary", ko: "다큐멘터리" },
    { en: "Drama", ko: "드라마" },
    { en: "Family", ko: "가족" },
    { en: "Fantasy", ko: "판타지" },
    { en: "History", ko: "역사" },
    { en: "Horror", ko: "공포" },
    { en: "Music", ko: "음악" },
    { en: "Mystery", ko: "미스터리" },
    { en: "Romance", ko: "로맨스" },
    { en: "Science Fiction", ko: "SF" },
    { en: "TV Movie", ko: "TV 영화" },
    { en: "Thriller", ko: "스릴러" },
    { en: "War", ko: "전쟁" },
    { en: "Western", ko: "서부극" },
    { en: "Biography", ko: "전기" },
    { en: "Sport", ko: "스포츠" },
    { en: "Musical", ko: "뮤지컬" },
    { en: "Superhero", ko: "슈퍼히어로" },
    { en: "Indie", ko: "인디" },
    { en: "Anime", ko: "애니메" },
    { en: "Psychological", ko: "심리" },
    { en: "Noir", ko: "느와르" },
    { en: "Epic", ko: "서사" },
    { en: "Disaster", ko: "재난" },
    { en: "Martial Arts", ko: "무술" }
];

// 선택한 장르 리스트 (영어 키워드 저장)
let selectedGenres = [];

// 초기화: 장르 목록 생성
const genreContainer = document.getElementById("genreContainer");
genres.forEach(genre => {
    const div = document.createElement("div");
    div.textContent = genre.ko; // 한국어 표시
    div.className = "genre";
    div.onclick = () => toggleGenre(genre.en, div); // 영어 키워드 저장
    genreContainer.appendChild(div);
});

// 장르 선택/취소
function toggleGenre(genre, element) {
    if (selectedGenres.includes(genre)) {
        selectedGenres = selectedGenres.filter(g => g !== genre);
        element.classList.remove("selected");
    } else {
        selectedGenres.push(genre);
        element.classList.add("selected");
    }
    displaySelectedGenres();
}

// 선택한 장르 표시
function displaySelectedGenres() {
    const selectedDiv = document.getElementById("selectedGenres");
    selectedDiv.innerHTML = ""; // 초기화
    selectedGenres.forEach(genre => {
        const koGenre = genres.find(g => g.en === genre).ko; // 한국어 변환
        const span = document.createElement("span");
        span.textContent = koGenre;
        span.style.marginRight = "10px";
        selectedDiv.appendChild(span);
    });
}

// 추천받기
async function recommendMovies() {
    if (selectedGenres.length === 0) {
        alert("장르를 선택하세요!");
        return;
    }

    // ChatGPT API 호출
    const apiKey = "";
    const url = "https://api.openai.com/v1/chat/completions";

    const prompt = `
        내가 선택한 장르: ${selectedGenres.join(', ')}.
        이 장르에 해당하는 영화 5개를 영어 제목만 추천해줘.
    `;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }]
        })
    });

    const data = await response.json();
    const recommendations = data.choices[0].message.content
        .split('\n') // 줄바꿈으로 나눔
        .map(rec => rec.trim()) // 앞뒤 공백 제거
        .filter(rec => rec.length > 0); // 빈 줄 제거

    // 추천 영화 목록으로 TMDB API 호출
    fetchMovieDetails(recommendations);
}


// TMDB API를 사용하여 영화 정보 가져오기
async function fetchMovieDetails(recommendations) {
    const tmdbApiKey = "";
    const recommendationList = document.getElementById("recommendationList");
    recommendationList.innerHTML = ""; // 초기화

    for (const title of recommendations) {
        const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&include_adult=false`;

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${tmdbApiKey}`
                }
            });

            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const movie = data.results[0];
                displayMovieInfo(movie);
            } else {
                displayErrorMessage(title);
            }
        } catch (error) {
            console.error("Error fetching movie details:", error);
            displayErrorMessage(title);
        }
    }
}

// 영화 정보 표시
function displayMovieInfo(movie) {
    const recommendationList = document.getElementById("recommendationList");
    const div = document.createElement("div");
    div.className = "movie";

    const posterBaseUrl = "https://image.tmdb.org/t/p/w500";
    const posterUrl = movie.poster_path ? `${posterBaseUrl}${movie.poster_path}` : null;

    div.innerHTML = `
        ${posterUrl ? `<img src="${posterUrl}" alt="${movie.title}">` : ''}
        <div>
            <strong>${movie.title}</strong> (${movie.release_date?.split('-')[0] || 'N/A'})
            <br>평점: ${movie.vote_average || 'N/A'}
            <br>${movie.overview || '줄거리 정보 없음.'}
        </div>
    `;

    recommendationList.appendChild(div);
}

// 영화 정보를 찾을 수 없을 때 에러 메시지 표시
function displayErrorMessage(title) {
    const recommendationList = document.getElementById("recommendationList");
    const div = document.createElement("div");
    div.textContent = `${title}: 정보를 찾을 수 없습니다.`;
    recommendationList.appendChild(div);
}


