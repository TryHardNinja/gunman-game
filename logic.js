$(function () {
    function TheGunman() {
        var __self = this;

        this.GAME_TICK = 100;

        this.GameObject = {
            frame: $('.frame'),
            targets: $('.targets'),
            enemyTmpl: $('.enemy-tmpl'),
            gameSounds: $('.game_sounds')
        };
        this.nameGameSounds = ['death','fire','foul','intro','shot','shot-fail','wait','win'];
        this.pathSound = 'assets/sfx/';
        this.expansionSound = '.m4a';

        __self.startGame();



        this.init();
    }
    TheGunman.prototype.getGameSounds = function (action) {

        var audioTmpl = '<audio id=":action" src=":path:action:expansionSound" autoplay></audio>';
        var getAudio = audioTmpl.replace(/:action/gi, action).replace(/:path/gi, this.pathSound).replace(/:expansionSound/gi, this.expansionSound);
        if (action) {
            this.GameObject.gameSounds.append(getAudio);
            var thisAudio = document.querySelector('#' + action);

            function getDurationSound() {
                thisAudio.onloadedmetadata = function () {
                    console.log(action + ' : ' + thisAudio.duration * 1000);
                    return thisAudio.duration * 1000;
                };
            }
            getDurationSound()
        }

    };

    TheGunman.prototype.startGame = function () {
        var __self = this;
        var start = $('.start');

        start.css({display: 'inline-block'});
        start.click(function (e) {
            __self.getGameSounds();
            __self.CreateNewEnemy();
            start.css({display: 'none'})
        });

    };

    // Создаем цель.
    TheGunman.prototype.CreateNewEnemy = function () {
        var tmpl = this.GameObject.enemyTmpl.clone().removeClass('enemy-tmpl').addClass('enemy');


        if (Math.random() < 0.5) {
            tmpl.addClass('enemy-right-side');
            tmpl.side = 'r';
        } else {
            tmpl.addClass('enemy-left-side');
            tmpl.addClass('icon-gunman_reverse');
            tmpl.side = 'l';
        }
        this.renderEnemy(tmpl);
    };
    TheGunman.prototype.renderEnemy = function (newEnemy) {
        this.GameObject.frame.append(newEnemy);
        var enemyHeight =  $('.enemy').height();
        console.log(enemyHeight);
        $('.enemy').css({marginTop: enemyHeight / 2 + 'px'});
        this.enemyGoing(newEnemy.side);
    };
    // Движение цели.
    TheGunman.prototype.enemyGoing = function (whichSide) {
        var enemy = $('.enemy'),
            frameWidth = this.GameObject.frame.width(),
            enemyDistance = 0,
            STEP_LENGHT = 10,
            __self = this;
        var numberAnim = 0;
        var goinSound = 5000;


        var isMoveActive = false; // флаг активности
        var onMoveDone = false; // обработчик завершения движения
        var motionGoingAnim = ['icon-gunman_01','icon-gunman_02','icon-gunman_03'];

        __self.getGameSounds('intro');
        
        var motionEnemy = function () {

            if ( ( frameWidth  / 2) != enemyDistance ) {
                var res;
                if (numberAnim == motionGoingAnim.length) {
                    enemy.removeClass(motionGoingAnim[numberAnim - 1]).addClass(motionGoingAnim[0]);
                    numberAnim = 0;
                } else {
                    enemy.removeClass(motionGoingAnim[numberAnim - 1]).addClass(motionGoingAnim[numberAnim]);
                    numberAnim++;
                }


                if ( whichSide === 'r') {
                    res = {marginRight: enemyDistance + 'px'};
                } else {
                    res = {marginLeft: enemyDistance + 'px'};
                }

                enemy.css(res);
                enemyDistance += STEP_LENGHT;
                setTimeout(motionEnemy,__self.GAME_TICK);
            }
            else {
                // сброс флага и запуск callback
                isMoveActive = false;
                if (typeof onMoveDone == 'function') {
                    onMoveDone();
                }
            }
        };
        startMove = function() {
            if (!isMoveActive) {
                // установка флага и запуск функции
                isMoveActive = true;
                setTimeout(motionEnemy,__self.GAME_TICK);
            }
        };
        onMoveDone = function() {
            for (var i = motionGoingAnim.length -1;i > 0;i--) {
                enemy.removeClass(motionGoingAnim[i]);
            }
            __self.EnemyAiming(enemy);
        };
        startMove();

    };
    // Прицеливание

    TheGunman.prototype.EnemyAiming = function (enemy) {
        var __self = this,
            enemyAiming = true,
            motionAimingAnim = ['icon-gunman_04'];


            enemy.addClass(motionAimingAnim[0]);
            __self.getGameSounds('wait');

            var viewsMeeting = setTimeout(function () {
                enemyAiming = false;
            __self.decisiveMoment(enemy);
             }, 2000);

                enemy.click(function (e) {
                    if (enemyAiming) {
                        enemyAiming = false;
                        __self.getGameSounds('foul');
                        console.log('РАНО! ВЫ ПРОИГРАЛИ');
                        clearTimeout(viewsMeeting);
                        // запуск проигрывание
                        __self.endGame();
                    }
                });




    };
    // Рещающий момент (выстрел)
    TheGunman.prototype.decisiveMoment = function (enemy, Reaction) {
        var __self = this;
        var cloud = $('.cloud');
        var enemyReaction = 1000;
        var numberAnim = 0;
        var youLive = true,
            enemyLive = true;
        var motionAnim = ['icon-gunman_05','icon-gunman_06'
            ,'icon-gunman_07','icon-gunman_08','icon-gunman_09'
            ,'icon-gunman_10','icon-gunman_11','icon-gunman_12'
            ,'icon-gunman_13','icon-gunman_14','icon-gunman_15'];

        // Противник достает оружие
        __self.getGameSounds('fire');
        cloud.css({display: 'block',left: '100px'}).html('<div>FIRE</div>');
        if ( enemy.hasClass('enemy-right-side') ) {
        } else {
            $('.cloud div').css({transform: 'scale(-1, 1)'});
        }


        var tookWeaponAnim = motionAnim.slice(2,4);
        var motionTookWeapon = setInterval(function () {
            enemy.addClass(tookWeaponAnim[numberAnim]);
            numberAnim++;
        },enemyReaction / tookWeaponAnim.length);

        // Обработка смерти
        var yourDead = function() {
            __self.getGameSounds('death');

            cloud.detach();
            enemy.removeClass(motionAnim.join(' '));
            enemy.addClass(motionAnim[4]);
            youLive = false;
            console.log('you death');
            __self.backgroundFilter('lose');
            __self.endGame();

        };

        var yourDeadEvent = setTimeout(yourDead, enemyReaction);

        // Обработка победы

            enemy.click(function (e) {
                if (youLive && enemyLive) {
                    enemyLive = false;


                    cloud.css({display: 'block', 'background-size': '100%',left: '100px'}).html('<div>YOU WON</div>');
                    if ( enemy.hasClass('enemy-right-side') ) {

                    } else {
                        $('.cloud div').css({transform: 'scale(-1, 1)'});

                    }


                    __self.getGameSounds('win');

                var winAnimation = motionAnim.slice(6, -3),
                    numberAnim = 0;
                clearInterval(motionTookWeapon);
                clearTimeout(yourDeadEvent);
                enemy.removeClass(motionAnim.join(' '));
                // Анимация падения
                  fallAnim = setInterval(function () {
                      enemy.addClass(winAnimation[numberAnim]);
                      numberAnim++;
                      if (numberAnim === winAnimation.length) {
                          clearInterval(fallAnim);
                          return;
                      }
                  }, 300);

                __self.backgroundFilter('win');
                    __self.endGame();



                }

            });

    };

    TheGunman.prototype.backgroundFilter = function (Exodus) {
        var __self = this;
        var frame = this.GameObject.frame;
        var count = 0;
        if (Exodus === 'win') {
            var changeBackground = function () {
                (count % 2 === 0) ? frame.addClass('frame-invert') : frame.removeClass('frame-invert');
                count++;
                if (count === 4) {
                    clearTimeout(changeBackground)
                }
                else {
                    setTimeout(changeBackground, 100);
                }
            };
            setTimeout(changeBackground, 100);
        } else if (Exodus === 'lose') {
            frame.addClass('frame-death');
        } else {

        }
    };

    TheGunman.prototype.endGame = function () {
        var restart = $('.restart');

        restart.css({display: 'inline-block'});
        restart.click(function (e) {
            window.location.reload();
        });
    };
    TheGunman.prototype.init = function () {
    };

   window.gunman = new TheGunman();

});