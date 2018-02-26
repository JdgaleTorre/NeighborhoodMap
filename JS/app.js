function SearchBarModel() {
    let self = this;
    this.place = ko.observable();
    let map;
    let service;
    self.markers = new ko.observableArray([]);
    let infowindow;
    const fourSquareClient = "Z0OCDTY4RWIMYZ1RB4QCMK5BBMHN0XSQCQWVIL1TXAYLJZKT";
    const fourSquareSecret = "OVGP5RHRZK2WUT0FY2CQFRQRN1KVME1AUL4E5DVYGWNQTQSZ";

    $(function() {
        $(window).on("load", function() {
            let spsLocation = new google.maps.LatLng(15.5444332, -88.0167403);
            // function initMap() {
            // Create a map object and specify the DOM element for display.
            map = new google.maps.Map(document.getElementById("map"), {
                center: spsLocation,
                zoom: 16
            });

            var request = {
                location: spsLocation,
                radius: "1000",
                type: ["cafe"]
            };

            service = new google.maps.places.PlacesService(map);
            service.nearbySearch(request, callback);

            infowindow = new google.maps.InfoWindow();
        });
    });

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log(results);
            for (const place of results) {
                console.log(place);
                createMarker(place);
            }
            console.log(self.markers());
            // for (var i = 0; i < results.length; i++) {
            //     var place = results[i];
            //     //createMarker(results[i]);
            // }
        }
    }

    function createMarker(place) {
        let newMark = new google.maps.Marker({
            position: place.geometry.location,
            title: place.name,
            // icon: {
            //     url: place.icon, // url
            //     scaledSize: new google.maps.Size(50, 50), // scaled size
            //     origin: new google.maps.Point(0, 0), // origin
            //     anchor: new google.maps.Point(0, 0) // anchor
            // },
            map: map,
            animation: google.maps.Animation.DROP,
            rating: place.rating,
            vicinity: place.vicinity,
            types: place.types
        });

        var request = `https://api.foursquare.com/v2/venues/search?client_id=${fourSquareClient}&client_secret=${fourSquareSecret}&near=San Pedro Sula&query=${
      newMark.title
    }&limit=1&v=20180225`;

        fetch(request)
            .then(response => response.json())
            .then(function(response) {
                console.log(response);

                createInfoWindow(response.response.venues[0], newMark);
            });

        google.maps.event.addListener(newMark, "mouseover", function() {
            if (infowindow) {
                infowindow.close();
            }

            infowindow = this["infowindow"];
            infowindow.open(map, this);
        });

        self.markers.push(newMark);
    }

    self.clickPlace = function(place) {
        if (infowindow) {
            infowindow.close();
        }

        infowindow = this["infowindow"];
        infowindow.open(map, this);
    };

    function createInfoWindow(foursquare, marker) {
        console.log(foursquare);

        if (foursquare) {
            var request = `https://api.foursquare.com/v2/venues/${foursquare.id}?client_id=${fourSquareClient}&client_secret=${fourSquareSecret}&v=20180225`;

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

                    if (marker.rating || response.response.venue.rating) {
                        infoWindowHtml =
                            infoWindowHtml +
                            `<div class="ratings">
                                    <div class="google">
                                        <i class="fab fa-google"></i> ${
                                          marker.rating
                                            ? marker.rating + "/5"
                                            : "N/A"
                                        }
                                    </div>
                                    <div class="foursquare">
                                        <i class="fab fa-foursquare"></i> ${
                                          response.response.venue.rating
                                            ? response.response.venue.rating +
                                              "/10"
                                            : "N/A"
                                        }
                                    </div>
                                </div>`;
                    }

                    marker["infowindow"] = new google.maps.InfoWindow({
                        content: infoWindowHtml
                    });
                });
        } else {
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
                for (type of marker.types) {
                    if (!first) {
                        infoWindowHtml = infoWindowHtml + ','
                    }
                    infoWindowHtml = infoWindowHtml + type;
                    first = false;
                }
                infoWindowHtml = infoWindowHtml + '</span></div>';
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

            marker["infowindow"] = new google.maps.InfoWindow({
                content: infoWindowHtml
            });
        }
    }
}

ko.applyBindings(new SearchBarModel());
// ko.applyBindings(markers);