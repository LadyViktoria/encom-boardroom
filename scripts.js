var globe, stats, satbar, simpleclock, startDate, box, swirls;

startDate = new Date();

function animate(){

    globe.tick();
    satbar.tick();
    $("#clock").text(getTime());
    simpleclock.tick();
    box.tick();
    stockchart.tick();
    swirls.tick();
    requestAnimationFrame(animate);
    stats.update();

    // incrememnt everybody
    $(".location-slider ul :first-child").each(function(index, val){
        $(val).css("margin-left", "+=2px");
    });
    if(Math.random()<.3){
        $(".location-slider ul").each(function(index, val){
            if($(val).children().length > 10){
                $(val).children().slice(10-$(val).children().length).remove();
            }
        });
        $(".location-slider ul :first-child").each(function(index, val){
            if(parseInt($(val).css("margin-left")) > 200){
                $(val).parent().children().remove();
            }
        });
    }
}

function findArea(lat, lng){
    if(lat <= -40){
        return "antarctica";
    }
    if(lat > 12 && lng > -180 && lng < -45){
        return "northamerica";
    }
    if(lat <= 12 && lat > -40 && lng > -90 && lng < -30){
        return "southamerica";
    }
    if(lat < -10 && lng >= 105 && lng <=155){
        return "australia";
    }
    if(lat > 20 && lng >= 60 && lng <=160){
        return "asia";
    }
    if(lat > 10 && lat < 40 && lng >= 35 && lng <=60){
        return "asia";
    }
    if(lat > -40 && lat < 35 && lng >= -20 && lng <=50){
        return "africa";
    }
    if(lat >= 35 && lng >= -10 && lng <=40){
        return "europe";
    }

    return "other";


}


function getTime(){

    var elapsed = new Date() - startDate;

    var mili = Math.floor((elapsed/10) % 100);
    var seconds = Math.floor((elapsed / 1000) % 60); 
    var minutes = Math.floor((elapsed / 60000) % 100); 
    var hours = Math.floor((elapsed / 3600000) % 100); 

    return (hours < 10 ? "0":"") + hours + ":" + (minutes < 10 ? "0":"") + minutes + ":" + (seconds< 10? "0": "") + seconds + ":" + (mili < 10? "0" : "") + mili;

}

function start(){
    $("#splash").css("display","none");

    // the globe and other canvas-based renders will render their intros automatically
    // so start the render loop
    animate();


    var mediaBoxes = $('.media-box .user-pic');
    var blinkies = $('.blinky');
    var blinkiesColors = ["#000", "#ffcc00", "#00eeee", "#fff"];
    var userIndex = 0;
    var lastUserDate = Date.now();
    var currentUsers = [];

    // render the other elements intro animations

    $("#fps").delay(100).animate({
        height: "25px"
    }, 500).animate({
        width: "180px"}, 800);

        $("#ms").delay(600).animate({
            height: "25px"
        }, 500).animate({
            width: "180px"}, 800);

            $("#globalization").delay(600).animate({
                top: "0px",
                left: "0px",
                width: "180px"
            }, 500);

            $("#user-interaction").delay(600).animate({
                width: "600px"
            }, 500);

            $("#growth").delay(500).animate({
                width: "600px"
            }, 500);

            $("#media").delay(1000).animate({
                width: "450px"
            }, 500);

            $("#timer").delay(1000).animate({
                width: "450px"
            }, 500);


            
            setTimeout(function(){
                StreamServer.onMessage(function (datain) {
                    var chunks = datain.message.split("*");
                    
                    var data = {};
                    if(datain.location){
                       data.location = datain.location.name;
                       if(datain.location.lat && datain.location.lng){
                           data.latlng = {"lat": datain.location.lat, "lng": datain.location.lng};
                            globe.addMarker(datain.location.lat, datain.location.lng, datain.location.name);
                       }
                    }
                    
                    data.actor = chunks[3].trim();
                    data.repo = chunks[0].trim();
                    data.type = chunks[5].trim();
                    data.pic = chunks[6].trim();

                    /* do the globalization */

                    // figure out which one I'm in

                    var area = "unknown";
                    
                    if(data.latlng){
                       area = findArea(data.latlng.lat, data.latlng.lng);
                        $("#location-city-" + area).text(data.location);
                    }

                    $("#location-slider-" + area + " ul :first-child").css("margin-left", "-=5px");
                    $("#location-slider-" + area + " ul").prepend("<li/>");

                    // cleanup


                    $("#interaction > div").prepend('<ul class="interaction-data"><li>' + data.actor + '</li><li>' + data.repo + '</li><li>' + data.type + '</li></ul>');

                    swirls.hit(data.type);

                    $(blinkies[Math.floor(Math.random() * blinkies.length)]).css('background-color', blinkiesColors[Math.floor(Math.random() * blinkiesColors.length)]);

                    var showUser = true;

                    if(currentUsers.length < 10 || Date.now() - lastUserDate > 1000){
                        
                        for(var i = 0; i< currentUsers.length && showUser; i++){
                            if(currentUsers[i] == data.pic){
                                showUser = false;
                            }
                        }

                        if(showUser){
                            var img = document.createElement('img');

                            var profileImageLoaded = function(ui){
                                var mb = $(mediaBoxes[ui]);
                                mb.css('background-image', 'url(http://0.gravatar.com/avatar/' + data.pic + '?s=' + mb.width() +')');
                                mb.find('span').text(data.actor);

                            };

                            img.addEventListener('load', profileImageLoaded.bind(this, userIndex));
                            img.src = 'http://0.gravatar.com/avatar/' + data.pic + '?s=' + $(mediaBoxes[userIndex]).width();

                            currentUsers[userIndex] = data.pic;

                            userIndex++;
                            userIndex = userIndex % 10;

                            lastUserDate = Date.now();


                        }
                    }
                    
                });
            }, 2000);
            
            setTimeout(function(){
                for(var i = 0; i< 2; i++){
                    for(var j = 0; j< 4; j++){
                        
                        globe.addSatellite(50 * i - 30 + 15 * Math.random(), 90 * j - 120 + 30 * i, 1.3 + Math.random()/10);
                    }
                }
            }, 5000);

            setInterval(function(){
                satbar.setZone(Math.floor(Math.random()*4-1));
            }, 7000);

            setTimeout(function(){
                globe.addConnectedPoints(49.25, -123.1, "Vancouver", 35.68, 129.69, "Tokyo");
            }, 2000);

            setInterval(function(){
                $("#san-francisco-time").text(moment().tz("America/Los_Angeles").format("HH:mm:ss"));
                $("#new-york-time").text(moment().tz("America/New_York").format("HH:mm:ss"));
                $("#london-time").text(moment().tz("Europe/London").format("HH:mm:ss"));
                $("#berlin-time").text(moment().tz("Europe/Berlin").format("HH:mm:ss"));
                $("#bangalore-time").text(moment().tz("Asia/Colombo").format("HH:mm:ss"));
                $("#sydney-time").text(moment().tz("Australia/Sydney").format("HH:mm:ss"));
            }, 1000);

}

$(function() {
    // not sure why I need this setTimeout... gonna leave for now though
    // otherwise, sometimes it seems like some things aren't loaded properly
    setTimeout(function(){
        globe = new ENCOM.globe({containerId: "globe"});


        simpleclock = new ENCOM.SimpleClock("simpleclock");

        globe.init(function(){
            // called after the globe is complete

            box = new ENCOM.Box({containerId: "cube"});
            stats = new Stats(document.getElementById("fps-stats"), document.getElementById("ms-stats"));
            satbar = new ENCOM.SatBar("satbar");
            timertrees = new ENCOM.TimerTrees("timer-trees");
            stockchart = new ENCOM.StockChart("stock-chart");
            stockchartsmall = new ENCOM.StockChartSmall("stock-chart-small");
            swirls = new ENCOM.Swirls("swirls");

            $("#logo").animate({
                fontSize: "40px",
                opacity: 0
            }, 2000, "easeInOutBack", start
                              );

        });
    }, 10);

});



