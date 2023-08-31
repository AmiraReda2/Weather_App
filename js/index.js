//! Links API (Weather - images)
//? link api====> https://api.weatherapi.com/v1/forecast.json?key=74a45b686a6248ca87e111514233008&q=London&days=7
//? link api===> images https://api.unsplash.com/search/photos?page=cairo&query=${city}&client_id=maVgNo3IKVd7Pw7-_q4fywxtQCACntlNXKBBsFdrBzI&per_page=5&orientation=landscape
//?التحويل من 24 الي 12 ساعه .......${now.getHours() > 12 ? now.getHours()- 12 : now.getHours()}

//!========================> HTML Elements
const cardsContainer = document.querySelector(".forecast-cards");
const searchBox = document.getElementById("searchBox");
const locationElement = document.querySelector("p.location");
const allBars = document.querySelectorAll(".clock");
const cityContainer = document.querySelector(".city-items")


//!=====================> App Variables 
const apiKey = "74a45b686a6248ca87e111514233008";
const baseUrl ="https://api.weatherapi.com/v1/forecast.json";
const currenLocation = " cairo"
// لو لقيت الداتا متخزنه خدها ملقتش خليها فاضيه 
let recentCities = JSON.parse(localStorage.getItem("cities")) || [] ;

//!>>>>>>>>>>>>>>>>>>>> Functions 
 // get weather
async function getWeather(location){
    const response = await fetch(`${baseUrl} ?key=${apiKey}&days=7&q=${location}`);
    // console.log(response);
    if(response.status !== 200 && searchBox.value !== "") {
      searchBox.value = "";
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please Enter a valid City or location',
      })
      return
    } 
    const data = await response.json();
    displayWeather(data);
    searchBox.value = "";
}
 // get location
function success(position){
    const currenLocation = ` ${position.coords.latitude},${position.coords.longitude} `
    getWeather(currenLocation);
}

// get the data in API
 function displayWeather(data){
  locationElement.innerHTML = `<span class="city-name">${data.location.name}</span> , ${data.location.country} `
    const days = data.forecast.forecastday;
    const now = new Date();
    let cardsHTML="";
     for(let [index , day] of days.entries()){
        const date  = new Date(day.date);
        cardsHTML += `
      <div class="${index == 0 ? "card active" : "card"}" data-index=${index}>
      <div class="card-header">
          <div class="day">${date.toLocaleDateString("en-us", {weekday: "long"})}</div>
          <div class="time">${now.getHours()}: ${now.getMinutes()} ${now.getHours() > 11 ? "PM": "Am"}</div>
      </div>

      <div class="card-body">
         <img  src = "./images/conditions/${day.day.condition.text}.svg"/>
         <div class="degree">${day.hour[now.getHours()].temp_c}C°</div>
      </div>

      <div class="card-data">
        <ul class="left-column">
          <li>Real Feel: <span class="real-feel">${day.hour[now.getHours()].feelslike_c} C°</span></li>
          <li>Wind: <span class="wind">${day.hour[now.getHours()].wind_kph} Mph </span></li>
          <li>Pressure: <span class="pressure">${day.hour[now.getHours()].pressure_mb} Mp</span></li>
          <li>Humidity: <span class="humidity">${day.hour[now.getHours()].humidity} %</span></li>
        </ul>

        <ul class="right-column">
          <li>Sunrise: <span class="sunrise">${day.astro.sunrise}</span></li>
          <li>Sunset: <span class="sunset">${day.astro.sunset}</span></li>
        </ul>
      </div>
    </div>
    `
} 

let exist = recentCities.find(function(currentCity){
  return currentCity.city == data.location.name
})
if(exist) return
recentCities.push({city:data.location.name , country: data.location.country});
localStorage.setItem("cities", JSON.stringify(recentCities));
displayCity(data.location.name , data.location.country)

cardsContainer.innerHTML = cardsHTML;
const allCards = document.querySelectorAll(".card");

for (let card of allCards) {
  card.addEventListener("click", function(event){
    const activeCard = document.querySelector(".card.active");
    //currentTarget بتجب الكارد كله اللي تم عليه الضفطه
    activeCard .classList.remove("active");
    event.currentTarget.classList.add("active");
    diplsyRainInfo(days[event.currentTarget.dataset.index]);
   })
  }
}
// get Chance of rain
function diplsyRainInfo(weatherInfo){
  // console.log(weatherInfo);
   for(let element of allBars){
    const clock = element.dataset.clock;
    const height = weatherInfo.hour[clock].chance_of_rain;
    element.querySelector(".percent").style.height = `${height}%` ;
   }
}
 
// get image 
async function getCityImage(city){
  const response = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${city}&client_id=maVgNo3IKVd7Pw7-_q4fywxtQCACntlNXKBBsFdrBzI&per_page=5&orientation=landscape`)
  const data = await response.json();
 return data.results;
}
  // get src image 
 async function displayCity(city , country){
  let imgArr = await getCityImage(city);
 if(imgArr.length !==0){
  const random = Math.trunc( Math.random() * imgArr.length) ;
  let imgScr = imgArr[random].urls.regular;
  let itemContent = `
  <div class="item">
    <div class="city-image">
      <img src="${imgScr}" alt="Image for ${city} city" />
    </div>
    <div class="city-name"><span class="city-name">${city}</span>, ${country}</div>
  </div>
`;
  cityContainer.innerHTML += itemContent;
 }
 }


//!=================================> Events
window.addEventListener("load", function(){
    navigator.geolocation.getCurrentPosition(success);
    for(let i= 0 ; i<recentCities.length; i++){
      displayCity(recentCities[i].city , recentCities[i].country);
    }
})

searchBox.addEventListener("blur", function(){
 getWeather(this.value)
})

document.addEventListener("keyup", function(e){
  if(e.key == "Enter") getWeather(searchBox.value);
})