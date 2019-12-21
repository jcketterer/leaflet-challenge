//Varibles for the URL's
var earthquakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

//Creating the circles showing size of magnitude
function markerSize(magnitude) {
  return magnitude * 5;
};

//Creating color for each quake
function quakeColor(mag) {
  if (mag > 5) {
    return 'red'
  }
  else if (mag > 4) {
    return '#d5995d'
  }
  else if (mag > 3) {
    return 'darkorange'
  }
  else if (mag > 2) {
    return 'greenyellow'
  }
  else {
    return '#99ff33'
  }
};

//creating variables for points of quakes
var earthquake = new L.LayerGroup();

d3.json(earthquakes, function(quakes) {
  L.geoJSON(quakes.features, {
    pointToLayer: function (point, latlng) {
      return L.circleMarker(latlng, {radius: markerSize(point.properties.mag)});
    },

    style: function (feature) {
      return {
        fillColor: quakeColor(feature.properties.mag),
        fillOpacity: 0.8,
        weight: 0.2,
        color: 'black'
      }
    },

    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "<h4 style='text-align:center;'>" + new Date(feature.properties.time) + 
        "</h4> <hr> <h5 style='text-align:center;'>" + feature.properties.title + "</h5>");
    }
  }).addTo(earthquake);
});

//creating tectonic plate layer
var tectPlates = new L.LayerGroup();

d3.json(plates, function(boundaries) {
  L.geoJSON(boundaries, {
    style: function() {
      return {color: "white", fillOpacity: 0}
    }
  }).addTo(tectPlates);
})

//Map Creation

function createMap() {
  var darkMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });
  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });
  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });
  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  //baselayer variables
  var baseLayer = {
    "Dark Map": darkMap,
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoors": outdoors
  };
  
  //overlay for map data
  var overLay = {
    "Plate Lines": tectPlates,
    "Earthquakes": earthquake,
  };

  //map creation
  var myMap = L.map("map", {
    center: [33.4942, -111.9261], // <---- THE DALE
    zoom: 4.0, 
    layers: [satellite, earthquake, tectPlates]
  });

  //layer control 
  L.control.layers(baseLayer, overLay).addTo(myMap);
  
  var legend = L.control({ position: 'bottomright'});

  legend.onAdd = function(){
    var div = L.DomUtil.create("div", "legend");
    return div;
  }
  legend.addTo(myMap);

  document.querySelector(".legend").innerHTML=displayLegend();

  function displayLegend() {
      var legendInfo = [{
          limit: "Mag: 0-1",
          color: "#99ff33"
        },{
          limit: "Mag: 1-2",
          color: "greenyellow"
        },{
          limit: "Mag: 2-3",
          color: "gold"
        },{
          limit: "Mag: 3-4",
          color: "DarkOrange"
        },{
          limit: "Mag: 4-5",
          color: "Peru"
        },{
          limit: "Mag: 5+",
          color: "red"
        }];

    var header = "<h3>Magnitude</h3><hr>";

    var strng = "";

    for (i = 0; i < legendInfo.length; i++) {
      strng += "<p style = \"background-color: " + legendInfo[i].color+"\">"+legendInfo[i].limit+"</p> ";
      }

    return header+strng;
  }

  let timelineControl = L.timelineSliderControl({
    formatOutputs: function(date) {
      return new Date(date).toString();
    }
  });
  timelineControl.addTo(myMap);
  timelineControl.adTimelines(timelineLayer);
  timelineLayer.addTo(map);

  var playback = new L.Playback(map, geoJSON, onPlayBackTimeChange, options);
 
};
createMap(); 
