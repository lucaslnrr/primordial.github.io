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
      speed: 3000,
      autoplaySpeed: 0,
      cssEase: "linear",
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
  // Validator: check $.fn.validate (plugin function), not $.validator (object)
  if ($.fn && typeof $.fn.validate === "function") {
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

  // Preenche o timestamp de criação do formulário (time-trap)
  $(function () {
    var tsInput = document.querySelector('#contact-form input[name="form_ts"]');
    if (tsInput) tsInput.value = Math.floor(Date.now() / 1000);
  });

  // AJAX submit com proteção anti duplo-clique
  $('#contact-form').on('submit', function (e) {
    e.preventDefault();
    var $form = $(this);

    if (typeof $form.valid === 'function' && !$form.valid()) return;

    var fd = new FormData(this);

    // Acrescenta telefone ao corpo da mensagem
    var phone = fd.get('phone');
    if (phone) {
      var msg = fd.get('email_message') || '';
      if (msg.trim().length) msg += '\n';
      msg += 'Telefone: ' + phone;
      fd.set('email_message', msg);
    }

    var $btn = $('#contact-form-submit').prop('disabled', true).addClass('disabled');

    $.ajax({
      url: 'https://mailtest.tesfire.com/api/mail',
      method: 'POST',
      data: fd,
      processData: false,
      contentType: false,
      success: function (res) {
        alert((res && res.message) ? res.message : 'Mensagem enviada com sucesso.');
        $form.trigger('reset');
        // Reinicia o time-trap
        var tsInput = $form.find('input[name="form_ts"]')[0];
        if (tsInput) tsInput.value = Math.floor(Date.now() / 1000);
      },
      error: function (xhr) {
        var msg = 'Erro ao enviar.';
        try { msg = JSON.parse(xhr.responseText).message; } catch (e) { }
        alert(msg);
      },
      complete: function () {
        $btn.prop('disabled', false).removeClass('disabled');
      }
    });
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

      slick.slickPause();

      $cur.find("video").each(function () {
        try { this.currentTime = 0; this.play && this.play(); } catch (e) {}
      });

      var delay = isVideo ? 12000 : 7000;
      timer = setTimeout(function () { slick.slickNext(); }, delay);
    }

    $slider.on("init", function (e, slick) {
      controlAutoplay(slick, slick.currentSlide);
    });

    $slider.on("beforeChange", function (e, slick, cur) {
      var $leaving = $(slick.$slides[cur]);
      $leaving.find("video").each(function () {
        try { this.pause && this.pause(); } catch (e) {}
      });
    });

    $slider.on("afterChange", function (e, slick, current) {
      controlAutoplay(slick, current);
    });

    $slider.slick({
      dots: true,
      arrows: false,
      autoplay: true,     // start, then we manage timing manually
      autoplaySpeed: 7000,
      speed: 700,
      fade: true,
      cssEase: "linear",
      pauseOnHover: false,
      adaptiveHeight: false
    });
  }

})(jQuery);
