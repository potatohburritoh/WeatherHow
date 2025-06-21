const cityInput = document.querySelector('.city-input')
const searchBtn = document.querySelector('.search-btn')

const weatherInfoSection = document.querySelector('.weather-info')
const notFoundSection = document.querySelector('.not-found')
const searchCitySection = document.querySelector('.search-city')

const countryTxt = document.querySelector('.country-txt')
const tempTxt = document.querySelector('.temp-txt')
const conditionTxt = document.querySelector('.condition-txt')
const humidityValueTxt = document.querySelector('.humidity-value-txt')
const windValueTxt = document.querySelector('.wind-value-txt')
const weatherSummaryImg = document.querySelector('.weather-summary-img')
const currentDateTxt = document.querySelector('.current-date-txt')

const forecastItemsContainer = document.querySelector('.forecast-items-container')

const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
})
cityInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' && 
        cityInput.value.trim() != ''
    ) {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
})

async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`

    const response = await fetch(apiUrl)

    return response.json()
}

function getCurrentDate(timeZone) {
    const now = new Date()
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000

    const cityLocalMs = utcMs + (timeZone * 1000)
    const cityTime = new Date(cityLocalMs)

    const date = cityTime.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })

    const time = cityTime.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })

    return `${date}\n${time}`
}

function getDate(date) {
    const dateOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }
    return new Date(date).toLocaleDateString('en-GB', dateOptions)
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city)

    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection)
        return
    }

    const {
        name: country,
        main: { temp, humidity }, 
        timezone: timeZone,
        weather: [{ main, icon }],
        wind: { speed }
    } = weatherData

    console.log(weatherData)
    countryTxt.textContent = country
    tempTxt.textContent = `${Math.round(temp)}°C`
    conditionTxt.textContent = main
    humidityValueTxt.textContent = `${humidity} %`
    windValueTxt.textContent = `${speed} m/s`

    currentDateTxt.textContent = getCurrentDate(timeZone)
    weatherSummaryImg.src = `src/assets/weather/${(icon)}.svg`

    await updateForcastsInfo(city)
    showDisplaySection(weatherInfoSection)
}

async function updateForcastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city)

    const timeTaken = '12:00:00'
    const todayDate = new Date().toISOString().split('T')[0]

    forecastItemsContainer.innerHTML = ''
    forecastsData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) && 
            !forecastWeather.dt_txt.includes(todayDate)
        ) {
            updateForecastItems(forecastWeather)
        }
        
    })
}

function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ icon }],
        main: { temp }
    } = weatherData;

    // Preload the image
    const img = new Image();
    img.onload = function() {
        // Image loaded successfully, now insert the HTML
        const forecastItem = `
            <div class="forecast-item">
                <h5 class="forecast-item-date regular-txt">${getDate(date)}</h5>
                <img src="src/assets/weather/${icon}.svg" class="forecast-item-img" />
                <h5 class="forecast-item-temp">${Math.round(temp)} ℃</h5>
            </div>
        `;
        forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
    };
    
    img.src = `src/assets/weather/${icon}.svg`;
}

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(section => section.style.display = 'none')

    section.style.display = 'flex'
}
