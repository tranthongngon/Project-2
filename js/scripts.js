
var MINIMALDOG = MINIMALDOG || {};

(function($) {
    // USE STRICT
    "use strict";

    var $window = $(window);
    var $document = $(document);
    var $goToTopEl = $(".js-go-top-el");
    var $overlayBg = $(".js-overlay-bg");

    MINIMALDOG.header = {
        init: function() {
            MINIMALDOG.header.ajaxSearch();
            MINIMALDOG.header.loginForm();
            MINIMALDOG.header.offCanvasMenu();
            MINIMALDOG.header.priorityNavInit();
            MINIMALDOG.header.searchToggle();
            MINIMALDOG.header.smartAffix.init({
                fixedHeader: ".js-sticky-header",
                headerPlaceHolder: ".js-sticky-header-holder",
            });
        },

        /* ============================================================================
         * Header dropdown search
         * ==========================================================================*/
        searchToggle: function() {
            var $headerSearchDropdown = $("#header-search-dropdown");
            var $searchDropdownToggle = $(".js-search-dropdown-toggle");
            var $mobileHeader = $("#atbs-mobile-header");
            var $stickyHeaderNav = $("#atbs-sticky-header").find(
                ".navigation-bar__inner"
            );
            var $staticHeaderNav = $(".site-header").find(
                ".navigation-bar__inner"
            );
            var $headerSearchDropdownInput = $headerSearchDropdown.find(
                ".search-form__input"
            );

            $headerSearchDropdown.on("click", function(e) {
                e.stopPropagation();
            });

            $searchDropdownToggle.on("click", function(e) {
                e.stopPropagation();
                var $toggleBtn = $(this);
                var position = "";

                if ($toggleBtn.hasClass("mobile-header-btn")) {
                    position = "mobile";
                } else if ($toggleBtn.parents(".sticky-header").length) {
                    position = "sticky";
                } else {
                    position = "navbar";
                }

                if (
                    $headerSearchDropdown.hasClass("is-in-" + position) ||
                    !$headerSearchDropdown.hasClass("is-active")
                ) {
                    $headerSearchDropdown.toggleClass("is-active");
                }

                switch (position) {
                    case "mobile":
                        if (!$headerSearchDropdown.hasClass("is-in-mobile")) {
                            $headerSearchDropdown.addClass("is-in-mobile");
                            $headerSearchDropdown.removeClass("is-in-sticky");
                            $headerSearchDropdown.removeClass("is-in-navbar");
                            $headerSearchDropdown.appendTo($mobileHeader);
                        }
                        break;

                    case "sticky":
                        if (!$headerSearchDropdown.hasClass("is-in-sticky")) {
                            $headerSearchDropdown.addClass("is-in-sticky");
                            $headerSearchDropdown.removeClass("is-in-mobile");
                            $headerSearchDropdown.removeClass("is-in-navbar");
                            $headerSearchDropdown.insertAfter($stickyHeaderNav);
                        }
                        break;

                    default:
                        if (!$headerSearchDropdown.hasClass("is-in-navbar")) {
                            $headerSearchDropdown.addClass("is-in-navbar");
                            $headerSearchDropdown.removeClass("is-in-sticky");
                            $headerSearchDropdown.removeClass("is-in-mobile");
                            $headerSearchDropdown.insertAfter($staticHeaderNav);
                        }
                }

                if ($headerSearchDropdown.hasClass("is-active")) {
                    setTimeout(function() {
                        $headerSearchDropdownInput.focus();
                    }, 200);
                }
            });

            $document.on("click", function() {
                $headerSearchDropdown.removeClass("is-active");
            });

            $window.on("stickyHeaderHidden", function() {
                if ($headerSearchDropdown.hasClass("is-in-sticky")) {
                    $headerSearchDropdown.removeClass("is-active");
                }
            });
        },

        /* ============================================================================
         * AJAX search
         * ==========================================================================*/
        ajaxSearch: function() {
            var $results = null;
            var $ajaxSearch = $(".js-ajax-search");
            var ajaxStatus = "";
            var noResultText =
                '<span class="noresult-text">There is no result.</span>';
            var errorText =
                '<span class="error-text">There was some error.</span>';

            $ajaxSearch.each(function() {
                var $this = $(this);
                var $searchForm = $this.find(".search-form__input");
                var $resultsContainer = $this.find(".search-results");
                var $resultsInner = $this.find(".search-results__inner");
                var searchTerm = "";
                var lastSearchTerm = "";

                $searchForm.on(
                    "input",
                    $.debounce(800, function() {
                        searchTerm = $searchForm.val();

                        if (searchTerm.length > 0) {
                            $resultsContainer.addClass("is-active");

                            if (
                                searchTerm != lastSearchTerm ||
                                ajaxStatus === "failed"
                            ) {
                                $resultsContainer
                                    .removeClass("is-error")
                                    .addClass("is-loading");
                                lastSearchTerm = searchTerm;
                                ajaxLoad(
                                    searchTerm,
                                    $resultsContainer,
                                    $resultsInner
                                );
                            }
                        } else {
                            $resultsContainer.removeClass("is-active");
                        }
                    })
                );
            });

            function ajaxLoad(searchTerm, $resultsContainer, $resultsInner) {
                var ajaxCall = $.ajax({
                    url: "inc/ajax-search.html",
                    type: "post",
                    dataType: "html",
                    data: {
                        searchTerm: searchTerm,
                    },
                });

                ajaxCall.done(function(respond) {
                    $results = $(respond);
                    ajaxStatus = "success";
                    if (!$results.length) {
                        $results = noResultText;
                    }
                    $resultsInner
                        .html($results)
                        .css("opacity", 0)
                        .animate({ opacity: 1 }, 500);
                });

                ajaxCall.fail(function() {
                    ajaxStatus = "failed";
                    $resultsContainer.addClass("is-error");
                    $results = errorText;
                    $resultsInner
                        .html($results)
                        .css("opacity", 0)
                        .animate({ opacity: 1 }, 500);
                });

                ajaxCall.always(function() {
                    $resultsContainer.removeClass("is-loading");
                });
            }
        },

        /* ============================================================================
         * Login Form tabs
         * ==========================================================================*/
        loginForm: function() {
            var $loginFormTabsLinks = $(".js-login-form-tabs").find("a");

            $loginFormTabsLinks.on("click", function(e) {
                e.preventDefault();
                $(this).tab("show");
            });
        },

        /* ============================================================================
         * Offcanvas Menu
         * ==========================================================================*/
        offCanvasMenu: function() {
            var $backdrop = $('<div class="atbs-offcanvas-backdrop"></div>');
            var $offCanvas = $(".js-atbs-offcanvas");
            var $offCanvasToggle = $(".js-atbs-offcanvas-toggle");
            var $offCanvasClose = $(".js-atbs-offcanvas-close");
            var $offCanvasMenuHasChildren = $(".navigation--offcanvas").find(
                "li.menu-item-has-children > a"
            );
            var menuExpander =
                '<div class="submenu-toggle"><i class="mdicon mdicon-expand_more"></i></div>';

            $backdrop.on("click", function() {
                $offCanvas.removeClass("is-active");
                $(this).fadeOut(200, function() {
                    $(this).detach();
                });
            });

            $offCanvasToggle.on("click", function(e) {
                e.preventDefault();
                var targetID = $(this).attr("href");
                var $target = $(targetID);
                $target.toggleClass("is-active");
                $backdrop.hide().appendTo(document.body).fadeIn(200);
            });

            $offCanvasClose.on("click", function(e) {
                e.preventDefault();
                var targetID = $(this).attr("href");
                var $target = $(targetID);
                $target.removeClass("is-active");
                $backdrop.fadeOut(200, function() {
                    $(this).detach();
                });
            });

            $offCanvasMenuHasChildren.append(function() {
                return $(menuExpander).on("click", function(e) {
                    e.preventDefault();
                    var $subMenu = $(this).parent().siblings(".sub-menu");

                    $subMenu.slideToggle(200);
                });
            });
        },

        /* ============================================================================
         * Prority+ menu init
         * ==========================================================================*/
        priorityNavInit: function() {
            var $menus = $(".js-priority-nav");
            $menus.each(function() {
                MINIMALDOG.priorityNav($(this));
            });
        },

        /* ============================================================================
         * Smart sticky header
         * ==========================================================================*/
        smartAffix: {
            //settings
            $headerPlaceHolder: null, //the affix menu (this element will get the mdAffixed)
            $fixedHeader: null, //the menu wrapper / placeholder
            isDestroyed: false,
            isDisabled: false,
            isFixed: false, //the current state of the menu, true if the menu is affix
            isShown: false,
            windowScrollTop: 0,
            lastWindowScrollTop: 0, //last scrollTop position, used to calculate the scroll direction
            offCheckpoint: 0, // distance from top where fixed header will be hidden
            onCheckpoint: 0, // distance from top where fixed header can show up
            breakpoint: 767, // media breakpoint in px that it will be disabled

            init: function init(options) {
                //read the settings
                this.$fixedHeader = $(options.fixedHeader);
                this.$headerPlaceHolder = $(options.headerPlaceHolder);

                // Check if selectors exist.
                if (!this.$fixedHeader.length ||
                    !this.$headerPlaceHolder.length
                ) {
                    this.isDestroyed = true;
                } else if (!this.$fixedHeader.length ||
                    !this.$headerPlaceHolder.length ||
                    MINIMALDOG.documentOnResize.windowWidth <=
                    MINIMALDOG.header.smartAffix.breakpoint
                ) {
                    // Check if device width is smaller than breakpoint.
                    this.isDisabled = true;
                }
            }, // end init

            compute: function compute() {
                if (
                    MINIMALDOG.header.smartAffix.isDestroyed ||
                    MINIMALDOG.header.smartAffix.isDisabled
                ) {
                    return;
                }

                // Set where from top fixed header starts showing up
                if (!this.$headerPlaceHolder.length) {
                    this.offCheckpoint = 400;
                } else {
                    this.offCheckpoint =
                        $(this.$headerPlaceHolder).offset().top + 400;
                }

                this.onCheckpoint = this.offCheckpoint + 500;

                // Set menu top offset
                this.windowScrollTop =
                    MINIMALDOG.documentOnScroll.windowScrollTop;
                if (this.offCheckpoint < this.windowScrollTop) {
                    this.isFixed = true;
                }
            },

            updateState: function updateState() {
                //update affixed state
                if (this.isFixed) {
                    this.$fixedHeader.addClass("is-fixed");
                } else {
                    this.$fixedHeader.removeClass("is-fixed");
                    $window.trigger("stickyHeaderHidden");
                }

                if (this.isShown) {
                    this.$fixedHeader.addClass("is-shown");
                } else {
                    this.$fixedHeader.removeClass("is-shown");
                }
            },

            /**
             * called by events on scroll
             */
            eventScroll: function eventScroll(scrollTop) {
                var scrollDirection = "";
                var scrollDelta = 0;

                // check the direction
                if (scrollTop != this.lastWindowScrollTop) {
                    //compute direction only if we have different last scroll top

                    // compute the direction of the scroll
                    if (scrollTop > this.lastWindowScrollTop) {
                        scrollDirection = "down";
                    } else {
                        scrollDirection = "up";
                    }

                    //calculate the scroll delta
                    scrollDelta = Math.abs(
                        scrollTop - this.lastWindowScrollTop
                    );
                    this.lastWindowScrollTop = scrollTop;

                    // update affix state
                    if (this.offCheckpoint < scrollTop) {
                        this.isFixed = true;
                    } else {
                        this.isFixed = false;
                    }

                    // check affix state
                    if (this.isFixed) {
                        // We're in affixed state, let's do some check
                        if (scrollDirection === "down" && scrollDelta > 14) {
                            if (this.isShown) {
                                this.isShown = false; // hide menu
                            }
                        } else {
                            if (!this.isShown &&
                                scrollDelta > 14 &&
                                this.onCheckpoint < scrollTop
                            ) {
                                this.isShown = true; // show menu
                            }
                        }
                    } else {
                        this.isShown = false;
                    }

                    this.updateState(); // update state
                }
            }, // end eventScroll function

            /**
             * called by events on resize
             */
            eventResize: function eventResize(windowWidth) {
                // Check if device width is smaller than breakpoint.
                if (
                    MINIMALDOG.documentOnResize.windowWidth <
                    MINIMALDOG.header.smartAffix.breakpoint
                ) {
                    this.isDisabled = true;
                } else {
                    this.isDisabled = false;
                    MINIMALDOG.header.smartAffix.compute();
                }
            },
        },
    };

    MINIMALDOG.documentOnScroll = {
        ticking: false,
        windowScrollTop: 0, //used to store the scrollTop

        init: function() {
            window.addEventListener("scroll", function(e) {
                if (!MINIMALDOG.documentOnScroll.ticking) {
                    window.requestAnimationFrame(function() {
                        MINIMALDOG.documentOnScroll.windowScrollTop = $window.scrollTop();

                        // Functions to call here
                        if (!MINIMALDOG.header.smartAffix.isDisabled &&
                            !MINIMALDOG.header.smartAffix.isDestroyed
                        ) {
                            MINIMALDOG.header.smartAffix.eventScroll(
                                MINIMALDOG.documentOnScroll.windowScrollTop
                            );
                        }

                        MINIMALDOG.documentOnScroll.goToTopScroll(
                            MINIMALDOG.documentOnScroll.windowScrollTop
                        );

                        MINIMALDOG.documentOnScroll.ticking = false;
                    });
                }
                MINIMALDOG.documentOnScroll.ticking = true;
            });
        },

        /* ============================================================================
         * Go to top scroll event
         * ==========================================================================*/
        goToTopScroll: function(windowScrollTop) {
            if ($goToTopEl.length) {
                if (windowScrollTop > 800) {
                    if (!$goToTopEl.hasClass("is-active"))
                        $goToTopEl.addClass("is-active");
                } else {
                    $goToTopEl.removeClass("is-active");
                }
            }
        },
    };

    MINIMALDOG.documentOnResize = {
        ticking: false,
        windowWidth: $window.width(),

        init: function() {
            window.addEventListener("resize", function(e) {
                if (!MINIMALDOG.documentOnResize.ticking) {
                    window.requestAnimationFrame(function() {
                        MINIMALDOG.documentOnResize.windowWidth = $window.width();

                        // Functions to call here
                        if (!MINIMALDOG.header.smartAffix.isDestroyed) {
                            MINIMALDOG.header.smartAffix.eventResize(
                                MINIMALDOG.documentOnResize.windowWidth
                            );
                        }

                        MINIMALDOG.clippedBackground();

                        MINIMALDOG.documentOnResize.ticking = false;
                    });
                }
                MINIMALDOG.documentOnResize.ticking = true;
            });
        },
    };

    MINIMALDOG.documentOnReady = {
        init: function() {
            MINIMALDOG.header.init();
            MINIMALDOG.header.smartAffix.compute();
            MINIMALDOG.documentOnScroll.init();
            MINIMALDOG.documentOnReady.ajaxLoadPost();
            MINIMALDOG.documentOnReady.atbsFollow();
            MINIMALDOG.documentOnReady.themeSwitch();
            MINIMALDOG.documentOnReady.mouseMove();
            MINIMALDOG.documentOnReady.searchFull();
            MINIMALDOG.documentOnReady.carousel_1i();
            MINIMALDOG.documentOnReady.carousel_3i_auto_width_center();
            MINIMALDOG.documentOnReady.carousel_1i_no_nav();
            MINIMALDOG.documentOnReady.carousel_1i_custom_nav();
            MINIMALDOG.documentOnReady.carousel_1i_long_nav();
            MINIMALDOG.documentOnReady.carousel_2i_auto_width();
            MINIMALDOG.documentOnReady.carousel_1i_dot_number_effect();
            MINIMALDOG.documentOnReady.carousel_1i_thumb_effect();
            MINIMALDOG.documentOnReady.carousel_auto_width_center();
            MINIMALDOG.documentOnReady.carousel_1iimg();
            MINIMALDOG.documentOnReady.carousel_1inotnav();
            MINIMALDOG.documentOnReady.carousel_1i0m();
            MINIMALDOG.documentOnReady.carousel_1i30m();
            MINIMALDOG.documentOnReady.carousel_2i4m();
            MINIMALDOG.documentOnReady.carousel_3i();
            MINIMALDOG.documentOnReady.carousel_3i_effect_mix_blend();
            MINIMALDOG.documentOnReady.carousel_img_fade();
            MINIMALDOG.documentOnReady.carousel_3i4m();
            MINIMALDOG.documentOnReady.carousel_3i4m_small();
            MINIMALDOG.documentOnReady.carousel_3i15m();
            MINIMALDOG.documentOnReady.carousel_3i55m();
            MINIMALDOG.documentOnReady.carousel_3i20m();
            MINIMALDOG.documentOnReady.carousel_3i30m();
            MINIMALDOG.documentOnReady.carousel_3i40m();
            MINIMALDOG.documentOnReady.carousel_headingAside_3i();
            MINIMALDOG.documentOnReady.carousel_4i();
            MINIMALDOG.documentOnReady.carousel_4i20m();
            MINIMALDOG.documentOnReady.carousel_4i10m();
            MINIMALDOG.documentOnReady.carousel_5i_center();
            MINIMALDOG.documentOnReady.carousel_overlap();
            MINIMALDOG.documentOnReady.customCarouselNav();
            MINIMALDOG.documentOnReady.countdown();
            MINIMALDOG.documentOnReady.goToTop();
            MINIMALDOG.documentOnReady.newsTicker();
            MINIMALDOG.documentOnReady.lightBox();
            MINIMALDOG.documentOnReady.perfectScrollbarInit();
        
        },

        /* ============================================================================
         * AJAX load more posts
         * ==========================================================================*/
        ajaxLoadPost: function() {
            var $loadedPosts = null;
            var $ajaxLoadPost = $(".js-ajax-load-post");

            function ajaxLoad(parameters, $postContainer) {
                var ajaxStatus = "",
                    ajaxCall = $.ajax({
                        url: "inc/ajax-load-post.html",
                        type: "post",
                        dataType: "html",
                        data: {
                            // action: 'ajax_load_post',
                            offset: parameters.offset,
                            postsToLoad: parameters.postsToLoad,
                            // other parameters
                        },
                    });

                ajaxCall.done(function(respond) {
                    $loadedPosts = $(respond);
                    ajaxStatus = "success";
                    if ($loadedPosts) {
                        $loadedPosts
                            .appendTo($postContainer)
                            .css("opacity", 0)
                            .animate({ opacity: 1 }, 500);
                    }
                    $("html, body")
                        .animate({ scrollTop: $window.scrollTop() + 1 }, 0)
                        .animate({ scrollTop: $window.scrollTop() - 1 }, 0); // for recalculating of sticky sidebar
                    // do stuff like changing parameters
                });

                ajaxCall.fail(function() {
                    ajaxStatus = "failed";
                });

                ajaxCall.always(function() {
                    // do other stuff
                });
            }

            $ajaxLoadPost.each(function() {
                var $this = $(this);
                var $postContainer = $this.find(".posts-list");
                var $triggerBtn = $this.find(".js-ajax-load-post-trigger");
                var parameters = {
                    offset: $this.data("offset"),
                    postsToLoad: $this.data("posts-to-load"),
                    layout: $this.data("layout"),
                };

                $triggerBtn.on("click", function() {
                    ajaxLoad(parameters, $postContainer);
                });
            });
        },

        /* ============================================================================
         * ATBS Browse
         * ==========================================================================*/
        atbsFollow: function() {
            var followBtn = $(".follow__btn");
            followBtn.each(function() {
                $(this).click(function() {
                    var dropdown = $(this).parents(".navigation-bar__btn").find(".social-list");
                    $(dropdown).toggleClass("is-show");
                });
            });
        },
        /* ============================================================================
         * ATBS Search-full
         * ==========================================================================*/
        searchFull:function(){
            var btn_search_full = $(".site-wrapper").find(".js-search--full"),
            close = $(".site-wrapper").find(".js-atbs-search--remove");

            close.each(function(){
                $(this).click(function() {
                    var search_full = $(this).parents(".site-wrapper").find(".js-atbs-search-full");
                    search_full.removeClass("is-active");
                })
            })
            btn_search_full.each(function(){
                $(this).click(function() {
                    var search_full = $(this).parents(".site-wrapper").find(".js-atbs-search-full");
                    search_full.addClass("is-active");
                })
            })
        },
     
        /* ============================================================================
         * Dark Mode & Light Mode
         * ==========================================================================*/
        themeSwitch: function() {
            const siteWrapper = $('.site-wrapper'),
                theme_switch = $('.atbs-theme-switch__button');

            function toggleDarkMode(status) {
                if (status == 'on') {
                    $(theme_switch).attr('aria-checked', 'true');
                    siteWrapper.addClass('atbs-dark-mode');
                    var moon = $('<svg xmlns="http://www.w3.org/2000/svg" width="15" height="14.947" viewBox="0 0 15 14.947"><g id="moon" transform="translate(0 -0.547)"><g id="Group_17398" data-name="Group 17398" transform="translate(0 0.546)"><path id="Path_1462" data-name="Path 1462" d="M14.645,9.053a.527.527,0,0,0-.441.1,5.624,5.624,0,0,1-1.706,1,5.343,5.343,0,0,1-1.936.345A5.629,5.629,0,0,1,4.927,4.855,5.908,5.908,0,0,1,5.233,3a5.147,5.147,0,0,1,.92-1.649.489.489,0,0,0-.077-.69.527.527,0,0,0-.441-.1A7.736,7.736,0,0,0,1.572,3.283a7.588,7.588,0,1,0,13.4,6.383A.455.455,0,0,0,14.645,9.053Z" transform="translate(0 -0.546)" fill="#171717"/></g></g></svg>')
                    $(theme_switch).children("span").html(moon);
                } else {
                    var sun = $('<svg id="sunny-day" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><path id="Path_1453" data-name="Path 1453" d="M102.893,183.46a.512.512,0,0,0-.512.512v1.455a.512.512,0,0,0,1.024,0v-1.455A.512.512,0,0,0,102.893,183.46Z" transform="translate(-95.394 -170.939)"/><path id="Path_1454" data-name="Path 1454" d="M102.893,2.482a.512.512,0,0,0,.512-.512V.515a.512.512,0,1,0-1.024,0V1.97A.512.512,0,0,0,102.893,2.482Z" transform="translate(-95.394 -0.003)"/><path id="Path_1455" data-name="Path 1455" d="M31.166,159.864l-1.029,1.029a.512.512,0,0,0,.724.724l1.029-1.029a.512.512,0,1,0-.724-.724Z" transform="translate(-27.94 -148.814)" /><path id="Path_1456" data-name="Path 1456" d="M160.22,32.043a.51.51,0,0,0,.362-.15l1.029-1.029a.512.512,0,1,0-.724-.724l-1.029,1.029a.512.512,0,0,0,.362.874Z" transform="translate(-148.809 -27.943)" /><path id="Path_1457" data-name="Path 1457" d="M2.479,102.907a.512.512,0,0,0-.512-.512H.512a.512.512,0,0,0,0,1.024H1.967A.512.512,0,0,0,2.479,102.907Z" transform="translate(0 -95.407)" /><path id="Path_1458" data-name="Path 1458" d="M185.42,102.395h-1.456a.512.512,0,1,0,0,1.024h1.456a.512.512,0,1,0,0-1.024Z" transform="translate(-170.932 -95.407)" /><path id="Path_1459" data-name="Path 1459" d="M31.173,31.894a.512.512,0,1,0,.724-.724l-1.029-1.029a.512.512,0,1,0-.724.724Z" transform="translate(-27.947 -27.945)" /><path id="Path_1460" data-name="Path 1460" d="M160.589,159.864a.512.512,0,0,0-.724.724l1.029,1.029a.512.512,0,0,0,.724-.724Z" transform="translate(-148.815 -148.814)" /><path id="Path_1461" data-name="Path 1461" d="M55.5,51.518A3.984,3.984,0,1,0,59.484,55.5,3.989,3.989,0,0,0,55.5,51.518Zm0,6.944a2.96,2.96,0,1,1,2.96-2.96A2.964,2.964,0,0,1,55.5,58.462Z" transform="translate(-48 -48.002)"/></svg>')
                    $(theme_switch).attr('aria-checked', 'false');
                    siteWrapper.removeClass('atbs-dark-mode');
                    $(theme_switch).children("span").html(sun)
                }
            }

            function updateDarkMode() {
                var darkMode = siteWrapper.hasClass('atbs-dark-mode');
                if (darkMode) {
                    toggleDarkMode('off');
                } else {
                    toggleDarkMode('on');
                }
            }

            function init() {
                var darkMode = siteWrapper.hasClass('atbs-dark-mode');
                // Turn on Dark Mode by default if is set in Theme Option
                if (darkMode) {
                    toggleDarkMode('on');
                }
                theme_switch.each(function() {
                    $(this).on('click', updateDarkMode);
                });
            }
            init(); // initialize
        },
        /* ============================================================================
         * Carousel funtions
         * ==========================================================================*/
        carousel_auto_width_center: function() {
            var $carousels = $('.js-atbs-carousel-auto-width-center');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    items: 3,
                    margin: carousel_margin,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    autoWidth: true,
                    center: true,
                    navText: [
                        '<i class="mdicon mdicon-chevron-thin-left"></i>',
                        '<i class="mdicon mdicon-chevron-thin-right"></i>',
                    ],
                    smartSpeed: 600,          
                    onInitialized: owl_onInitialized,
                    responsive: {
                        0: {
                            items: 1,
                            margin: 80,
                        },
                        768: {
                            margin: 160,
                        },
                        991: {
                            margin: carousel_margin,
                        }
                    },
                });
                function owl_onInitialized(event) {
                    var element                     = event.target;
                    var current                     = event.item.index;
                    var owl_items                   = $(element).find(".owl-item");
                    var current_center              = $(element).find(".owl-item").eq(current);
                    var current_center_index        = $(element).find(".owl-item").eq(current).index();
                    var current_center_active       = owl_items[current_center_index];
                    /*Action*/
                    $(current_center).addClass("Animation-Preventive");
                    setTimeout(function () {
                        $(current_center_active).addClass("active_current");
                    },100);

                };
                $(this).on('translate.owl.carousel', function(event) {
                    var element                = event.target;
                    var current                = event.item.index;
                    var current_center         = $(element).find(".owl-item").eq(current);
                    var owl_items              = $(element).find(".owl-item");
                    var owl_item_remove_class  = $(element).find(".owl-item.active_current");
                    var current_center_index   = $(element).find(".owl-item").eq(current).index();
                    var current_center_active  = owl_items[current_center_index];
                    /*Action*/
                    $(current_center_active).addClass("active_current");
                    setTimeout(function() {
                        $(owl_item_remove_class).removeClass("active_current Animation-Preventive");
                        $(current_center).addClass("Animation-Preventive");

                    }, 100);
                });
                $(this).on("translate.owl.carousel", function(event) {
                    var element = event.target;
                    console.log(element);
                    var nav_btn_prev =$(element).find(".owl-prev");
                    var nav_btn_next = $(element).find(".owl-next");
                    $(nav_btn_prev).addClass("disable-btn");
                    $(nav_btn_next).addClass("disable-btn");
                });
                $(this).on("translated.owl.carousel", function(event){
                    var element = event.target;
                    var nav_btn_prev =$(element).find(".owl-prev");
                    var nav_btn_next = $(element).find(".owl-next");
                    $(nav_btn_prev).removeClass("disable-btn");
                    $(nav_btn_next).removeClass("disable-btn");
                });
            })
        },
        carousel_1i: function() {
            var $carousels = $(".js-atbs-carousel-1i");
            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: true,
                    dots: true,
                    autoHeight: false,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    smartSpeed: 500,
                });
            });
        },
        carousel_3i_auto_width_center: function() {
            var $carousels = $(".js-atbs-carousel-3i-auto-width-center");
            $carousels.each(function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    margin: carousel_margin,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    autoHeight: false,
    
                    navText: [
                        '<i class="mdicon mdicon-chevron-thin-left"></i>',
                        '<i class="mdicon mdicon-chevron-thin-right"></i>',
                    ],
                    onInitialized: owl_onInitialized,
                    responsive: {
                        0: {
                            margin: 20,
                            autoWidth: false,
                            center: false,
                            items: 1,
                            smartSpeed: 500,
                            mouseDrag: true,
                            touchDrag: true,
                        },
                        576: {
                            margin: 50,
                            autoWidth: false,
                            center: false,
                            items: 1,
                            smartSpeed: 500,
                            mouseDrag: true,
                            touchDrag: true,
                        },
                        768: {
                            margin: 70,
                            center: false,
                            autoWidth: true,
                            items: 2,
                            smartSpeed: 1000,
                            mouseDrag: false,
                            touchDrag: false,
                        },
                        992: {
                            margin: 50,
                            items: 3,
                            center: true,
                            autoWidth: true,
                            smartSpeed: 1000,
                            mouseDrag: false,
                            touchDrag: false,
                        },
                        1200: {
                            margin: 70,
                            center: true,
                            autoWidth: true,
                            smartSpeed: 1000,
                            mouseDrag: false,
                            touchDrag: false,
                        },
                        1367: {
                            margin: 100,
                            center: true,
                            autoWidth: true,
                            smartSpeed: 1000,
                            mouseDrag: false,
                            touchDrag: false,
                        },
                        1441: {
                            margin: 100,
                            center: true,
                            autoWidth: true,
                            smartSpeed: 1000,
                            mouseDrag: false,
                            touchDrag: false,
                        },
                        1545: {
                            margin: 120,
                            center: true,
                            autoWidth: true,
                            smartSpeed: 1000,
                            mouseDrag: false,
                            touchDrag: false,
                        },
                        1681: {
                            margin: carousel_margin,
                            center: true,
                            autoWidth: true,
                            smartSpeed: 1000,
                            mouseDrag: false,
                            touchDrag: false,
                        },
                    }
                });

                function owl_onInitialized(event) {
                    var element = event.target;
                    var current = event.item.index;
                    var owl_items = $(element).find(".owl-item");
                    var current_center = $(element).find(".owl-item").eq(current);
                    var current_center_index = $(element).find(".owl-item").eq(current).index();
                    var current_center_active = owl_items[current_center_index];
                    /*Action*/
                    $(current_center).addClass("Animation-Preventive");
                    setTimeout(function() {
                        $(current_center_active).addClass("active_current");
                    }, 100);

                };
                $(this).on('translate.owl.carousel', function(event) {
                    var element = event.target;
                    var current = event.item.index;
                    var current_center = $(element).find(".owl-item").eq(current);
                    var owl_items = $(element).find(".owl-item");
                    var owl_item_remove_class = $(element).find(".owl-item.active_current");
                    var current_center_index = $(element).find(".owl-item").eq(current).index();
                    var current_center_active = owl_items[current_center_index];
                    /*Action*/
                    setTimeout(function() {
                        $(owl_item_remove_class).removeClass("active_current Animation-Preventive");
                        $(current_center).addClass("Animation-Preventive");
                        $(current_center_active).addClass("active_current");
                    }, 100);
                    $(element).addClass("disable-mouse");
                });
                $(this).on("translate.owl.carousel", function(event) {
                    var element = event.target;
                    var nav_btn_prev =$(element).find(".owl-prev");
                    var nav_btn_next = $(element).find(".owl-next");
                    $(nav_btn_prev).addClass("disable-btn");
                    $(nav_btn_next).addClass("disable-btn");
                });
                $(this).on("translated.owl.carousel", function(event){
                    var element = event.target;
                    var nav_btn_prev =$(element).find(".owl-prev");
                    var nav_btn_next = $(element).find(".owl-next");
                    $(nav_btn_prev).removeClass("disable-btn");
                    $(nav_btn_next).removeClass("disable-btn");
                    $(element).removeClass("disable-mouse");
                });
            });
        },
        carousel_1i_no_nav: function() {
            var $carousels = $(".js-atbs-carousel-1i_no_nav");
            $carousels.each(function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: false,
                    dots: true,
                    loop: carousel_loop,
                    autoHeight: false,
                    navText: [
                        '<i class="mdicon mdicon-chevron-thin-left"></i>',
                        '<i class="mdicon mdicon-chevron-thin-right"></i>',
                    ],
                    smartSpeed: 500,
                });
            });
        },
        carousel_1i_custom_nav: function() {
            var $carousels = $(".js-atbs-carousel-1i-custom-nav");
            $carousels.each(function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    autoHeight: false,
                    navText: [
                        '<i class="mdicon mdicon-chevron-thin-left"></i>',
                        '<i class="mdicon mdicon-chevron-thin-right"></i>',
                    ],
                    smartSpeed: 500,  
                });
            });
        },
        carousel_1i_long_nav: function() {
            var $carousels = $(".js-atbs-carousel-1i-long-nav");
            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 10,
                    nav: true,
                    dots: false,
                    loop:true,
                    autoHeight: false,
                    navText: [
                        '<svg xmlns="http://www.w3.org/2000/svg" width="45.864" height="13.6" viewBox="0 0 45.864 13.6"><path id="right-arrow" d="M39.064,167.5l-2.043,2.043,3.312,3.312H0v2.889H40.334l-3.312,3.313,2.043,2.043,6.8-6.8Z" transform="translate(45.864 181.1) rotate(180)"/></svg>',
                        '<svg xmlns="http://www.w3.org/2000/svg" width="45.864" height="13.6" viewBox="0 0 45.864 13.6"><path id="right-arrow" d="M39.064,167.5l-2.043,2.043,3.312,3.312H0v2.889H40.334l-3.312,3.313,2.043,2.043,6.8-6.8Z" transform="translate(0 -167.5)"/></svg>',
                    ],
                    smartSpeed: 500,
                    
                });
            });
        },
        carousel_2i_auto_width: function() {
            var $carousels = $(".js-atbs-carousel-2i-auto-width");
            $carousels.each(function() {
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    items: 3,
                    margin: carousel_margin,
                    nav: true,
                    dots: false,
                    loop: true,
                    autoHeight: true,
                    autoWidth: true,
                    navText: [
                        '<svg xmlns="http://www.w3.org/2000/svg" width="45.864" height="13.6" viewBox="0 0 45.864 13.6"><path id="right-arrow" d="M39.064,167.5l-2.043,2.043,3.312,3.312H0v2.889H40.334l-3.312,3.313,2.043,2.043,6.8-6.8Z" transform="translate(45.864 181.1) rotate(180)"/></svg>',
                        '<svg xmlns="http://www.w3.org/2000/svg" width="45.864" height="13.6" viewBox="0 0 45.864 13.6"><path id="right-arrow" d="M39.064,167.5l-2.043,2.043,3.312,3.312H0v2.889H40.334l-3.312,3.313,2.043,2.043,6.8-6.8Z" transform="translate(0 -167.5)"/></svg>',
                    ],
                    smartSpeed: 500,
                    responsive: {
                        0: {
                            margin: 20,
                        },
                        576: {
                            margin: carousel_margin,
                        },
                    },
                });
            });
        },
        carousel_5i_center: function() {
            var $carousels = $('.js-atbs-carousel-5i-center');
            $carousels.each(function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    // items: 5,
                    margin: carousel_margin,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    center: true,

                    navText: [
                        '<i class="mdicon mdicon-chevron-thin-left"></i>',
                        '<i class="mdicon mdicon-chevron-thin-right"></i>',
                    ],
                    smartSpeed: 600,
                    responsive: {
                        0: {
                            margin: 20,
                            items: 2,
                        },
                        576: {
                            margin: 20,
                            items: 2,
                        },
                        768: {

                        },
                        992: {
                            margin: carousel_margin,
                            items: 3,
                        },
                    },
                });

                // function owl_onInitialized(event) {
                //     var element = event.target;
                //     var current = event.item.index;
                //     var owl_items = $(element).find(".owl-item");
                //     var current_center = $(element).find(".owl-item").eq(current);
                //     var current_center_index = $(element).find(".owl-item").eq(current).index();
                //     var current_center_active = owl_items[current_center_index];
                //     /*Action*/
                //     $(current_center).addClass("Animation-Preventive");
                //     setTimeout(function() {
                //         $(current_center_active).addClass("active_current");
                //     }, 100);

                // };
                // $(this).on('translate.owl.carousel', function(event) {
                //     var element = event.target;
                //     var current = event.item.index;
                //     var current_center = $(element).find(".owl-item").eq(current);
                //     var owl_items = $(element).find(".owl-item");
                //     var owl_item_remove_class = $(element).find(".owl-item.active_current");
                //     var current_center_index = $(element).find(".owl-item").eq(current).index();
                //     var current_center_active = owl_items[current_center_index];
                //     /*Action*/
                //     setTimeout(function() {
                //         $(owl_item_remove_class).removeClass("active_current Animation-Preventive");
                //         $(current_center).addClass("Animation-Preventive");
                //         $(current_center_active).addClass("active_current");
                //     }, 100);
                // });
            })
        },
        carousel_1i0m: function() {
            var $carousels = $(".js-atbs-carousel-1i0m");
            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    smartSpeed: 500,
                });
            });
        },
        carousel_1inotnav: function() {
            var $carousels = $(".js-atbs-carousel-1inotnav");
            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: false,
                    dots: true,
                    autoHeight: true,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    smartSpeed: 500,
                });
            });
        },

        carousel_1i30m: function() {
            var $carousels = $(".js-carousel-1i30m");
            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 30,
                    loop: true,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    smartSpeed: 500,
                });
            });
        },

        carousel_overlap: function() {
            var $carousels = $(".js-atbs-carousel-overlap");
            $carousels.each(function() {
                var $carousel = $(this);
                $carousel.flickity({
                    wrapAround: true,
                });

                $carousel.on(
                    "staticClick.flickity",
                    function(event, pointer, cellElement, cellIndex) {
                        if (
                            typeof cellIndex === "number" &&
                            $carousel.data("flickity").selectedIndex !=
                            cellIndex
                        ) {
                            $carousel.flickity("selectCell", cellIndex);
                        }
                    }
                );
            });
        },

        carousel_2i4m: function() {
            var $carousels = $(".js-carousel-2i4m");
            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 2,
                    margin: 4,
                    loop: false,
                    nav: true,
                    dots: true,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },
                    },
                });
            });
        },

        carousel_3i: function() {
            var $carousels = $(".js-carousel-3i");
            $carousels.each(function() {
                $(this).owlCarousel({
                    loop: true,
                    nav: true,
                    dots: false,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 3,
                        },
                    },
                });
            });
        },

        carousel_3i4m: function() {
            var $carousels = $(".js-carousel-3i4m");
            $carousels.each(function() {
                $(this).owlCarousel({
                    margin: 4,
                    loop: false,
                    nav: true,
                    dots: true,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 3,
                        },
                    },
                });
            });
        },

        carousel_3i4m_small: function() {
            var $carousels = $(".js-carousel-3i4m-small");
            $carousels.each(function() {
                $(this).owlCarousel({
                    margin: 4,
                    loop: false,
                    nav: true,
                    dots: true,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    autoHeight: true,
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        1200: {
                            items: 3,
                        },
                    },
                });
            });
        },
        carousel_3i15m: function() {
            var $carousels = $(".js-carousel-3i15m");
            $carousels.each(function() {
                $(this).owlCarousel({
                    margin: 15,
                    loop: true,
                    nav: true,
                    dots: true,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 3,
                        },
                    },
                });
            });
        },
        carousel_3i20m: function() {
            var $carousels = $(".js-carousel-3i20m");
            $carousels.each(function() {
                $(this).owlCarousel({
                    margin: 20,
                    loop: true,
                    nav: true,
                    dots: true,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 3,
                        },
                    },
                });
            });
        },
        carousel_3i30m: function() {
            var $carousels = $(".js-carousel-3i30m");
            $carousels.each(function() {
                $(this).owlCarousel({
                    margin: 30,
                    loop: true,
                    nav: true,
                    dots: true,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 3,
                        },
                    },
                });
            });
        },
        carousel_3i40m: function() {
            var $carousels = $(".js-carousel-3i40m");
            $carousels.each(function() {
                $(this).owlCarousel({
                    margin: 40,
                    loop: true,
                    nav: true,
                    dots: true,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 3,
                            margin: 20,
                        },
                        1200: {
                            margin: 40,
                        },
                    },
                });
            });
        },
        carousel_3i55m: function() {
            var $carousels = $(".js-carousel-3i55m");
            $carousels.each(function() {
                $(this).owlCarousel({
                    margin: 55,
                    loop: true,
                    nav: true,
                    dots: false,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 3,
                        },
                    },
                });
            });
        },

        carousel_headingAside_3i: function() {
            var $carousels = $(".js-atbs-carousel-heading-aside-3i");
            $carousels.each(function() {
                $(this).owlCarousel({
                    margin: 20,
                    nav: false,
                    dots: false,
                    loop: true,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    responsive: {
                        0: {
                            items: 1,
                            margin: 10,
                            stagePadding: 40,
                            loop: false,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 3,
                        },
                    },
                });
            });
        },

        customCarouselNav: function() {
            if ($.isFunction($.fn.owlCarousel)) {
                var $carouselNexts = $(".js-carousel-next");
                $carouselNexts.each(function() {
                    var carouselNext = $(this);
                    var carouselID = carouselNext
                        .parent(".atbs-carousel-nav-custom-holder")
                        .attr("data-carouselID");
                    var $carousel = $("#" + carouselID);

                    carouselNext.on("click", function() {
                        $carousel.trigger("next.owl.carousel");
                    });
                });

                var $carouselPrevs = $(".js-carousel-prev");
                $carouselPrevs.each(function() {
                    var carouselPrev = $(this);
                    var carouselID = carouselPrev
                        .parent(".atbs-carousel-nav-custom-holder")
                        .attr("data-carouselID");
                    var $carousel = $("#" + carouselID);

                    carouselPrev.on("click", function() {
                        $carousel.trigger("prev.owl.carousel");
                    });
                });
            }
        },
        carousel_1i_dot_number_effect: function() {
            var $carousels = $('.js-atbs-carousel-1i-dot-number-effect');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    items: 1,
                    margin: carousel_margin,
                    nav: false,
                    dots: false,
                    loop: carousel_loop,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 600,
                    onInitialized  : counter,
                    onTranslate : counter,
                });
                function counter(event) {
                    var element          = event.target;
                    var itemCount     = event.item.count;
                    var itenIndex     = event.item.index;
                    var owlstageChildrens = $(element).find('.owl-stage').children().length;
                    var theCloned     = owlstageChildrens - itemCount;
                    var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                    if(itenIndex < parseInt(theCloned / 2)) {
                        currentIndex = owlstageChildrens - theCloned;
                    }else if(currentIndex > itemCount) {
                        currentIndex = currentIndex - itemCount;
                    }
                    $(element).parent().find('.owl-number').html( currentIndex +' <span class="slide-seperated">/</span> ' + itemCount);
                }
            })
        },
        carousel_1i_thumb_effect: function() {
            var $carousels = $('.js-atbs-carousel-1i-thumb-effect');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    items: 1,
                    margin: carousel_margin,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    animateOut: 'fadeOut',
                    animateIn: 'fadeIn',
                    navText: [
                        '<i class="mdicon mdicon-chevron-thin-left"></i>',
                        '<i class="mdicon mdicon-chevron-thin-right"></i>',
                    ],
                });
                $(this).on("translate.owl.carousel", function(event) {
                    var element = event.target;
                    console.log(element);
                    var nav_btn_prev =$(element).find(".owl-prev");
                    var nav_btn_next = $(element).find(".owl-next");
                    $(nav_btn_prev).addClass("disable-btn");
                    $(nav_btn_next).addClass("disable-btn");
                });
                $(this).on("translated.owl.carousel", function(event){
                    var element = event.target;
                    var nav_btn_prev =$(element).find(".owl-prev");
                    var nav_btn_next = $(element).find(".owl-next");
                    $(nav_btn_prev).removeClass("disable-btn");
                    $(nav_btn_next).removeClass("disable-btn");
                });
            });
        },
        carousel_1iimg: function() {
            var $carousels = $(".js-atbs-carousel-1iimg");
            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 30,
                    nav: false,
                    loop: true,
                    dots: true,
                    lazyLoad: true,
                    autoHeight: true,
                    smartSpeed: 450,
                    //animateOut: 'fadeOut',
                    onInitialized: owl_onInitialized,
                    onTranslate: counter,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    responsive: {
                        0: {
                            items: 1,
                            margin: 30,
                        },
                        768: {
                            items: 1,
                        },
                    },
                });
                $(this).on("translate.owl.carousel", function(event) {
                    var element = event.target;
                    var thebackgroundIMG = "";
                    var currentImgSrcData = "";
                    var checkActiveItemLoaded = setInterval(function() {
                        if (!$(element)
                            .find(".owl-item.active")
                            .hasClass("owl-item-active-loaded")
                        ) {
                            $(element)
                                .find(".owl-item")
                                .removeClass("owl-item-active-loaded");
                            $(element)
                                .find(".owl-item.active")
                                .addClass("owl-item-active-loaded");
                            thebackgroundIMG = $(element)
                                .parents(".atbs-block__inner")
                                .find(".owl-background .owl-background-img");
                            currentImgSrcData = $(element)
                                .find(".owl-item.active")
                                .find(".post__thumb > a > img")
                                .attr("src");
                            thebackgroundIMG.each(function() {
                                if ($(this).hasClass("active")) {
                                    $(this).removeClass("active");
                                } else {
                                    $(this)
                                        .removeAttr("src")
                                        .attr("src", currentImgSrcData);
                                    $(this).addClass("active");
                                }
                            });
                            $(element)
                                .parents(".atbs-block__inner")
                                .find(
                                    ".owl-background .owl-background-img.active"
                                )
                                .closest("a")
                                .attr(
                                    "href",
                                    $(element)
                                    .find(".owl-item.active")
                                    .find(".post__thumb > a")
                                    .attr("href")
                                );
                            $(element)
                                .parents(".atbs-block__inner")
                                .find(
                                    ".owl-background .owl-background-img.active"
                                )
                                .attr(
                                    "src",
                                    $(element)
                                    .find(".owl-item.active")
                                    .find(".post__thumb > a > img")
                                    .attr("src")
                                );
                            clearInterval(checkActiveItemLoaded);
                        }
                    }, 10); // check every 10ms
                });

                function owl_onInitialized(event) {
                    var element = event.target;
                    var itemCount = event.item.count;
                    var itenIndex = event.item.index;
                    var owlstageChildrens = $(element)
                        .find(".owl-stage")
                        .children().length;
                    var theCloned = owlstageChildrens - itemCount;
                    var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                    if (itenIndex < parseInt(theCloned / 2)) {
                        currentIndex = owlstageChildrens - theCloned;
                    } else if (currentIndex > itemCount) {
                        currentIndex = currentIndex - itemCount;
                    }
                    $(element)
                        .parent()
                        .find(".owl-number")
                        .html(
                            currentIndex +
                            ' <span class="slide-seperated">/</span> ' +
                            itemCount
                        );
                    $(element)
                        .parents(".atbs-block__inner")
                        .find(".owl-background .owl-background-img.active")
                        .closest("a")
                        .attr(
                            "href",
                            $(element)
                            .find(".owl-item.active")
                            .find(".post__thumb > a")
                            .attr("href")
                        );
                    $(element)
                        .parents(".atbs-block__inner")
                        .find(".owl-background .owl-background-img.active")
                        .attr(
                            "src",
                            $(element)
                            .find(".owl-item.active")
                            .find(".post__thumb > a > img")
                            .attr("src")
                        );
                    $(element)
                        .find(".owl-item.active")
                        .addClass("owl-item-active-loaded");
                }

                function counter(event) {
                    var element = event.target;
                    var itemCount = event.item.count;
                    var itenIndex = event.item.index;
                    var owlstageChildrens = $(element)
                        .find(".owl-stage")
                        .children().length;
                    var theCloned = owlstageChildrens - itemCount;
                    var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                    if (itenIndex < parseInt(theCloned / 2)) {
                        currentIndex = owlstageChildrens - theCloned;
                    } else if (currentIndex > itemCount) {
                        currentIndex = currentIndex - itemCount;
                    }
                    $(element)
                        .parent()
                        .find(".owl-number")
                        .html(
                            currentIndex +
                            ' <span class="slide-seperated">/</span> ' +
                            itemCount
                        );
                }
            });
        },

        carousel_4i: function() {
            var $carousels = $(".js-carousel-4i");

            $carousels.each(function() {
                $(this).owlCarousel({
                    loop: true,
                    nav: true,
                    dots: false,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 4,
                        },
                    },
                });
            });
        },

        carousel_4i20m: function() {
            var $carousels = $(".js-carousel-4i20m");

            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 4,
                    margin: 20,
                    loop: false,
                    nav: true,
                    dots: true,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 3,
                        },

                        1199: {
                            items: 4,
                        },
                    },
                });
            });
        },
        carousel_4i10m: function() {
            var $carousels = $(".js-carousel-4i10m");

            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 4,
                    margin: 10,
                    loop: false,
                    nav: true,
                    dots: true,
                    navText: [
                        '<i class="mdicon mdicon-navigate_before"></i>',
                        '<i class="mdicon mdicon-navigate_next"></i>',
                    ],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 3,
                        },

                        1199: {
                            items: 4,
                        },
                    },
                });
            });
        },
        carousel_3i_effect_mix_blend: function() {
            var $carousels = $('.js-atbs-carousel-3i-mix-blend');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    items: 10,
                    margin: carousel_margin,
                    nav: true,
                    dots: true,
                    autoWidth: true,
                    center: true,
                    loop: carousel_loop,
                    smartSpeed: 600,   
                    onInitialized: owl_onInitialized,
                    navText: [
                        '<i class="mdicon mdicon-chevron-thin-left"></i>',
                        '<i class="mdicon mdicon-chevron-thin-right"></i>',
                    ],
                    responsive: {
                        0: {
                            margin: 20,
                        },
                        576: {
                            margin:80,
                        },
                        991: {
                            margin: 100,
                        },
                        1200: {
                            margin: carousel_margin,
                        }
                    },
                });
                function owl_onInitialized(event) {
                    var element = event.target;
                    var current = event.item.index;
                    var owl_items = $(element).find(".owl-item");
                    var current_center = $(element).find(".owl-item").eq(current);
                    var current_center_index = $(element).find(".owl-item").eq(current).index();
                    var current_center_active = owl_items[current_center_index];

                    var current_not_active = event.item.index - 1;
                    var current_left_index = $(element).find(".owl-item").eq(current_not_active).index();
                    var current_left_not_active = owl_items[current_left_index];

                    var current_not_active = event.item.index + 1;
                    var current_right_index = $(element).find(".owl-item").eq(current_not_active).index();
                    var current_right_not_active = owl_items[current_right_index];
                    /*Action*/
                    $(current_center).addClass("Animation-Preventive");
                    setTimeout(function() {
                        $(current_center_active).addClass("active_current");
                        $(current_left_not_active).addClass("current_left_not_active");
                        $(current_right_not_active).addClass("current_right_not_active");
                    }, 100);

                };
                $(this).on('translate.owl.carousel', function(event) {
                    var element = event.target;
                    var current = event.item.index;
                    var current_center = $(element).find(".owl-item").eq(current);
                    var owl_items = $(element).find(".owl-item");
                    var owl_item_remove_class = $(element).find(".owl-item.active_current");
                    var current_center_index = $(element).find(".owl-item").eq(current).index();
                    var current_center_active = owl_items[current_center_index];

                    var current_not_active = event.item.index - 1;
                    var current_left_index = $(element).find(".owl-item").eq(current_not_active).index();
                    var current_left_not_active = owl_items[current_left_index];

                    var owl_item_left_remove_class = $(element).find(".owl-item.current_left_not_active");

                    var current_not_active = event.item.index + 1;
                    var current_right_index = $(element).find(".owl-item").eq(current_not_active).index();
                    var current_right_not_active = owl_items[current_right_index];

                    var nav_btn_prev =$(element).find(".owl-prev");
                    var nav_btn_next = $(element).find(".owl-next");
                    $(nav_btn_prev).addClass("disable-btn");
                    $(nav_btn_next).addClass("disable-btn");

                    /*Action*/
                    $(current_center_active).addClass("active_current");
                    setTimeout(function() {
                        $(owl_item_remove_class).removeClass("active_current Animation-Preventive");
                        $(current_center).addClass("Animation-Preventive");

                        $(owl_item_left_remove_class).removeClass("current_left_not_active");
                        $(current_left_not_active).addClass("current_left_not_active");

                        $(current_right_not_active).addClass("current_right_not_active");
                    }, 100);
                });
                $(this).on('translated.owl.carousel', function(event) {
                    var element = event.target;
                    var current = event.item.index;
                    var current_center = $(element).find(".owl-item").eq(current);
                    var owl_items = $(element).find(".owl-item");
                    
                    var current_not_active = event.item.index + 1;
                    var current_right_index = $(element).find(".owl-item").eq(current_not_active).index();
                    var current_right_not_active = owl_items[current_right_index];

                    var owl_item_right_remove_class = $(element).find(".owl-item.current_right_not_active");

                    var nav_btn_prev =$(element).find(".owl-prev");
                    var nav_btn_next = $(element).find(".owl-next");
                    $(nav_btn_prev).removeClass("disable-btn");
                    $(nav_btn_next).removeClass("disable-btn");

                    setTimeout(function() {
                        $(current_center).addClass("Animation-Preventive");
                        $(owl_item_right_remove_class).removeClass("current_right_not_active");
                        $(current_right_not_active).addClass("current_right_not_active");
                    },100);
                });         
            })
        },
        carousel_img_fade: function () {
            var $carousels = $(".js-carousel_img_fade");
            $carousels.each(function () {
              $(this).owlCarousel({
                items: 1,
                margin: 30,
                nav: false,
                loop: true,
                dots: true,
                lazyLoad: true,
                autoHeight: true,
                smartSpeed: 450,
                onInitialized: owl_onInitialized,
                onTranslate: counter,
                navText: [
                  '<i class="mdicon mdicon-navigate_before"></i>',
                  '<i class="mdicon mdicon-navigate_next"></i>',
                ],
                responsive: {
                  0: {
                    items: 1,
                    margin: 30,
                  },
                  768: {
                    items: 1,
                  },
                },
              });
              $(this).on("translate.owl.carousel", function (event) {
                var element = event.target;
                var thebackgroundIMG = "";
                var currentImgSrcData = "";
                var checkActiveItemLoaded = setInterval(function () {
                  if (
                    !$(element)
                      .find(".owl-item.active")
                      .hasClass("owl-item-active-loaded")
                  ) {
                    $(element)
                      .find(".owl-item")
                      .removeClass("owl-item-active-loaded");
                    $(element)
                      .find(".owl-item.active")
                      .addClass("owl-item-active-loaded");
                    thebackgroundIMG = $(element)
                      .parents(".atbs-block__inner")
                      .find(".owl-background .owl-background-img");
                    currentImgSrcData = $(element)
                      .find(".owl-item.active")
                      .find(".post__thumb > a > img")
                      .attr("src");
                    thebackgroundIMG.each(function () {
                      if ($(this).hasClass("active")) {
                        $(this).removeClass("active");
                      } else {
                        $(this).removeAttr("src").attr("src", currentImgSrcData);
                        $(this).addClass("active");
                      }
                    });
                    $(element)
                      .parents(".atbs-block__inner")
                      .find(".owl-background .owl-background-img.active")
                      .closest("a")
                      .attr(
                        "href",
                        $(element)
                          .find(".owl-item.active")
                          .find(".post__thumb > a")
                          .attr("href")
                      );
                    $(element)
                      .parents(".atbs-block__inner")
                      .find(".owl-background .owl-background-img.active")
                      .attr(
                        "src",
                        $(element)
                          .find(".owl-item.active")
                          .find(".post__thumb > a > img")
                          .attr("src")
                      );
                    clearInterval(checkActiveItemLoaded);
                  }
                }, 10); // check every 10ms
              });
              function owl_onInitialized(event) {
                var element = event.target;
                var itemCount = event.item.count;
                var itenIndex = event.item.index;
                var owlstageChildrens = $(element).find(".owl-stage").children()
                  .length;
                var theCloned = owlstageChildrens - itemCount;
                var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                if (itenIndex < parseInt(theCloned / 2)) {
                  currentIndex = owlstageChildrens - theCloned;
                } else if (currentIndex > itemCount) {
                  currentIndex = currentIndex - itemCount;
                }
                $(element)
                  .parent()
                  .find(".owl-number")
                  .html(
                    currentIndex +
                      ' <span class="slide-seperated">/</span> ' +
                      itemCount
                  );
                $(element)
                  .parents(".atbs-block__inner")
                  .find(".owl-background .owl-background-img.active")
                  .closest("a")
                  .attr(
                    "href",
                    $(element)
                      .find(".owl-item.active")
                      .find(".post__thumb > a")
                      .attr("href")
                  );
                $(element)
                  .parents(".atbs-block__inner")
                  .find(".owl-background .owl-background-img.active")
                  .attr(
                    "src",
                    $(element)
                      .find(".owl-item.active")
                      .find(".post__thumb > a > img")
                      .attr("src")
                  );
                $(element)
                  .find(".owl-item.active")
                  .addClass("owl-item-active-loaded");
              }
              function counter(event) {
                var element = event.target;
                var itemCount = event.item.count;
                var itenIndex = event.item.index;
                var owlstageChildrens = $(element).find(".owl-stage").children()
                  .length;
                var theCloned = owlstageChildrens - itemCount;
                var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                if (itenIndex < parseInt(theCloned / 2)) {
                  currentIndex = owlstageChildrens - theCloned;
                } else if (currentIndex > itemCount) {
                  currentIndex = currentIndex - itemCount;
                }
                $(element)
                  .parent()
                  .find(".owl-number")
                  .html(
                    currentIndex +
                      ' <span class="slide-seperated">/</span> ' +
                      itemCount
                  );
              }
            });
          },

        /* ============================================================================
         * ATBS mousemove
         * ==========================================================================*/
           mouseMove:function() {
            setTimeout(function(){
                var parent_element = $(".js-mouse-move");
                parent_element.each(function() {
                    var $this = this;
                    $(this).mousemove(function (e) { 
                        var element = $(this).find(".element-move");
                        var parent = $this.getBoundingClientRect();
                        var x = e.clientX - parent.left;
                        var y = e.clientY - parent.top;
                        $(element).css({
                            "left":x,
                            "top":y
                        });
                    });
                    $(this).on("mouseleave",function(e){
                        var remove = $(this).find(".element-move");
                        $(remove).removeAttr("style");
                    });
                })
            },50);

        },
        /* ============================================================================
         * Countdown timer
         * ==========================================================================*/
        countdown: function() {
            if ($.isFunction($.fn.countdown)) {
                var $countdown = $(".js-countdown");

                $countdown.each(function() {
                    var $this = $(this);
                    var finalDate = $this.data("countdown");

                    $this.countdown(finalDate, function(event) {
                        $(this).html(
                            event.strftime(
                                "" +
                                '<div class="countdown__section"><span class="countdown__digit">%-D</span><span class="countdown__text meta-font">day%!D</span></div>' +
                                '<div class="countdown__section"><span class="countdown__digit">%H</span><span class="countdown__text meta-font">hr</span></div>' +
                                '<div class="countdown__section"><span class="countdown__digit">%M</span><span class="countdown__text meta-font">min</span></div>' +
                                '<div class="countdown__section"><span class="countdown__digit">%S</span><span class="countdown__text meta-font">sec</span></div>'
                            )
                        );
                    });
                });
            }
        },

        /* ============================================================================
         * Scroll top
         * ==========================================================================*/
        goToTop: function() {
            if ($goToTopEl.length) {
                $goToTopEl.on("click", function() {
                    $("html,body").stop(true).animate({ scrollTop: 0 }, 400);
                    return false;
                });
            }
        },

        /* ============================================================================
         * News ticker
         * ==========================================================================*/
        newsTicker: function() {
            var $tickers = $(".js-atbs-news-ticker");
            $tickers.each(function() {
                var $ticker = $(this);
                var $next = $ticker
                    .siblings(".atbs-news-ticker__control")
                    .find(".atbs-news-ticker__next");
                var $prev = $ticker
                    .siblings(".atbs-news-ticker__control")
                    .find(".atbs-news-ticker__prev");

                $ticker.addClass("initialized").vTicker("init", {
                    speed: 300,
                    pause: 3000,
                    showItems: 1,
                });

                $next.on("click", function() {
                    $ticker.vTicker("next", { animate: true });
                });

                $prev.on("click", function() {
                    $ticker.vTicker("prev", { animate: true });
                });
            });
        },

        /* ============================================================================
         * Lightbox
         * ==========================================================================*/
        lightBox: function() {
            if ($.isFunction($.fn.magnificPopup)) {
                var $imageLightbox = $(".js-atbs-lightbox-image");
                var $galleryLightbox = $(".js-atbs-lightbox-gallery");

                $imageLightbox.magnificPopup({
                    type: "image",
                    mainClass: "mfp-zoom-in",
                    removalDelay: 80,
                });

                $galleryLightbox.each(function() {
                    $(this).magnificPopup({
                        delegate: ".gallery-icon > a",
                        type: "image",
                        gallery: {
                            enabled: true,
                        },
                        mainClass: "mfp-zoom-in",
                        removalDelay: 80,
                    });
                });
            }
        },

        /* ============================================================================
         * Custom scrollbar
         * ==========================================================================*/
        perfectScrollbarInit: function() {
            if ($.isFunction($.fn.perfectScrollbar)) {
                var $area = $(".js-perfect-scrollbar");

                $area.perfectScrollbar({
                    wheelPropagation: true,
                });
            }
        },

        /* ============================================================================
         * Sticky sidebar
         * ==========================================================================*/
        stickySidebar: function() {
            setTimeout(function() {
                var $stickySidebar = $(".js-sticky-sidebar");
                var $stickyHeader = $(".js-sticky-header");

                var marginTop = $stickyHeader.length ?
                    $stickyHeader.outerHeight() + 20 :
                    0; // check if there's sticky header
                if ($.isFunction($.fn.theiaStickySidebar)) {
                    $stickySidebar.theiaStickySidebar({
                        additionalMarginTop: marginTop,
                        additionalMarginBottom: 20,
                    });
                }
            }, 250); // wait a bit for precise height;
        },

    };

    MINIMALDOG.documentOnLoad = {
        init: function() {
            MINIMALDOG.clippedBackground();
            MINIMALDOG.header.smartAffix.compute(); //recompute when all the page + logos are loaded
            MINIMALDOG.header.smartAffix.updateState(); // update state
            MINIMALDOG.documentOnReady.stickySidebar();
        },
    };

    /* ============================================================================
     * Blur background mask
     * ==========================================================================*/
    MINIMALDOG.clippedBackground = function() {
        if ($overlayBg.length) {
            $overlayBg.each(function() {
                var $mainArea = $(this).find(".js-overlay-bg-main-area");
                if (!$mainArea.length) {
                    $mainArea = $(this);
                }

                var $subArea = $(this).find(".js-overlay-bg-sub-area");
                var $subBg = $(this).find(".js-overlay-bg-sub");

                var leftOffset =
                    $mainArea.offset().left - $subArea.offset().left;
                var topOffset = $mainArea.offset().top - $subArea.offset().top;

                $subBg.css("display", "block");
                $subBg.css("position", "absolute");
                $subBg.css("width", $mainArea.outerWidth() + "px");
                $subBg.css("height", $mainArea.outerHeight() + "px");
                $subBg.css("left", leftOffset + "px");
                $subBg.css("top", topOffset + "px");
            });
        }
    };

    /* ============================================================================
     * Priority+ menu
     * ==========================================================================*/
    MINIMALDOG.priorityNav = function($menu) {
        var $btn = $menu.find("button");
        var $menuWrap = $menu.find(".navigation");
        var $menuItem = $menuWrap.children("li");
        var hasMore = false;

        if (!$menuWrap.length) {
            return;
        }

        function calcWidth() {
            if ($menuWrap[0].getBoundingClientRect().width === 0) return;

            var navWidth = 0;

            $menuItem = $menuWrap.children("li");
            $menuItem.each(function() {
                navWidth += $(this)[0].getBoundingClientRect().width;
            });

            if (hasMore) {
                var $more = $menu.find(".priority-nav__more");
                var moreWidth = $more[0].getBoundingClientRect().width;
                var availableSpace = $menu[0].getBoundingClientRect().width;

                //Remove the padding width (assumming padding are px values)
                availableSpace -=
                    parseInt($menu.css("padding-left"), 10) +
                    parseInt($menu.css("padding-right"), 10);
                //Remove the border width
                availableSpace -= $menu.outerWidth(false) - $menu.innerWidth();

                if (navWidth > availableSpace) {
                    var $menuItems = $menuWrap.children(
                        "li:not(.priority-nav__more)"
                    );
                    var itemsToHideCount = 1;

                    $($menuItems.get().reverse()).each(function(index) {
                        navWidth -= $(this)[0].getBoundingClientRect().width;
                        if (navWidth > availableSpace) {
                            itemsToHideCount++;
                        } else {
                            return false;
                        }
                    });

                    var $itemsToHide = $menuWrap
                        .children("li:not(.priority-nav__more)")
                        .slice(-itemsToHideCount);

                    $itemsToHide.each(function(index) {
                        $(this).attr(
                            "data-width",
                            $(this)[0].getBoundingClientRect().width
                        );
                    });

                    $itemsToHide.prependTo($more.children("ul"));
                } else {
                    var $moreItems = $more.children("ul").children("li");
                    var itemsToShowCount = 0;

                    if ($moreItems.length === 1) {
                        // if there's only 1 item in "More" dropdown
                        if (
                            availableSpace >=
                            navWidth -
                            moreWidth +
                            $moreItems.first().data("width")
                        ) {
                            itemsToShowCount = 1;
                        }
                    } else {
                        $moreItems.each(function(index) {
                            navWidth += $(this).data("width");
                            if (navWidth <= availableSpace) {
                                itemsToShowCount++;
                            } else {
                                return false;
                            }
                        });
                    }

                    if (itemsToShowCount > 0) {
                        var $itemsToShow = $moreItems.slice(
                            0,
                            itemsToShowCount
                        );

                        $itemsToShow.insertBefore(
                            $menuWrap.children(".priority-nav__more")
                        );
                        $moreItems = $more.children("ul").children("li");

                        if ($moreItems.length <= 0) {
                            $more.remove();
                            hasMore = false;
                        }
                    }
                }
            } else {
                var $more = $(
                    '<li class="priority-nav__more"><a href="#"><span>More</span><i class="mdicon mdicon-more_vert"></i></a><ul class="sub-menu"></ul></li>'
                );
                var availableSpace = $menu[0].getBoundingClientRect().width;

                //Remove the padding width (assumming padding are px values)
                availableSpace -=
                    parseInt($menu.css("padding-left"), 10) +
                    parseInt($menu.css("padding-right"), 10);
                //Remove the border width
                availableSpace -= $menu.outerWidth(false) - $menu.innerWidth();

                if (navWidth > availableSpace) {
                    var $menuItems = $menuWrap.children("li");
                    var itemsToHideCount = 1;

                    $($menuItems.get().reverse()).each(function(index) {
                        navWidth -= $(this)[0].getBoundingClientRect().width;
                        if (navWidth > availableSpace) {
                            itemsToHideCount++;
                        } else {
                            return false;
                        }
                    });

                    var $itemsToHide = $menuWrap
                        .children("li:not(.priority-nav__more)")
                        .slice(-itemsToHideCount);

                    $itemsToHide.each(function(index) {
                        $(this).attr(
                            "data-width",
                            $(this)[0].getBoundingClientRect().width
                        );
                    });

                    $itemsToHide.prependTo($more.children("ul"));
                    $more.appendTo($menuWrap);
                    hasMore = true;
                }
            }
        }

        $window.on("load webfontLoaded", calcWidth);
        $window.on("resize", $.throttle(50, calcWidth));
    };

    $document.ready(MINIMALDOG.documentOnReady.init);
    $window.on("load", MINIMALDOG.documentOnLoad.init);
    $window.on("resize", MINIMALDOG.documentOnResize.init);
})(jQuery);