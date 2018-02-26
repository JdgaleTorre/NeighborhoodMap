//Create the Model for the SearchBar
function SearchBarModel() {
    let self = this;
    this.place = ko.observable();
    let map;
    let service;
    self.markers = new ko.observableArray([]);
    let infowindow;
    const fourSquareClient = "FourSquareClientHERE";
    const fourSquareSecret = "FourSquareSecretHERE";
    let neighborHoodLocation;

    //When the document its load, we Init the Map
    $(function() {
        $(window).on("load", function() {
            //add the location of San Pedro Sula
            neighborHoodLocation = new google.maps.LatLng(15.5444332, -88.0167403);
            map = new google.maps.Map(document.getElementById("map"), {
                center: neighborHoodLocation,
                zoom: 16
            });
            //Create the first Request with the coffees 
            var request = {
                location: neighborHoodLocation,
                radius: "10000",
                type: ["cafe"]
            };

            //Create the Places Services
            service = new google.maps.places.PlacesService(map);
            service.nearbySearch(request, callback);

            //Create the InfoWindows
            infowindow = new google.maps.InfoWindow();

            //Add the event click to the button of Menu, to toggle the bar
            $("#menu").on("click", function() {
                $(".barra").toggleClass("oculta");
                $(".content").toggleClass("oculta");
            });
            //Add the event click of the button search to make the new query
            $("#searchPlace").on("click", function() {
                searchPlaces();
            });
        });
    });

    //Iths the callback that we going to use on our petitions to Place services
    function callback(results, status) {
        //If the status its ok, then create the markers in the map
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (const place of results) {
                createMarker(place);
            }
        }
    }
    //Search the new Places with the value that the user give us
    function searchPlaces() {
        var request = {
            location: neighborHoodLocation,
            radius: "10000",
            query: self.place
        };

        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, callback);
    }

    //Create the new Mark and add it on the array of Markers 
    function createMarker(place) {
        let newMark = new google.maps.Marker({
            position: place.geometry.location,
            title: place.name,
            map: map,
            animation: google.maps.Animation.DROP,
            rating: place.rating,
            vicinity: place.vicinity,
            types: place.types
        });

        //search on FourSquare to find more information of the place
        var request = `https://api.foursquare.com/v2/venues/search?client_id=${fourSquareClient}&client_secret=${fourSquareSecret}&near=San Pedro Sula&query=${
      newMark.title
    }&limit=1&v=20180225`;

        fetch(request)
            .then(response => response.json())
            .then(function(response) {
                //If the response its ok, then create the infoWindow with the info of Google and Foursquare
                if (response.meta.code === 200) {
                    createInfoWindow(response.response.venues[0], newMark);
                } else {
                    //If the response its different of ok, then create the infoWindow with the info of Google
                    CreateInfoWindowGoogle(newMark);
                }
            });

        //Add the listener in the new Mark of the MouseOver to show the infoWindow
        google.maps.event.addListener(newMark, "mouseover", function() {
            if (infowindow) {
                infowindow.close();
            }

            infowindow = this.infowindow;
            infowindow.open(map, this);
        });
        //Add the listener in the new Mark of the click to show the infoWindow if the user its on cellphone
        google.maps.event.addListener(newMark, "click", function() {
            if (infowindow) {
                infowindow.close();
            }

            infowindow = this.infowindow;
            infowindow.open(map, this);
        });

        self.markers.push(newMark);
    }

    //When the user click on the list of places that are the result of the petition, then show the infoWindow of the marker
    self.clickPlace = function(place) {
        if (infowindow) {
            infowindow.close();
        }

        infowindow = this.infowindow;
        infowindow.open(map, this);
    };

    //Create the infoWindow of with the info of FourSquare and Google
    function createInfoWindow(foursquare, marker) {
        if (foursquare) {
            var request = `https://api.foursquare.com/v2/venues/${
        foursquare.id
      }?client_id=${fourSquareClient}&client_secret=${fourSquareSecret}&v=20180225`;

            //Search the Venue ID on FourSquare to get the rating and show it to the user
            fetch(request)
                .then(response => response.json())
                .then(function(response) {
                    var infoWindowHtml = `<div class="infotitle">
                                        <span>${marker.title}</span>
                                      </div>
                                    <div class="address">
                                        <span>Address: ${
                                          foursquare.location.address
                                        }</span>
                                    </div>

                                    <div class="category">
                                        <span>Category: ${
                                          foursquare.categories[0].shortName
                                        }</span>
                                    </div>`;
                    //if there its rating on google or FourSquere then show it
                    if (marker.rating || response.response.venue.rating) {
                        infoWindowHtml =
                            infoWindowHtml +
                            `<div class="ratings">
                                    <div class="google">
                                        <i class="fab fa-google"></i> ${
                                          marker.rating ? marker.rating + "/5" : "N/A"  }
                                    </div>
                                    <div class="foursquare">
                                        <i class="fab fa-foursquare"></i> ${
                                          response.response.venue.rating ? response.response.venue.rating + "/10" : "N/A"
                                        }
                                    </div>
                                </div>`;
                    }

                    marker.infowindow = new google.maps.InfoWindow({
                        content: infoWindowHtml
                    });
                });
        } else {
            //if the place doesnt exists on FourSquare then just show the info of Google
            var infoWindowHtml = `<div class="infotitle">
            <span>${marker.title}</span>
          </div>
        <div class="address">
            <span>Address: ${marker.vicinity}</span>
        </div>
        `;

            if (marker.types.length > 0) {
                infoWindowHtml =
                    infoWindowHtml + '<div class="category"><span>Category:';
                let first = true;
                for (const type of marker.types) {
                    if (!first) {
                        infoWindowHtml = infoWindowHtml + ",";
                    }
                    infoWindowHtml = infoWindowHtml + type;
                    first = false;
                }
                infoWindowHtml = infoWindowHtml + "</span></div>";
            }

            if (marker.rating) {
                infoWindowHtml =
                    infoWindowHtml +
                    `<div class="ratings">
        <div class="google">
            <i class="fab fa-google"></i> ${
              marker.rating ? marker.rating + "/5" : "N/A"
            }
        </div>
    </div>`;
            }

            marker.infowindow = new google.maps.InfoWindow({
                content: infoWindowHtml
            });
        }
    }

    //Create the infoWindow with the info of Google
    function CreateInfoWindowGoogle(marker) {
        var infoWindowHtml = `<div class="infotitle">
            <span>${marker.title}</span>
          </div>
        <div class="address">
            <span>Address: ${marker.vicinity}</span>
        </div>
        `;

        if (marker.types.length > 0) {
            infoWindowHtml = infoWindowHtml + '<div class="category"><span>Category:';
            let first = true;
            for (const type of marker.types) {
                if (!first) {
                    infoWindowHtml = infoWindowHtml + ",";
                }
                infoWindowHtml = infoWindowHtml + type;
                first = false;
            }
            infoWindowHtml = infoWindowHtml + "</span></div>";
        }

        if (marker.rating) {
            infoWindowHtml =
                infoWindowHtml +
                `<div class="ratings">
        <div class="google">
            <i class="fab fa-google"></i> ${
              marker.rating ? marker.rating + "/5" : "N/A"
            }
        </div>
    </div>`;
        }

        marker.infowindow = new google.maps.InfoWindow({
            content: infoWindowHtml
        });
    }
}

//Applying the SearchBarModel
ko.applyBindings(new SearchBarModel());