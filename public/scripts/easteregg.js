// Pure CSS dance animation (no graphics included)

// Designed by Gustavo Viselner
// https://dribbble.com/shots/3979515-It-s-not-unusual

// Thanks for Una Kravets for Sass Pixel Art technique
// https://una.im/sass-pixel-art/


$(document).ready(function() {
    $("button#inviteBtn").click(function(e) {
        console.log("clicked");
        console.log($("input#inviteeEmail").val());
        if ($("input#inviteeEmail").val() === "tomjones@gmail.com") {
            e.preventDefault();
            console.log("haha")
            $("#addMemberModal").detach();
            $("body").toggleClass("modal-open");
            $(".modal-backdrop").detach();

            $(".screen").remove();
            $(".dance-animation").remove();
            $("audio").remove();
            $("#volControl").remove();

            $(".easterEgg").after(`
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
                    src="/assets/easteregg.mp3">
                </audio>
                <script id="volControl">
                    var music = document.getElementById("music");
                    var isPlaying = false;
                    music.volume = 0.4;

                </script>
            `)
            $(".screen").focus();
            setTimeout(function() {
                location.reload();
                // $(".screen").remove();
                // $(".dance-animation").remove();
                // $("audio").remove();
                // $("#volControl").remove();            
                // $("#addMemberModal").show();
            }, 60000*(2 + Math.floor(3/60)))
            
            $("span.background").click(function() {
                // $(".screen").remove();
                // $(".dance-animation").remove();
                // $("audio").remove();
                // $("#volControl").remove();
                // $("#addMemberModal").show();
                location.reload();
            });
        }
    });
});
