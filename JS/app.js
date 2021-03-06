let map;
let service;
let infowindow;
// const fourSquareClient = "FourSquareClientHERE";
const FOUR_SQUARE_CLIENT = "Z0OCDTY4RWIMYZ1RB4QCMK5BBMHN0XSQCQWVIL1TXAYLJZKT";
// const fourSquareSecret = "FourSquareSecretHERE";
const FOUR_SQUARE_SECRET = "OVGP5RHRZK2WUT0FY2CQFRQRN1KVME1AUL4E5DVYGWNQTQSZ";
let neighborHoodLocation;

//When the document its load, we Init the Map
function initMap() {
    //add the location of San Pedro Sula
    neighborHoodLocation = new google.maps.LatLng(15.520383, -88.024528);
    map = new google.maps.Map(document.getElementById("map"), {
        center: neighborHoodLocation,
        zoom: 14
    });
    //create the markers with the points
    for (const mark of points) {
        createMarker(mark);
    }

    //Create the InfoWindows
    infowindow = new google.maps.InfoWindow();
}

//Iths the callback that we going to use on our petitions to Place services
function callback(results, status) {
    //If the status its ok, then create the markers in the map
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (const place of results) {
            createMarker(place);
        }
    }
}

//Create the new Mark and add it on the array of Markers
function createMarker(place) {
    let newMark = new google.maps.Marker({
        position: place.location,
        title: place.title,
        map: map,
        animation: google.maps.Animation.DROP,
        rating: place.rating,
        vicinity: place.vicinity,
        types: place.types
    });

    //search on FourSquare to find more information of the place
    var request = `https://api.foursquare.com/v2/venues/search?client_id=${FOUR_SQUARE_CLIENT}&client_secret=${FOUR_SQUARE_SECRET}&near=San Pedro Sula&query=${
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
        })
        .catch(error => {
            alert(error);
        });

    //Add the listener in the new Mark of the click to show the infoWindow if the user its on cellphone
    google.maps.event.addListener(newMark, "click", function() {
        if (infowindow) {
            infowindow.close();
        }

        infowindow = this.infowindow;
        infowindow.open(map, this);

        for (const mark of markers()) {

            if (mark.getAnimation() !== null) {
                mark.setAnimation(null);
            }
        }

        this.setAnimation(google.maps.Animation.BOUNCE);


    });

    markers.push(newMark);
}

//Create the infoWindow of with the info of FourSquare and Google
function createInfoWindow(foursquare, marker) {
    if (foursquare) {
        var request = `https://api.foursquare.com/v2/venues/${
      foursquare.id
    }?client_id=${FOUR_SQUARE_CLIENT}&client_secret=${FOUR_SQUARE_SECRET}&v=20180225`;

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
                                        <i class="fab fa-google"></i> ${ marker.rating ? marker.rating + "/5" : "N/A"
                                        }
                                    </div>
                                    <div class="foursquare">
                                        <i class="fab fa-foursquare"></i> ${response.response.venue.rating ? response.response.venue.rating +"/10": "N/A"
                                        }
                                    </div>
                                </div>`;
                }

                marker.infowindow = new google.maps.InfoWindow({
                    content: infoWindowHtml
                });
            })
            .catch(error => alert(error));
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

        infoWindowHtml = infoWindowHtml + `<div class="noInfoFourSquare">
                        There is no information in FourSquare!.
                        </div>`;

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

    infoWindowHtml = infoWindowHtml + `<div class="noInfoFourSquare">
                        There is no information in FourSquare!.
                        </div>`;

    marker.infowindow = new google.maps.InfoWindow({
        content: infoWindowHtml
    });
}

let markers;

//Create the Model for the SearchBar
function SearchBarModel() {
    let self = this;
    this.place = ko.observable();
    this.isHide = ko.observable(false);
    // this.hide = ko.pureComputed(function() {
    //     return self.isHide ? 'oculta' : '';
    // })

    markers = new ko.observableArray([]);

    //Search the new Places with the value that the user give us
    self.searchPlaces = ko.computed(function() {
        if (!self.place()) {
            for (const mark of markers()) {
                mark.setVisible(true);
            }
            return markers();
        } else {
            ko.utils.arrayFilter(markers(), function(marker) {
                if (marker.title.toLowerCase().indexOf(self.place().toLowerCase()) === -1) {
                    marker.setVisible(false);
                }
            });

            return ko.utils.arrayFilter(markers(), function(marker) {
                if (marker.title.toLowerCase().indexOf(self.place().toLowerCase()) > -1) {
                    marker.setVisible(true);
                }
                return marker.title.toLowerCase().indexOf(self.place().toLowerCase()) > -1;
            });
        }
    });

    //When the user click on the list of places that are the result of the petition, then show the infoWindow of the marker
    self.clickPlace = function(place) {
        if (infowindow) {
            infowindow.close();
        }

        infowindow = this.infowindow;
        infowindow.open(map, this);

        for (const mark of markers()) {

            if (mark.getAnimation() !== null) {
                mark.setAnimation(null);
            }
        }

        place.setAnimation(google.maps.Animation.BOUNCE);

    };

    self.hidding = function() {
        self.isHide(!self.isHide());
    };
}

//Applying the SearchBarModel
ko.applyBindings(new SearchBarModel());