// Pure CSS dance animation (no graphics included)


// Designed by Gustavo Viselner
// https://dribbble.com/shots/3979515-It-s-not-unusual

// Thanks for Una Kravets for Sass Pixel Art technique
// https://una.im/sass-pixel-art/

// Making time ~ 7 hours

// Some Js for audio toggle

// var music = document.getElementById("music");
// var isPlaying = false;
// music.volume = 0.4;
// function togglePlay() {
//   if (isPlaying) {
//     music.pause()
//   } else {
//     music.play();
//   }
// };
// music.onplaying = function() {
//   isPlaying = true;
//   document.getElementById("music-animation").classList.add('on')
// };
// music.onpause = function() {
//   isPlaying = false;
//   document.getElementById("music-animation").classList.remove('on')
// };

// var button = document.getElementById("toggle");
// button.addEventListener('click', function() {
//   if (button.getAttribute("data-text-swap") == button.innerHTML) {
//     button.innerHTML = button.getAttribute("data-text-original");
//   } else {
//     button.setAttribute("data-text-original", button.innerHTML);
//     button.innerHTML = button.getAttribute("data-text-swap");
//   }
// }, false);


$(document).ready(function() {

    $("button#easterEggBtn").click(function() {
    $("button#easterEggBtn").hide();
    $(".easterEgg").after(`
        <button id="stopEasterEggBtn">Stop</button>
        <div class="screen stopBootstrap"></div>
        <ul class="dance-animation stopBootstrap">
            <li class="dance-frame dance-animation--dancer1 stopBootstrap"></li>
            <li class="dance-frame dance-animation--dancer2 stopBootstrap"></li>
            <li class="dance-frame dance-animation--dancer3 stopBootstrap"></li>
            <li class="dance-frame dance-animation--dancer4 stopBootstrap"></li>
            <li class="dance-frame dance-animation--dancer5 stopBootstrap"></li>
            <li class="dance-frame dance-animation--dancer6 stopBootstrap"></li>
            <li class="dance-frame dance-animation--dancer7 stopBootstrap"></li>
            <li class="dance-frame dance-animation--dancer8 stopBootstrap"></li>
            <li class="dance-frame dance-animation--dancer9 stopBootstrap"></li>
            <li class="dance-frame dance-animation--dancer10 stopBootstrap"></li>
            <li class="dance-frame dance-animation--dancer11 stopBootstrap"></li>
        </ul>

        <audio id="music" autoplay="autoplay"
            src="./Tom_Jones_-_Its_Not_Unusual_[NaijaGreen.Com]_.mp3">
        </audio>
        <script>
            var music = document.getElementById("music");
            var isPlaying = false;
            music.volume = 0.4;

        </script>
    `)
        setTimeout(function() {
            $(".screen").remove();
            $(".dance-animation").remove();
            $("audio").remove();
            $("button#stopEasterEggBtn").remove();
            $("button#easterEggBtn").show();
        }, 60000*(2 + Math.floor(3/60)))

        $("button#stopEasterEggBtn").click(function() {
            $(".screen").remove();
            $(".dance-animation").remove();
            $("audio").remove();
            $("button#stopEasterEggBtn").remove();
            $("button#easterEggBtn").show();
        });
    })
});
          // <div class="play-music">
          //     <div id="music-animation" class="music-animation">
          //         <span class="bar bar1"></span>
          //         <span class="bar bar2"></span>
          //         <span class="bar bar3"></span>
          //         <span class="bar bar4"></span>
          //         <span class="bar bar5"></span>
          //     </div>
          //     <div class="music-toggle"><a onClick="togglePlay()" id="toggle" data-text-swap="Music on">Music off</a></div>
          // </div>

          // <iframe width="0" height="0"
          //     src="https://www.1youtuberepeater.com/watch?v=kWvbJsB0OBc&name=Tom+Jones+Its+Not+Unusual+With+Lyrics"
          //     frameborder="0" allowfullscreen></iframe>

