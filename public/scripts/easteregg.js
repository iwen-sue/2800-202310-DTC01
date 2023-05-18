// JS code for easter egg from https://codepen.io/Wujek_Greg/pen/EpJwaj
// Modifications made: animation and music show up after clicking submit button, disappears after 2 minutes and 3 seconds,
//                     ,music volume increases gradually over 2 seconds, and dance animation floats down after song ends
// Pure CSS dance animation (no graphics included)

// Designed by Gustavo Viselner
// https://dribbble.com/shots/3979515-It-s-not-unusual

// Thanks for Una Kravets for Sass Pixel Art technique
// https://una.im/sass-pixel-art/


$(document).ready(function() {
    $("button.loginBtn").click(function(e) {
        if ($("input#email").val() === "tomjones@gmail.com") {
            e.preventDefault();
            $("main").after(`
                <span class="background">
                </span>
            `);

            $(".background").append(`
                <div class="screen stopBootstrap"></div>
                <ul class="dance-animation stopBootstrap floatUp">
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
                    src="/assets/easteregg.mp3">
                </audio>
                <script id="volControl">
                    var music = document.getElementById("music");
                    music.volume = 0;
                    const timer = setInterval(function() {
                        music.volume += 0.025;
                    }, 500);
                    setTimeout(function() {
                        clearInterval(timer);
                        console.log(music.volume)
                    }, 2000)
                </script>
            `)
            $(document).scrollTop($(document).height());
            setTimeout(function() {
                $(".dance-animation").addClass("paused");
                setTimeout(function() {
                    location.reload();
                    $(document).scrollTop();
                }, 1700)
            }, 60000*(2 + Math.floor(3/60)))
            
            $("span.background").click(function() {
                $(".dance-animation").addClass("paused");
                $("audio").volume = 0;
                setTimeout(function() {
                    location.reload();
                    $(document).scrollTop();
                }, 1700)
            });
        }
    });
});
