// 영화 리스트 저장
let movies = [];

// 영화 리스트에 추가
function addMovie() {
    const movieInput = document.getElementById('movieInput');
    const movie = movieInput.value.trim();
    if (movie) {
        movies.push(movie); // 영화 리스트에 추가
        movieInput.value = ''; // 입력 필드 초기화
        displayMovies(); // 영화 리스트 업데이트
    }
}

// 입력한 영화 리스트 표시
function displayMovies() {
    const movieList = document.getElementById('movieList');
    movieList.innerHTML = ''; // 리스트 초기화

    movies.forEach((movie, index) => {
        const li = document.createElement('li'); // 리스트 아이템 생성
        li.textContent = movie;

        // 삭제 버튼 추가
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X'; // 버튼 텍스트
        deleteButton.style.marginLeft = '10px'; // 간격 조정
        deleteButton.onclick = () => removeMovie(index); // 클릭 시 삭제 함수 호출

        li.appendChild(deleteButton); // 버튼을 리스트 아이템에 추가
        movieList.appendChild(li); // 리스트 아이템을 목록에 추가
    });
}

// 영화 리스트에서 특정 영화 삭제
function removeMovie(index) {
    movies.splice(index, 1); // 리스트에서 영화 삭제
    displayMovies(); // 영화 리스트 업데이트
}

// 추천받기
async function recommendMovies() {
    if (movies.length === 0) {
        alert('영화를 입력하세요!');
        return;
    }

    // ChatGPT API 호출
    const apiKey = "";
    const url = "https://api.openai.com/v1/chat/completions";

    // 영화 제목을 반드시 원문(영어)으로 반환하도록 요청
    const prompt = `
    사용자가 좋아하는 영화 목록: ${movies.join(', ')}.
    다음과 비슷한 영화를 추천해줘.
    반드시 영화 제목은 원문(영어)으로만 반환하고, 부가 설명 없이 제목만 목록으로 작성해줘.
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
    const recommendationList = document.getElementById('recommendationList');
    recommendationList.innerHTML = ''; // 초기화

    for (const title of recommendations) {
        const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&include_adult=false`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${tmdbApiKey}`
            }
        });
        
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const movie = data.results[0];
            displayMovieInfo(movie);
        } else {
            // 추천 영화 정보가 없는 경우 처리
            const li = document.createElement('li');
            li.textContent = `${title}: 정보를 찾을 수 없습니다.`;
            recommendationList.appendChild(li);
        }
    }
}

// 영화 정보 표시
function displayMovieInfo(movie) {
    const recommendationList = document.getElementById('recommendationList');
    const li = document.createElement('li');

    // 이미지 URL 생성
    const posterBaseUrl = "https://image.tmdb.org/t/p/w500";
    const posterUrl = movie.poster_path ? `${posterBaseUrl}${movie.poster_path}` : null;

    // 영화 정보 HTML 구성
    li.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
            ${posterUrl ? `<img src="${posterUrl}" alt="${movie.title}" style="width: 100px; margin-right: 10px;">` : ''}
            <div>
                <strong>${movie.title}</strong> (${movie.release_date?.split('-')[0] || 'N/A'})
                <br>평점: ${movie.vote_average || 'N/A'}
                <br>${movie.overview || '줄거리 정보 없음.'}
            </div>
        </div>
    `;
    recommendationList.appendChild(li);
}

