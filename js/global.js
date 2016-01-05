var game = (function() {

    var debug = false,
        game = document.getElementById('js-game'),
        gameTop = document.getElementById('js-game__top'),
        gameTimer = document.getElementById('js-timer'),
        gameContainer = document.getElementById('js-game__container'),
        gameScore = document.getElementById('js-score'),
        gameLeaders = document.getElementById('js-leaderboard'),
        gameLeaderFilters = document.getElementById('js-filter-device'),
        eventName = isHandheld() ? 'touchstart' : 'click',
        score = 0,
        i = 0,
        leaderboardFilter,
        gameOver,
        addScore,
        playerNameCookie,
        defaultTimer,
        startTime,
        endTime,
        interval,
        gameContainerWidth,
        gameContainerHeight,
        settings = {         /***  global game settings ***/
            timer      : 30,  // default game length in seconds
            minTimer   : 10,  // minimum game length in seconds
            maxTimer   : 180, // maximum game length in seconds
            blockSize  : 50,  // size of game blocks in pixels
            timerSpeed : (debug) ? 500 : 1000, // 1/2 second for debugging
            colors: ['#0CCE6B', '#FC5B2A', '#0A2E36']
        };

    /**
     * Global ajax request function that performs an ajax request
     * and runs a callback on completion, where required.
     * @param  string   url             URL to request
     * @param  string   returnType        Return type expects one of: json, html, null
     * @param  json     data            JSON data to be passed to AJAX, where required
     * @param  string   htmlElement     HTML element to append result to, if return type is html
     * @param  function callback        Function(s) to run on successful completion of AJAX request
                                        Multiple functions can be passed in array format
     * @return {}                       null
     */
     function callAjax(url, returnType, data, htmlElement, callback) {
        var htmlEl;

        // ensure that jQuery is linked to because we are using jQuery $.ajax() methods
        if(!window.$) {
          throw new Error('jQuery not found! Please add.');
        }

        if(typeof url === 'undefined' || url === '') {
            throw new Error('No URL passed to callAjax() function.');
        }

        // set HTML as default returnType if none is specified
        returnType = returnType.toLowerCase() || 'html';

        if(returnType === 'html') {
          htmlEl = document.querySelector(htmlElement);

          if (htmlEl === null) {
            throw new Error('callAjax() returnType specified as HTML but no DOM element provided for return data');
          }
          else {
            var ajaxLoading = generateEl('img', {
              className: 'ajax-loading',
              src: '/img/ajax-loading.gif'
            });

            htmlEl.innerHTML = '';
            htmlEl.appendChild(ajaxLoading);
          }
        }

        $.ajax({
          cache: false,
          method: (returnType === 'html') ? 'GET' : 'POST',
          url: url,
          data : data,
          success: function(data) {

            if(returnType === "html") {
              htmlEl.innerHTML = data;
            }

            //json data is returned from function
            //so it can be used afterwards
            if(returnType === "json") {
               data = JSON.parse(data);
               return data;
            }
          },
          complete: function(data) {
            if(typeof callback === 'function') {
              callback(data.responseText);
            } else if(Object.prototype.toString.call(callback) === '[object Array]') {
              callback.forEach(function(func) {
                func(data.responseText);
              });
            }
          }
        });

    }

    function isHandheld() {
      return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }

    /**
    * This function generates a new DOM element
    * @param  string element type
    * @param  object object literal containing the new elements attributes
    * @return new DOM element
    */
    function generateEl(el, obj) {

      if(el === '') {
          throw new Error('No element passed to generateEl() function.');
      }

      var element = document.createElement(el),
          isStyleAttr = false,
          styleAttr;

      for(var attr in obj) {
        isStyleAttr = (attr[0] === '_') ? true : false;

        if(isStyleAttr) {
          styleAttr = attr.substring(1);
          element.style[styleAttr] = obj[attr];
        } else {
          element[attr] = obj[attr];
        }
      }

      return element;
    }

    /**
     * Sets the global settings.timer variable which is the game's timer in seconds
     * @param number timer game timer in seconds
     */
    function setTimer(timer) {

        if(typeof timer !== "number") {
            throw new Error("game.init() expects Number as first parameter. Non-numeric value given.");
        }

        if(timer > settings.maxTimer) {
            throw new Error("maxTimer value exceeded. game.init() expects a timer value up to " + settings.maxTimer + " seconds");
        }

        if(timer >= settings.minTimer) {
            settings.timer = timer;
            defaultTimer = timer;
        }

        return timer;
    }

    /**
     * Creates the game's timer element and appends the timer in seconds to it
     * @return timer element
     */
    function generateTimer() {
      var timer = document.getElementById('js-timer');
      timer.innerHTML = settings.timer;

      return timer;
    }

    /**
     * Creates the game's countdown and appends it to the the main game canvas
     * @return countdown element
     */
    function createCountdown() {
      var countdown = generateEl('div', {
        id: 'js-countdown',
        className : 'fade'
      });

      game.appendChild(countdown);
      return countdown;
    }

    function getReadyAndGo(callback) {

      var visibleHeight = document.querySelector('body').getBoundingClientRect().bottom,
          containerPos = gameContainer.getBoundingClientRect(),
          containerHeight = visibleHeight - containerPos.top,
          counter = 3,
          gameContainerDimensions,
          el, countdown;

      score = 0;
      gameContainer.innerHTML = '';
      gameContainer.style.height = (containerHeight - 10) + 'px';
      el = createCountdown();

      gameContainerDimensions = getElementDimensions(gameContainer);
      gameContainerWidth = gameContainerDimensions.elwidth;
      gameContainerHeight = gameContainerDimensions.elheight;

      var handleCounter = function() {
      	if(counter === 0) {
              clearInterval(countdown);
              removeCountdown();
              callback();
          }
      	el.innerHTML = (counter === 0) ? "GO!" : counter--;
      };
      countdown = setInterval(handleCounter.bind(counter, callback), settings.timerSpeed);
    }

    function removeCountdown() {
        var countdown = document.getElementById('js-countdown');
        countdown.className += ' fade-out';

        setTimeout(function() {
          countdown.parentNode.removeChild(countdown);
        }, 1000);
    }

    function randomBlockPos(min, max) {
      return Math.floor(Math.random() * ( max-min + 1 ) + min);
    }

    function getBlockColour(inc) {
      i = (inc === (settings.colors.length - 1)) ? 0 : i + 1;

      return settings.colors[inc];
    }

    function createBlock() {
        var blockSize = settings.blockSize,
            maxLeft = gameContainer.offsetWidth - blockSize,
            maxTop = gameContainer.offsetHeight - blockSize,
            block = generateEl('div', {
              'className' : 'block',
              '_width' : blockSize + 'px',
              '_height' : blockSize + 'px',
              '_position' : 'absolute',
              '_left' : randomBlockPos(0, maxLeft) + 'px',
              '_top' : randomBlockPos(0, maxTop) + 'px',
              '_backgroundColor' : getBlockColour(i)
            });

        return block;
    }

    function startGame() {
      startTime = getCurrentTime();
			endTime = startTime + (settings.timer);

      interval = setInterval(updateTimer, 100);
      updateTimer();
      build();
    }

    function getCurrentTime() {
    	return Math.floor(Date.now() / 1000);
    }

    function updateTimer() {
      var curTime = getCurrentTime(),
          diff = curTime - startTime;

      gameTimer.innerHTML = settings.timer - diff;

      if(timeIsUp(curTime)) {
        clearInterval(interval);
        endGame();
      }
    }

    function timeIsUp(timer) {
      timer = timer || getCurrentTime();
      return timer === endTime;
    }

    function build() {
        var block = createBlock();
        var hitBlock = function() {
            if(timeIsUp()) {
              endGame();
            }
            gameScore.innerHTML = ++score;
            this.parentNode.removeChild(this);
            this.removeEventListener(eventName, hitBlock);
            build();
        };

        gameContainer.appendChild(block);
        block.addEventListener(eventName, hitBlock);
    }

    /**
     *  Load jQuery in dynamically
     */
    function getjQuery(callback) {
      var head = document.getElementsByTagName('head')[0],
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js';

       script.onreadystatechange = callback;
       script.onload = callback;

       head.appendChild(script);
    }

    /**
    * This is a callback of endGame() that is called
    * when the submit score form has finished loading
    * from here, we handle the event that submits the score via AJAX
    */
    function submitScoreForm() {

      var btnSubmit = document.getElementById('btnSubmit'),
          formEl = document.getElementById('frmScoreSubmit'),
          playerName = document.getElementById('playerName'),
          uid = document.getElementById('uid'),
          submitScore = function(e) {
                var honeypot = document.querySelector('.honeypot'),
                submitData = {};

            playerName.className = (playerName.value === '') ? 'empty' : '';

            if(playerName.value !== '') {
              submitData.playerName = playerName.value;
              submitData.score = score;
              submitData.screenWidth = screen.width;
              submitData.screenHeight = screen.height;
              submitData.honeypot = honeypot.value;
              submitData.uid = uid.value;

              // store player name in cookie for later use
             writeCookie('playerName', playerName.value);

              // submit score
              callAjax('/ajax/submit-score.php', 'null', submitData, '#add-score', scoreSubmitted);
            }
            e.preventDefault();
          };

      playerNameCookie = readCookie('playerName');
      playerName.value = (playerNameCookie !== '') ? playerNameCookie : '';

      btnSubmit.addEventListener(eventName, submitScore);
      formEl.addEventListener('submit', submitScore);
      newGameDom(addScore, "Don't submit score, play again now!");
    }

    function scoreSubmitted(data) {
      var success = JSON.parse(data).success,
          leaderboardLink;

      if(success) {
        addScore.innerHTML = '<p> Thank you! Your score has been submitted! </p>';

        leaderboardLink = generateEl('a', {
          'href' : '/leaderboard.html',
          'className': 'button button--blue',
          'innerHTML' : 'View Leaderboard'
        });

        addScore.appendChild(leaderboardLink);
        addScore.innerHTML += ' or... ';
        newGameDom(addScore);

      } else {
        addScore.innerHTML += '<p> Sorry! Looks like there was an error submitting your score. Please try again! </p>';
      }
    }

    function newGameDom(target, btnText) {
       var newGameBtn = generateNewGameBtn(btnText);

       target.appendChild(newGameBtn);
       newGameEventHandler(newGameBtn);
    }

    function generateNewGameBtn(btnText) {
      var btn = generateEl('button', {
        'id': 'js-new-game',
        'className': 'button button--blue',
        'innerHTML': (typeof btnText !== 'undefined') ? btnText : 'Play Again'
      });

      return btn;
    }

    function newGameEventHandler(el) {
      el.addEventListener(eventName, init.bind(this, defaultTimer));
    }

    function getElementDimensions(el) {
      return {
        elwidth: el.offsetWidth,
        elheight: el.offsetHeight
      };
    }

    function endGame() {
      var curGameDimensions = getElementDimensions(gameContainer);

      gameOver = document.createElement('div');
      addScore = document.createElement('div');
      gameOver.id = 'game-over';
    	gameOver.innerHTML = 'Game Over! <br /> You scored ' + score + ' Points!';
      gameContainer.innerHTML = "";
      gameContainer.appendChild(gameOver);

      addScore.id = 'add-score';
      gameOver.appendChild(addScore);

      if(curGameDimensions.elwidth !== gameContainerWidth || curGameDimensions.elheight !== gameContainerHeight) {
        gameOver.innerHTML += '<p style="color: #FC5B2A;"> Woops! Cannot submit your score. You are attempting to manipulate the game area and this is forbidden! Please try again and play fair... </p>';

        return false;
      }

      callAjax("/ajax/submit-score-form.html", "html", "", "#add-score", submitScoreForm);
    }

    function init(timer) {
       score = 0;
       setTimer(timer);
       generateTimer();
       getReadyAndGo(startGame);
    }

    if(game) {
        getUid();
    }

    /**
     * General functions
     */
    function getUid() {
      callAjax('/ajax/get-uid.php', 'null', '', '', setUid);
    }

    function setUid(id) {
      var uidInput = generateEl('input', {
        'type': 'hidden',
        'id': 'uid',
        value: id
      });
      document.body.appendChild(uidInput);

      if(game) {
        init(10);
      }
    }

   function writeCookie(cname, cvalue, exdays) {
      var d = new Date(),
        expires;

      exdays = exdays || 1;
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      expires = "expires=" + d.toGMTString();
      document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
   }

   function readCookie(cname) {
     var name = cname + "=",
         cookies = document.cookie.split(';'),
         len = cookies.length,
         i = 0,
         c;

     for (i; i < len; i++) {
       c = cookies[i].trim();
       if (c.indexOf(name) === 0) {
         return c.substring(name.length, c.length);
       }
     }
     return '';
    }

  /**
   * Leaderboard functions
   */
  function renderLeaderboard(isChangeEvent) {
    var gameLeaderFilterCookie = readCookie('gameLeaderFilters');

    if(isChangeEvent) {
      writeCookie('gameLeaderFilters', gameLeaderFilters.value);
    } else {
      if(gameLeaderFilterCookie !== '') {
        gameLeaderFilters.value = gameLeaderFilterCookie;
      }
    }
    callAjax('/ajax/get-leaderboard.php', 'html', { deviceType: gameLeaderFilters.value }, '#js-leaderboard');
  }

  if(gameLeaders) {
    renderLeaderboard();
    gameLeaderFilters.addEventListener('change', renderLeaderboard.bind(this, true));
  }

})();
