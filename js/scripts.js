$(document).ready(function() {

  var map;
  var markersArray =[];
  var markerList = {};
  var infoWindow;
  var availableStops = [];
  var selected_mta = [];
  var selected_stops = [];
  var selected_stops_empty = [];
  var selected = [];
  if ($.bbq.getState("line") != null) {
    var line_selected = $.bbq.getState("line");
  } else {
    var line_selected = "N"
  }
  var json_selected;
  var cover_height;
  var select_layer;

  var width = $("#label").css("width");
  var height= $("#label").css("height");
  $("#label_back").css({"width":parseInt(width)+20, "height":parseInt(height)+0})


  var rss = [
    {"line":"N", "link":"http://www.nydailynews.com/json/cmlink/eating-n-line-1.2734164"},
    {"line":"7", "link":"http://www.nydailynews.com/json/cmlink/eating-7-line-1.2761341"},
    {"line":"Q", "link":"http://www.nydailynews.com/json/cmlink/eating-q-line-1.2761339"},
    {"line":"4", "link":"http://www.nydailynews.com/json/cmlink/eating-4-line-1.2761335"},
    {"line":"M", "link":"http://www.nydailynews.com/json/cmlink/eating-m-line-1.2761327"},
    {"line":"G", "link":"http://www.nydailynews.com/json/cmlink/eating-g-line-1.2761325"},
    {"line":"A", "link":"http://www.nydailynews.com/json/cmlink/eating-a-line-1.2761311"},
    {"line":"2", "link":"http://www.nydailynews.com/json/cmlink/eating-2-line-1.2734246"},
    {"line":"J", "link":"http://www.nydailynews.com/json/cmlink/eating-j-line-1.2962618"}
  ]

   var cover = [
    {"line":"N", "image":"img/N_Train-min.jpg","text":""},
    {"line":"7", "image":"img/7_Train-min.jpg","text":""},
    {"line":"Q", "image":"img/Q_Train-min.jpg","text":""},
    {"line":"4", "image":"img/4_Train-min.jpg","text":""},
    {"line":"M", "image":"img/M_Train-min.jpg","text":""},
    {"line":"G", "image":"img/G_Train-min.jpg","text":""},
    {"line":"A", "image":"img/A_Train-min.jpg","text":""},
    {"line":"2", "image":"img/2_Train-min.jpg","text":""},
    {"line":"J", "image":"img/J_Train-min.jpg","text":""}
  ]


  // var rss = [
  //   {"line":"N", "link":"data/rss-N.json"},
  //   {"line":"7", "link":"data/rss-7.json"},
  //   {"line":"Q", "link":"data/rss-Q.json"},
  //   {"line":"4", "link":"data/rss-4.json"},
  //   {"line":"M", "link":"data/rss-M.json"},
  //   {"line":"G", "link":"data/rss-G.json"},
  //   {"line":"A", "link":"data/rss-A.json"},
  //   {"line":"2", "link":"data/rss-2.json"}
  // ]

  // These are the stations that have labels that need to be angled up
  var labels = [
    {"line":"N", "upper":["57th St"]},
    {"line":"7", "upper":["Vernon Blvd - Jackson Ave", "46th St", "Junction Blvd", "Woodside - 61st St", "74th St - Broadway", "90th St - Elmhurst Av", "40th St"]},
    {"line":"Q", "upper":["57th St", "Ocean Pkwy", "Coney Island - Stillwell Av"]},
    {"line":"4", "upper":["Franklin Ave"]},
    {"line":"M", "upper":["Seneca Ave", "Forest Ave", "23rd St - Ely Av"]},
    {"line":"G", "upper":["Clinton - Washington Aves", "Hoyt - Schermerhorn Sts", "Fulton St", "Classon Ave"]},
    {"line":"A", "upper":["Nostrand Ave", "Beach 105th St", "Beach 98th St", "Rockaway Park - Beach 116 St", "Beach 90th St", "Utica Ave", "Broadway Junction"]},
    {"line":"2", "upper":["149th St - Grand Concourse"]},
    {"line":"J", "upper":["Halsey St", "Chauncey St", "Broadway Junction", "Alabama Ave", "Van Siclen Ave", "Cleveland St", "Cypress Hills", "75th St - Eldert Ln", "85th St - Forest Pky", "95th St - Forest Pky", "Woodhaven Blvd", "104th-102nd Sts", "121st St"]}
  ]

  for (i=0;i<rss.length;i++) {
    if (rss[i].line == line_selected) {
      json_selected = rss[i].link;
    }
  }

    var lines = ['1','2','3','4','5','6','7','A','C','E','B','D','F','M','N','Q','R','J','Z','G','L','S']
    var lines_no = ['1','3','5','6','C','E','B','D','F','R','Z','L','S']

    for (i=0; i<lines.length; i++) {
        $("#legend_box").append('<div class="logo_box"><img style="cursor: pointer;" class="legend" id="' + lines[i] + '" src="img/line_' + lines[i] + '.png"</div>')
    }
    
    $.each($(".legend"), function() {
        for (p=0; p<lines_no.length; p++) {
            if ( $(this).attr("id") == lines_no[p]) {
                $(this).addClass("no_restaurant");
                // $(this).off("click");
            }
        }

    })

    $("#1").css("margin-left", "52px");
    $("#S").css("margin-right", "52px");

    $("#legend_box").prepend('<div class="left_box" ><img style="cursor: pointer;" class="left" src="img/left.png"</div>');
    $("#legend_box").append('<div class="right_box" ><img style="cursor: pointer;" class="right" src="img/right.png"</div>');

    $(".left").click(function() {
        var slideW = $('.logo_box').width();
        $('#legend_box').animate({scrollLeft: "-="+slideW*1 }, 600);      
    })

    $(".right").click(function() {
        var slideW = $('.logo_box').width();
        $('#legend_box').animate({scrollLeft: "+="+slideW*1 }, 600);      
    })


    var map = L.map("map-container",{
        scrollWheelZoom: false
    }).setView([40.708670, -74.024773], 13);

    L.tileLayer('https://api.mapbox.com/styles/v1/nydnmaps/cisgc1l2q001p2xpiqbx1o4bx/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoibnlkbm1hcHMiLCJhIjoiM1dZem9aWSJ9.x22rTAWkRpNy2bOTlVe1jg', {
          attribution: 'Mapbox',
          maxZoom: 20,
          minZoom: 13,
          //token: '',
      }).addTo(map);

    L.control.zoom ({
      position: "bottomright"
    }).addTo(map);

    function getLine(d) {
        return d == "1" || d == "2" || d == "3" ? '#ee352e' :
               d == "4" || d == "5" || d == "6"  ? '#00933c' :
               d == "7"  ? '#b933ad' :
               d == "R" || d == "N" || d == "Q"? '#fccc0a' :
               d == "A" || d == "C" || d == "E"  ? '#2850ad' :
               d == "B" || d == "D" || d == "F" || d == "M"  ? '#ff6319' :
               d == "S"  ? '#808183' :
               d == "L"  ? '#a7a9ac' :
               d == "G"  ? '#6cbe45' :
               d == "J" || d == "Z" ? '#996633' :
                                      '#000000' ;
    };

    function style_line(feature) {
        weight = 3,
        color = getLine(feature.properties.route_id)
        return {
            weight: weight,
            color: color,
            opacity: 1.0,
        };
    };

    function style_line_hide(feature) {
        weight = 3,
        color = getLine(feature.properties.route_id)
        return {
            weight: weight,
            color: color,
            opacity: 0,
        };
    };

    function style_nyc(feature) {
        return {
            weight: 2,
            color: "black",
            opacity: 1.0,
        };
    };

    function style_stop(feature) {
        color = getLine(feature.properties.line)
        return {
            weight: 2,
            color: color,
            fillColor: color,
            fillOpacity: 1,
            opacity: 1,
            radius: 6,
        };
    };

    function style_stop_hide(feature) {
        color = getLine(feature.properties.line)
        return {
            weight: 2,
            color: color,
            fillColor: color,
            fillOpacity: 0,
            opacity: 0,
            radius: 6,
        };
    };

    function style_stop_highlight(feature) {
        color = getLine(feature.properties.line)
        return {
            weight: 2,
            color: color,
            fillColor: "white",
            fillOpacity: 0,
            opacity: 0,
            radius: 12,
        };
    };

    function style_stop_empty(feature) {
        color = getLine(feature.properties.line)
        return {
            weight: 2,
            color: color,
            fillColor: "white",
            fillOpacity: 1,
            opacity: 1,
            radius: 6,
        };
    };

    var style_stop_hovered = {
      radius: 12,
    }

    var style_stop_clicked = {
      fillColor: "white",
      radius: 12,
    }

    function scrollToCard(stop) {
      $.each($(".window"), function() {
          var currentID = $(this).attr("id").split("window")[1];
          var station = $(this).find(".stop").find(".stop_name").text()
          var station1 = station.split(" & ")[0];
          var station2 = station.split(" & ")[1];
          if (stop == station1 || stop == station2) {
              $('html, body').animate({
                  scrollTop: $("#window"+currentID).offset().top - 120
              }, 0);
              var windowWidth = $(window).width();
              if (windowWidth < 480) {
                    setTimeout(function() {
                        $("#map-container").css("z-index", 0);
                        $("#close_box").css("display","none");
                        $("#close_box_back").css("display","none");
                    }, 1000);
              } else {
                  $(".window").removeClass("highlighted");
                  $(this).addClass("highlighted"); 
              }

          }
      })

    };

    function onEachFeature(feature, layer) {
        layer.on({
            click: highlightFeature,
        });
        layer.bindPopup('<div class="popup-back"></div><div class="popup-front">'+feature.properties.stations+'<img class="line_label" src="img/line_'+feature.properties.line+'.png"></div>', {offset:new L.Point(0,0)});
        var windowWidth = $(window).width();
        layer.on('mouseover', function(e){
          if (windowWidth > 480  && select_layer.feature.properties.stations != feature.properties.stations) {  
              geojson_stop.setStyle(style_stop);
              select_layer.setStyle(style_stop_clicked);
              layer.setStyle(style_stop_hovered);
          }
        });
        layer.on('mouseout', function(e){
          if (windowWidth > 480 && select_layer.feature.properties.stations != feature.properties.stations) {   
              geojson_stop.setStyle(style_stop);
              select_layer.setStyle(style_stop_clicked);
          }
        });
    };

    function onEachFeature2(feature, layer) {
        layer.bindPopup(feature.properties.stations + "<br><span style='color: #00FAC0; font-weight: bold; font-size: 15px; text-align: center; text-transform: uppercase'>No articles for this stop</span>", {offset:new L.Point(0,0)});
        var windowWidth = $(window).width();
        if (windowWidth > 480) {    
          layer.on('mouseover', function(e){
                layer.openPopup();
          });
          layer.on('mouseout', function(e){
                layer.closePopup();
          });
        }
    };

    function onEachFeature3(feature, layer) { 
        layer.on({
            click: highlightFeature,
        });
        layer.bindPopup(feature.properties.stations+'<img class="line_label" src="img/line_'+feature.properties.line+'.png">', {offset:new L.Point(0,0)});
        // var windowWidth = $(window).width();
        // layer.on('mouseover', function(e){
        //   if (windowWidth > 480) {  
        //       geojson_stop.setStyle(style_stop);
        //       layer.setStyle(style_stop_hovered);
        //   }
        // });
        // layer.on('mouseout', function(e){
        //   if (windowWidth > 480) {             
        //       geojson_stop.setStyle(style_stop);
        //   }
        // });
    };

    function highlightFeature(e) {
        var popup_width = $(".leaflet-popup-content").width();
        var popup_height = $(".leaflet-popup-content").height();
        $(".popup-back").width(popup_width)
        $(".popup-back").height(popup_height)
        var windowWidth = $(window).width();
        //window.history.replaceState('', '', window.location.origin + window.location.pathname + '#' + selected.toLowerCase().replace(' ', '-'));
        // if (windowWidth > 480) {
                geojson_stop.setStyle(style_stop);
                var layer = e.target;
                layer.setStyle(style_stop_clicked);
                scrollToCard(layer.feature.properties.stations);
                map.panTo(layer._latlng);
                layer.openPopup();
        //}
        select_layer = layer;
    };

    //geojson_line = L.geoJson(nyc, {style: style_nyc}).addTo(map);
    geojson_line = L.geoJson(mta, {style: style_line_hide}).addTo(map);
    geojson_stop = L.geoJson(stops, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: style_stop_hide,
    }).addTo(map);
    geojson_stop_empty = L.geoJson(stops, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: style_stop_hide,
    }).addTo(map);
    // geojson_stop_highlight = L.geoJson(stops, {
    //     pointToLayer: function (feature, latlng) {
    //         return L.circleMarker(latlng);
    //     },
    //     style: style_stop_highlight,
    // }).addTo(map);



    // function myIcon() {
    //     color = getLine(feature.properties.line)
    //     L.divIcon({className: 'my-div-icon', html: stop, iconAnchor: [-10, 0], iconSize: 100});
    // };



    function loadMarker(latlng, stop, line, i) {
              var lat = latlng[0];
              var lng = latlng[1];
              var marker = L.marker([lng, lat], {
                icon: L.divIcon({className: 'horizontal', html: "<div class='horizontal-inner'>"+stop+"</div>", iconAnchor: [-15, 10], iconSize: 100})
              }).addTo(map);
              markersArray.push(marker);
    }

    function loadMarker_upper(latlng, stop, line, i) {
              var lat = latlng[0];
              var lng = latlng[1];
              var marker = L.marker([lng, lat], {
                icon: L.divIcon({className: 'upper-right', html: "<div class='upper-right-inner'>"+stop+"</div>", iconAnchor: [30, 90]})
              }).addTo(map);
              markersArray.push(marker);
    }

    var loadMap = function (line_selected, json_selected) {   
      $.getJSON(json_selected, function(data){
          if (line_selected == "4") {
                data.reverse();   
          }

          selected_mta = [];
          selected_stops = [];
          selected_stops_empty = [];
          for (i=0; i<mta.features.length; i++) {
              if (mta.features[i].properties.route_id == line_selected) {
                  map.removeLayer(geojson_line);
                  selected_mta.push(mta.features[i])
                  geojson_line = L.geoJson(selected_mta, {style: style_line}).addTo(map);
              }
          }


          var my_stops = []
          for (p = 0; p<data.length; p++) {
              var stop1 = data[p].body[0].paragraphs.split(": ")[0].split(" & ")[0];
              var stop2 = data[p].body[0].paragraphs.split(": ")[0].split(" & ")[1];
              my_stops.push(stop1);
              if (stop2 != null && $.inArray(stop2,my_stops) == -1) {
                  my_stops.push(stop2)
              } 
          }

          for (i=0; i<stops.features.length; i++) {
            if (stops.features[i].properties.line == line_selected) {
                  if ($.inArray(stops.features[i].properties.stations,my_stops) !== -1) {
                      selected_stops.push(stops.features[i]);
                  } else {
                      selected_stops_empty.push(stops.features[i])
                  }
            }
          }

        
          map.removeLayer(geojson_stop);
          map.removeLayer(geojson_stop_empty); 
          //map.removeLayer(geojson_stop_highlight);   

          geojson_stop = L.geoJson(selected_stops, {
              pointToLayer: function (feature, latlng) {                            
                  return L.circleMarker(latlng);
              },
              style: style_stop,
              onEachFeature: onEachFeature
          }).addTo(map);

          geojson_stop_empty = L.geoJson(selected_stops_empty, {
              pointToLayer: function (feature, latlng) {                            
                  return L.circleMarker(latlng);
              },
              style: style_stop_empty,
              onEachFeature: onEachFeature2
          }).addTo(map);

          // geojson_stop_highlight = L.geoJson(selected_stops, {
          //     pointToLayer: function (feature, latlng) {                            
          //         return L.circleMarker(latlng);
          //     },
          //     style: style_stop_highlight,
          //     onEachFeature: onEachFeature3
          // }).addTo(map);

          for (i = 0; i < markersArray.length; i++) {
            map.removeLayer(markersArray[i]);
          }

          for (p = 0; p < labels.length; p++) {
            if (labels[p].line == line_selected) {
                for (i = 0; i < selected_stops.length; i++) {
                  selected.push(selected_stops[i].properties.stations)
                  // This logic determines if subway stop labels appear horizontal
                  // or turned up at an angle. This is necessary to fix situations
                  // where labels overlap.
                  // This logic looks for whether the subway station is listed in the subway line's 'upper' array.
                  if ($.inArray(selected_stops[i].properties.stations,labels[p].upper) == -1) {
                    loadMarker(selected_stops[i].geometry.coordinates, selected_stops[i].properties.stations, selected_stops[i].properties.line, i);
                  } else {
                    loadMarker_upper(selected_stops[i].geometry.coordinates, selected_stops[i].properties.stations, selected_stops[i].properties.line, i);            
                  }
                }            
            }
          }


        for (i=0;i<cover.length;i++) {
          if (cover[i].line == line_selected) {
            var banner = cover[i].image;
            var intro = cover[i].text;
          }
        }


        $("#box").html('<div class"img_box" style="position: relative"><img id="img1" src="' + banner + '"><div id="social_map" class="large-12 medium-12 small-12 columns"><a class="fb-share" href="http://www.facebook.com/sharer.php?u=http://interactive.nydailynews.com/2016/02/why-hollywood-obsessed-with-apocalypse/index.html" target="_blank"><div id="facebook" class="small-text-center"></div></a><a href="https://twitter.com/share?url=http://nydn.us/apocalypse&text=We"re doomed! Why is Hollywood obsessed with the apocalypse? @NYDailynews " target="_new"><div id="twitter"></div></a><a href="mailto:?subject=We"re doomed! Why is Hollywood obsessed with the apocalypse?&body=It’s the end of the world as we know it — at least if the upcoming blockbusters are any indication. http://nydn.us/apocalypse"><div id="email"></div></a></div></div><div id="head">Eating along the ' + line_selected + ' line</div><div class="text">'+ intro +'</div></div><div class="scroll_box"><img class="scroll" src="img/scroll.png"></div>');

          $(".scroll").on("click",function (){
              $('html, body').animate({
                  scrollTop: $("#info-box-desktop").offset().top - 120
              }, 600);
          });

          $("#info-box-desktop").empty();

          for (i = 0; i<data.length; i++) {
              var stop = data[i].body[0].paragraphs.split(": ")[0];
              var headline = data[i].title;
              var details = data[i].body[0].paragraphs.split(": ")[1];
              var image = data[i].images[0].originalSrc;
              var url = data[i].url;     
              $("#info-box-desktop").append("<div class='window' id='window"+i+"'><div class='stop'><span class='stop_name'>"+stop+"</span><span class='map_label'><img class='view_map' src='img/view_map.png'></span></div><div style='position: relative;'><img class='profile' src='"+image+"' /><div class='name'>"+headline+"</div></div><div class='details'>"+details+"</div><a target='_blank' href='"+url+"''><div class='visit-page'>READ MORE</div></a><div id='social'><a class='fb-share' href='http://www.facebook.com/sharer.php?u=http://interactive.nydailynews.com/2016/02/why-hollywood-obsessed-with-apocalypse/index.html' target='_blank'><div id='facebook' class='small-text-center'></div></a><a href='https://twitter.com/share?url=http://nydn.us/apocalypse&text=We're doomed! Why is Hollywood obsessed with the apocalypse? @NYDailynews ' target='_new'><div id='twitter'></div></a><a href='mailto:?subject=We're doomed! Why is Hollywood obsessed with the apocalypse?&body=It’s the end of the world as we know it — at least if the upcoming blockbusters are any indication. http://nydn.us/apocalypse'><div id='email'></div></a></div></div>");

          }

          $('html, body').animate({
              scrollTop: $("#box").offset().top - 120
          }, 0);

          $.each(geojson_stop._layers, function() { 
              var layer_stop = $(this)[0].feature.properties.stations;
              var data_stop = data[0].body[0].paragraphs.split(": ")[0];
              var data_stop_1 = data_stop.split(" & ")[0];
              if (layer_stop ==  data_stop_1 ) {
                  var latlng = $(this)[0].feature.geometry.coordinates;
                  var lat = latlng[0];
                  var lng = latlng[1];
                  map.panTo([lng,lat]);
              }

          });

       })

    };


    // If someone clicks on a subway line at the top of the screen
    $(".legend").click(function (){
        line_selected = $(this).attr("id");
        clickLegend(line_selected);
    });

    function clickLegend(value){
        if ($.inArray(value,lines_no) == -1) {
        for (i=0;i<rss.length;i++) {
          if (rss[i].line == value) {
            window.history.replaceState('', '', window.location.origin + window.location.pathname + '#' + value);
            json_selected = rss[i].link;
            $(".logo_box").removeClass("selected");
            $(this).closest(".logo_box").addClass("selected");
          }
        }
          loadMap(value, json_selected);
        }
    }

    // Runs the first time the page loads
    if ( window.location.hash !== '' )
    {
        // Parse out the pieces of the hash, which we use for permanent links
        line_selected = window.location.hash[1];
    }
    loadMap(line_selected, json_selected);


      cover_height = $("#box").css("height");
      // $("#info-box-desktop").css("top", parseInt(cover_height) + 457)      

      function  scrollFunction() {
        var window_height = $(window).height();
        var window_top_position = $(window).scrollTop();
        var window_bottom_position = (window_top_position + window_height);

        $.each($(".window"), function() {
          var element_height = $(this).outerHeight();
          var element_top_position = $(this).offset().top;
          var element_bottom_position = (element_top_position + element_height);
          var currentID = $(this).attr("id").split("window")[1];
          var station = $(this).find(".stop_name").text()
          var station1 = station.split(" & ")[0];
          var station2 = station.split(" & ")[1];


          //check to see if this current container is within viewport
          if ( (element_top_position - window_top_position) < 140 ) {
                        $("#label").html(station + "<img class='line_label' src='img/line_"+line_selected+".png'><img class='map_label' src='img/map.png'>");
                        var width = $("#label").css("width");
                        var height= $("#label").css("height");
                        $("#label_back").css({"width":parseInt(width)+20, "height":parseInt(height)+0})
                        $("#label").css({"display":"inline"})
                        $("#label_back").css({"display":"inline"})

                        $.each(geojson_stop._layers, function() {
                          var stop = $(this)[0].feature.properties.stations;
                          var layer = $(this)[0];
                          var latlng = $(this)[0].feature.geometry.coordinates;
                          if (station1 == stop) {
                            var lat = latlng[0];
                            var lng = latlng[1];
                            geojson_stop.setStyle(style_stop);
                            geojson_stop_empty.setStyle(style_stop_empty);
                            layer.setStyle(style_stop_clicked);
                            layer.openPopup();
                            select_layer = layer;
                            map.panTo(layer._latlng);
                          } else {}
                          if (station2 == stop) {
                            geojson_stop.setStyle(style_stop);
                            geojson_stop_empty.setStyle(style_stop_empty);
                            layer.setStyle(style_stop_clicked);
                            layer.openPopup();
                            select_layer2 = layer;
                          }
                        })
                        var windowWidth = $(window).width();
                        if (windowWidth > 480 ) {
                            $(".window").removeClass("highlighted");
                            $(this).addClass("highlighted"); 
                        }

          }
          
        });

        $(".map_label").click(function() {
          //$("#legend_box").css("display","none");
          //$("#nydn-header").css("display","none");
          //$("#label").css("display","none");
          //$("#label_back").css("display","none");

          var stations = $(this).closest(".stop").find(".stop_name").text();
          var stations1 = stations.split(" & ")[0];
          var stations2 = stations.split(" & ")[1];       
          $.each(geojson_stop._layers, function() {
            var stop = $(this)[0].feature.properties.stations;
            var layer = $(this)[0];
            if (stations1 == stop) {
              var latlng = $(this)[0].feature.geometry.coordinates;
              var lat = latlng[0];
              var lng = latlng[1];
              geojson_stop.setStyle(style_stop);
              geojson_stop_empty.setStyle(style_stop_empty);
              //geojson_stop_highlight.setStyle(style_stop_highlight);
              layer.setStyle(style_stop_clicked);
              layer.openPopup();
              map.panTo([lng,lat]);
            }
            if (stations2 == stop) {
              geojson_stop.setStyle(style_stop);
              geojson_stop_empty.setStyle(style_stop_empty);
              //geojson_stop_highlight.setStyle(style_stop_highlight);
              layer.setStyle(style_stop_clicked);
              layer.openPopup();
            }
          })

          $("#map-container").css("z-index",5);
          $("#legend_box").css("z-index",6);
          $("#close_box").html("<img class='back' src='img/back.png'>BACK");
          $("#close_box").css("display","block");
          $("#close_box_back").css("display","block");
          var width = $("#close_box").css("width");
          var height= $("#close_box").css("height");

          $("#close_box_back").css({"width":parseInt(width)+0, "height":parseInt(height)+0})
          $("#close_box").click(function() {
              $("#map-container").css("z-index", 0);
              $("#close_box").css("display","none");
              $("#close_box_back").css("display","none");
              //$("#legend_box").css("display","block");
              //$("#nydn-header").css("display","block");
              //$("#label").css("display","block");
              //$("#label_back").css("display","block");
          })
        })


        if (window_top_position < parseInt(cover_height) + 300) {
            $("#label").css({"display":"none"})
            $("#label_back").css({"display":"none"})
            
        }

        if (window_top_position < 50 ) {
           $(".right, .left").css({"top":50-window_top_position})
        } else {
          $(".right, .left").css({"top":"0px"}) 
        }


      };

        // We want the scrollFunction() to fire, at most, three times per second.
        //$(window).scroll(scrollFunction);
        window.did_scroll = 0;
        $(window).scroll(scrollFunctionWrapper);
        function scrollFunctionWrapper() { did_scroll = 1; }
        setInterval(function()
        {
            if ( did_scroll == 1 )
            {
                did_scroll = 0;
                scrollFunction();
            }
        }, 1000);

  });

// $(document).ready(function() {
       
//     }), 
//     function() {
//         var e, t;
//         e = this.jQuery || window.jQuery, t = e(window), e.fn.stick_in_parent = function(o) {
//             var n, i, s, r, a, c, l, d, g, w;
//             for (null == o && (o = {}), l = o.sticky_class, i = o.inner_scrolling, c = o.recalc_every, a = o.parent, r = o.offset_top, s = o.spacer, n = o.bottoming, null == r && (r = 0), null == a && (a = void 0), null == i && (i = !0), null == l && (l = "is_stuck"), null == n && (n = !0), d = function(o, d, g, w, p, u, f, h) {
//                     var m, v, b, y, k, T, _, M, $, x, S;
//                     if (!o.data("sticky_kit")) {
//                         if (o.data("sticky_kit", !0), T = o.parent(), null != a && (T = T.closest(a)), !T.length) throw "failed to find stick parent";
//                         if (m = b = !1, (x = null != s ? s && o.closest(s) : e("<div />")) && x.css("position", o.css("position")), _ = function() {
//                                 var e, t, n;
//                                 return !h && (e = parseInt(T.css("border-top-width"), 10), t = parseInt(T.css("padding-top"), 10), d = parseInt(T.css("padding-bottom"), 10), g = T.offset().top + e + t, w = T.height(), b && (m = b = !1, null == s && (o.insertAfter(x), x.detach()), o.css({
//                                     position: "",
//                                     top: "",
//                                     width: "",
//                                     bottom: ""
//                                 }).removeClass(l), n = !0), p = o.offset().top - parseInt(o.css("margin-top"), 10) - r, u = o.outerHeight(!0), f = o.css("float"), x && x.css({
//                                     width: o.outerWidth(!0),
//                                     height: u,
//                                     display: o.css("display"),
//                                     "vertical-align": o.css("vertical-align"),
//                                     "float": f
//                                 }), n) ? S() : void 0
//                             }, _(), u !== w) return y = void 0, k = r, $ = c, S = function() {
//                             var e, a, v, M;
//                             return !h && (null != $ && (--$, 0 >= $ && ($ = c, _())), v = t.scrollTop(), null != y && (a = v - y), y = v, b ? (n && (M = v + u + k > w + g, m && !M && (m = !1, o.css({
//                                 position: "fixed",
//                                 bottom: "",
//                                 top: k
//                             }).trigger("sticky_kit:unbottom"))), p > v && (b = !1, k = r, null == s && ("left" !== f && "right" !== f || o.insertAfter(x), x.detach()), e = {
//                                 position: "",
//                                 width: "",
//                                 top: ""
//                             }, o.css(e).removeClass(l).trigger("sticky_kit:unstick")), i && (e = t.height(), u + r > e && !m && (k -= a, k = Math.max(e - u, k), k = Math.min(r, k), b && o.css({
//                                 top: k + "px"
//                             })))) : v > p && (b = !0, e = {
//                                 position: "fixed",
//                                 top: k
//                             }, e.width = "border-box" === o.css("box-sizing") ? o.outerWidth() + "px" : o.width() + "px", o.css(e).addClass(l), null == s && (o.after(x), "left" !== f && "right" !== f || x.append(o)), o.trigger("sticky_kit:stick")), b && n && (null == M && (M = v + u + k > w + g), !m && M)) ? (m = !0, "static" === T.css("position") && T.css({
//                                 position: "relative"
//                             }), o.css({
//                                 position: "absolute",
//                                 bottom: d,
//                                 top: "auto"
//                             }).trigger("sticky_kit:bottom")) : void 0
//                         }, M = function() {
//                             return _(), S()
//                         }, v = function() {
//                             return h = !0, t.off("touchmove", S), t.off("scroll", S), t.off("resize", M), e(document.body).off("sticky_kit:recalc", M), o.off("sticky_kit:detach", v), o.removeData("sticky_kit"), o.css({
//                                 position: "",
//                                 bottom: "",
//                                 top: "",
//                                 width: ""
//                             }), T.position("position", ""), b ? (null == s && ("left" !== f && "right" !== f || o.insertAfter(x), x.remove()), o.removeClass(l)) : void 0
//                         }, t.on("touchmove", S), t.on("scroll", S), t.on("resize", M), e(document.body).on("sticky_kit:recalc", M), o.on("sticky_kit:detach", v), setTimeout(S, 0)
//                     }
//                 }, g = 0, w = this.length; w > g; g++) o = this[g], d(e(o));
//             return this
//         }
//     }.call(this), $("#nydn-header").stick_in_parent({
//         bottoming: !1,
//         offset_top: 0
//     });

$(document).ready(function() {
       
    }), 
    function() {
        var e, t;
        e = this.jQuery || window.jQuery, t = e(window), e.fn.stick_in_parent = function(o) {
            var n, i, s, r, a, c, l, d, g, w;
            for (null == o && (o = {}), l = o.sticky_class, i = o.inner_scrolling, c = o.recalc_every, a = o.parent, r = o.offset_top, s = o.spacer, n = o.bottoming, null == r && (r = 0), null == a && (a = void 0), null == i && (i = !0), null == l && (l = "is_stuck"), null == n && (n = !0), d = function(o, d, g, w, p, u, f, h) {
                    var m, v, b, y, k, T, _, M, $, x, S;
                    if (!o.data("sticky_kit")) {
                        if (o.data("sticky_kit", !0), T = o.parent(), null != a && (T = T.closest(a)), !T.length) throw "failed to find stick parent";
                        if (m = b = !1, (x = null != s ? s && o.closest(s) : e("<div />")) && x.css("position", o.css("position")), _ = function() {
                                var e, t, n;
                                return !h && (e = parseInt(T.css("border-top-width"), 10), t = parseInt(T.css("padding-top"), 10), d = parseInt(T.css("padding-bottom"), 10), g = T.offset().top + e + t, w = T.height(), b && (m = b = !1, null == s && (o.insertAfter(x), x.detach()), o.css({
                                    position: "",
                                    top: "",
                                    width: "",
                                    bottom: ""
                                }).removeClass(l), n = !0), p = o.offset().top - parseInt(o.css("margin-top"), 10) - r, u = o.outerHeight(!0), f = o.css("float"), x && x.css({
                                    width: o.outerWidth(!0),
                                    height: u,
                                    display: o.css("display"),
                                    "vertical-align": o.css("vertical-align"),
                                    "float": f
                                }), n) ? S() : void 0
                            }, _(), u !== w) return y = void 0, k = r, $ = c, S = function() {
                            var e, a, v, M;
                            return !h && (null != $ && (--$, 0 >= $ && ($ = c, _())), v = t.scrollTop(), null != y && (a = v - y), y = v, b ? (n && (M = v + u + k > w + g, m && !M && (m = !1, o.css({
                                position: "fixed",
                                bottom: "",
                                top: k
                            }).trigger("sticky_kit:unbottom"))), p > v && (b = !1, k = r, null == s && ("left" !== f && "right" !== f || o.insertAfter(x), x.detach()), e = {
                                position: "",
                                width: "",
                                top: ""
                            }, o.css(e).removeClass(l).trigger("sticky_kit:unstick")), i && (e = t.height(), u + r > e && !m && (k -= a, k = Math.max(e - u, k), k = Math.min(r, k), b && o.css({
                                top: k + "px"
                            })))) : v > p && (b = !0, e = {
                                position: "fixed",
                                top: k
                            }, e.width = "border-box" === o.css("box-sizing") ? o.outerWidth() + "px" : o.width() + "px", o.css(e).addClass(l), null == s && (o.after(x), "left" !== f && "right" !== f || x.append(o)), o.trigger("sticky_kit:stick")), b && n && (null == M && (M = v + u + k > w + g), !m && M)) ? (m = !0, "static" === T.css("position") && T.css({
                                position: "relative"
                            }), o.css({
                                position: "absolute",
                                bottom: d,
                                top: "auto"
                            }).trigger("sticky_kit:bottom")) : void 0
                        }, M = function() {
                            return _(), S()
                        }, v = function() {
                            return h = !0, t.off("touchmove", S), t.off("scroll", S), t.off("resize", M), e(document.body).off("sticky_kit:recalc", M), o.off("sticky_kit:detach", v), o.removeData("sticky_kit"), o.css({
                                position: "",
                                bottom: "",
                                top: "",
                                width: ""
                            }), T.position("position", ""), b ? (null == s && ("left" !== f && "right" !== f || o.insertAfter(x), x.remove()), o.removeClass(l)) : void 0
                        }, t.on("touchmove", S), t.on("scroll", S), t.on("resize", M), e(document.body).on("sticky_kit:recalc", M), o.on("sticky_kit:detach", v), setTimeout(S, 0)
                    }
                }, g = 0, w = this.length; w > g; g++) o = this[g], d(e(o));
            return this
        }
    }.call(this), $("#legend_box").stick_in_parent({
        bottoming: !1,
        offset_top: 0,
    });


