!(function ($) {
    "use strict";
    $(window).on("scroll", function () {
        $(window).scrollTop() > 70
            ? $(".backtop").addClass("reveal")
            : $(".backtop").removeClass("reveal");
    });
    $(".portfolio-single-slider").slick({
        infinite: true,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 2e3,
    });
$(".clients-logo").slick({
    infinite: true,
    arrows: false,
    autoplay: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    speed: 3000,          // controla a velocidade do movimento (maior = mais lento)
    autoplaySpeed: 0,     // inicia imediatamente, sem pausa
    cssEase: "linear",    // movimento contínuo
    responsive: [
        {
            breakpoint: 1024,
            settings: { slidesToShow: 6, slidesToScroll: 1, infinite: true }
        },
        { breakpoint: 900, settings: { slidesToShow: 4, slidesToScroll: 1 } },
        { breakpoint: 600, settings: { slidesToShow: 3, slidesToScroll: 1 } },
        { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 1 } }
    ],
});

    $(".testimonial-wrap").slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        dots: true,
        arrows: false,
        autoplay: true,
        vertical: true,
        verticalSwiping: true,
        autoplaySpeed: 6e3,
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 1, slidesToScroll: 1, infinite: true, dots: true },
            },
            { breakpoint: 900, settings: { slidesToShow: 1, slidesToScroll: 1 } },
            { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 1 } },
            { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
        ],
    });
    $(".testimonial-wrap-2").slick({
        slidesToShow: 2,
        slidesToScroll: 2,
        infinite: true,
        dots: true,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 6e3,
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 2, slidesToScroll: 2, infinite: true, dots: true },
            },
            { breakpoint: 900, settings: { slidesToShow: 1, slidesToScroll: 1 } },
            { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 1 } },
            { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
        ],
    });
    $(".counter-stat span").counterUp({ delay: 10, time: 1e3 });
    $(".js-scroll-trigger").click(function () {
        window.scrollTo(0, 0);
    });
    $("#contact-form").validate({
        rules: {
            email_from_name: { required: true },
            email_from_email: { required: true },
            email_subject: { required: true },
            phone: { digits: true },
            email_message: { required: true },
        },
        messages: {
            email_from_name: { required: "Please enter your name!" },
            email_from_email: { required: "Please enter your email!" },
            email_subject: { required: "Field cannot be empty!" },
            phone: { digits: "Please enter number only!" },
            email_message: { required: "Field cannot be empty!" },
        },
    });
    $("#contact-form").submit(function (event) {
        event.preventDefault();
        if ($("#contact-form").valid()) {
            var a = document.getElementById("contact-form");
            let b = new FormData(a);
            if (b.get("phone")) {
                let email_message = b.get("email_message");
                email_message += ` The phone number is ${b.get("phone")}.`;
                b.set("email_message", email_message);
            }
            $.ajax({
                url: "https://queser-email-hub.herokuapp.com/api/mail",
                type: "POST",
                data: b,
                processData: false,
                contentType:false,
                success: function (response) {
                    alert(response.message);
                    $("#contact-form").trigger("reset");
                },
            });
        }
    });
})(jQuery);
// Banner background carousel
// Banner background carousel (5s por slide)

// Patch slides that use --bg:url(...) to real background-image
(function () {
  document.querySelectorAll('.banner-slider .slide').forEach(function (slide) {
    var raw = slide.getAttribute('style') || '';
    var m = raw.match(/--bg:\s*url\((["']?)(.*?)\1\)/i);
    if (m && m[2]) {
      slide.style.backgroundImage = 'url(' + m[2] + ')';
      // keep other inline styles intact
      // console.log('Set slide bg:', m[2]);
    }
  });
})();
$(function(){

  var $slider = $('.banner-slider');

  $slider.on('init', function(event, slick){
    controlAutoplay(slick, slick.currentSlide);
  });

  $slider.on('afterChange', function(event, slick, currentSlide){
    controlAutoplay(slick, currentSlide);
  });

  $slider.slick({
    dots: true,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 7000,   // default, but we'll override manually
    speed: 700,
    fade: true,
    cssEase: 'linear',
    pauseOnHover: false,
    adaptiveHeight: false
  });

  var timer;

  function controlAutoplay(slick, index){
    clearTimeout(timer);

    var $cur = $(slick.$slides[index]);
    var isVideo = $cur.hasClass('video-slide');

    // pause Slick's internal autoplay
    slick.slickPause();

    // play video if exists
    $cur.find('video').each(function(){
      this.currentTime = 0;
      this.play && this.play();
    });

    // choose duration
    var delay = isVideo ? 12000 : 7000;

    timer = setTimeout(function(){
      slick.slickNext();
    }, delay);
  }

});
