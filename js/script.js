(function ($) {
  "use strict";

  // == Helpers ==
  function hasPlugin(fn) { return typeof fn === "function"; }

  // Back-to-top reveal
  $(window).on("scroll", function () {
    $(window).scrollTop() > 70
      ? $(".backtop").addClass("reveal")
      : $(".backtop").removeClass("reveal");
  });

  // ===== Slick sliders (only if loaded) =====
  if (hasPlugin($.fn.slick)) {
    // Portfolio single
    $(".portfolio-single-slider").slick({
      infinite: true,
      arrows: false,
      autoplay: true,
      autoplaySpeed: 2000
    });

    // Clients logos – smooth marquee style
    $(".clients-logo").slick({
      infinite: true,
      arrows: false,
      autoplay: true,
      slidesToShow: 6,
      slidesToScroll: 1,
      speed: 3000,       // higher = slower movement
      autoplaySpeed: 0,  // immediate, continuous
      cssEase: "linear", // smooth continuous scroll
      pauseOnHover: false,
      responsive: [
        { breakpoint: 1024, settings: { slidesToShow: 6 } },
        { breakpoint: 900,  settings: { slidesToShow: 4 } },
        { breakpoint: 600,  settings: { slidesToShow: 3 } },
        { breakpoint: 480,  settings: { slidesToShow: 2 } }
      ]
    });

    // Testimonials (vertical)
    $(".testimonial-wrap").slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      infinite: true,
      dots: true,
      arrows: false,
      autoplay: true,
      vertical: true,
      verticalSwiping: true,
      autoplaySpeed: 6000,
      responsive: [
        { breakpoint: 1024, settings: { slidesToShow: 1, dots: true } },
        { breakpoint: 900,  settings: { slidesToShow: 1 } },
        { breakpoint: 600,  settings: { slidesToShow: 1 } },
        { breakpoint: 480,  settings: { slidesToShow: 1 } }
      ]
    });

    // Testimonials (2 cols)
    $(".testimonial-wrap-2").slick({
      slidesToShow: 2,
      slidesToScroll: 2,
      infinite: true,
      dots: true,
      arrows: false,
      autoplay: true,
      autoplaySpeed: 6000,
      responsive: [
        { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 2, dots: true } },
        { breakpoint: 900,  settings: { slidesToShow: 1, slidesToScroll: 1 } },
        { breakpoint: 600,  settings: { slidesToShow: 1, slidesToScroll: 1 } },
        { breakpoint: 480,  settings: { slidesToShow: 1, slidesToScroll: 1 } }
      ]
    });
  }

  // CounterUp (guarded)
  if (hasPlugin($.fn.counterUp)) {
    $(".counter-stat span").counterUp({ delay: 10, time: 1000 });
  }

  // Scroll trigger
  $(".js-scroll-trigger").on("click", function () { window.scrollTo(0, 0); });

  // ===== Contact form =====
  // Add a phone validator that allows +, spaces, (), and dashes
  if (hasPlugin($.validator)) {
    $.validator.addMethod("phoneLoose", function (value, element) {
      if (!value) return true; // optional
      return /^\+?\d[\d\s()\-]{5,}$/.test(value);
    }, "Digite um telefone válido.");

    $("#contact-form").validate({
      rules: {
        email_from_name:  { required: true },
        email_from_email: { required: true, email: true },
        email_subject:    { required: true },
        phone:            { phoneLoose: true },
        email_message:    { required: true }
      },
      messages: {
        email_from_name:  { required: "Por favor, informe seu nome!" },
        email_from_email: { required: "Informe seu e-mail!", email: "E-mail inválido!" },
        email_subject:    { required: "Campo obrigatório!" },
        phone:            { phoneLoose: "Digite um telefone válido!" },
        email_message:    { required: "Campo obrigatório!" }
      },
      errorPlacement: function (err, el) { err.insertAfter(el); }
    });
  }

  // Submit via AJAX (prevent double submit)
  $("#contact-form").on("submit", function (event) {
    event.preventDefault();
    var $form = $(this);

    if (!hasPlugin($.validator) || $form.valid()) {
      var formEl = $form.get(0);
      var fd = new FormData(formEl);

      // Append phone into message (as you had)
      var phone = fd.get("phone");
      if (phone) {
        var msg = fd.get("email_message") || "";
        msg += " The phone number is " + phone + ".";
        fd.set("email_message", msg);
      }

      var $btn = $("#contact-form-submit");
      $btn.prop("disabled", true);

      $.ajax({
        url: "https://mailtest.tesfire.com/api/mail",
        type: "POST",
        data: fd,
        processData: false,
        contentType: false,
        success: function (response) {
          alert((response && response.message) || "Enviado.");
          $form.trigger("reset");
        },
        error: function (xhr) {
          var msg = "Erro inesperado.";
          try { msg = JSON.parse(xhr.responseText).message || msg; } catch (e) {}
          alert(msg);
        },
        complete: function () {
          $btn.prop("disabled", false);
        }
      });
    }
  });

  // ===== Banner background carousel + video timing =====
  // Convert --bg:url(...) into background-image
  document.querySelectorAll(".banner-slider .slide").forEach(function (slide) {
    var raw = slide.getAttribute("style") || "";
    var m = raw.match(/--bg:\s*url\((["']?)(.*?)\1\)/i);
    if (m && m[2]) {
      slide.style.backgroundImage = "url(" + m[2] + ")";
      slide.style.backgroundSize = slide.style.backgroundSize || "cover";
      slide.style.backgroundPosition = slide.style.backgroundPosition || "center";
    }
  });

  if (hasPlugin($.fn.slick)) {
    var $slider = $(".banner-slider");
    var timer;

    function controlAutoplay(slick, index) {
      clearTimeout(timer);
      var $cur = $(slick.$slides[index]);
      var isVideo = $cur.hasClass("video-slide");

      // Pause Slick internal autoplay; we'll drive it manually
      slick.slickPause();

      // Reset & play videos on the current slide
      $cur.find("video").each(function () {
        try { this.currentTime = 0; this.play && this.play(); } catch (e) {}
      });

      var delay = isVideo ? 12000 : 7000; // 12s for video slides, 7s others
      timer = setTimeout(function () { slick.slickNext(); }, delay);
    }

    $slider.on("init", function (e, slick) {
      controlAutoplay(slick, slick.currentSlide);
    });

    // Pause/stop videos on the slide we're leaving
    $slider.on("beforeChange", function (e, slick, cur, next) {
      var $leaving = $(slick.$slides[cur]);
      $leaving.find("video").each(function () {
        try { this.pause && this.pause(); } catch (e) {}
      });
    });

    // Start timing on the new slide
    $slider.on("afterChange", function (e, slick, current) {
      controlAutoplay(slick, current);
    });

    $slider.slick({
      dots: true,
      arrows: false,
      autoplay: true,     // required, but we’ll immediately pause and manage ourselves
      autoplaySpeed: 7000,
      speed: 700,
      fade: true,
      cssEase: "linear",
      pauseOnHover: false,
      adaptiveHeight: false
    });
  }

})(jQuery);