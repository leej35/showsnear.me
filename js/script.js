/* Create a cache object */
var cache = new LastFMCache();

/* Create a LastFM object */
var lastfm = new LastFM({
	apiKey    : 'cd5262530fe8d0810408c648703e01a5',
	apiSecret : '8b7876fba38960fad13a22e04fc96a88',
	cache     : cache
});

function main(){

	/*Geolocation allowed*/
	function success(position) {

		/*get lat and lon*/
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;
		
		/*map options*/
		var myOptions = {
		        center: new google.maps.LatLng(lat, lon),
		        zoom: 8,
		        mapTypeId: google.maps.MapTypeId.ROADMAP
		      };

		/*draw the map*/
		var map = new google.maps.Map(document.getElementById("mapcanvas"),myOptions);
		
		/*Info window init for google maps */
		var infowindow = new google.maps.InfoWindow({ 
			content: "holding...",
			size: new google.maps.Size(50,50)
		});

		/*do last.fm stuff*/
		lastfm.geo.getEvents({lat: lat, long: lon}, {success: function(data){
			/*clear placeholder content*/
			$('#mainContent').html(" ");

			/* Use data. */
			// this for loop displays information for the first 10 events returned by lastfm.geo.getEvents
			// default listing is by date
			for (var i = 0; i < 10; i++){
			
				//shorten the date - remove time, use data.events.event[i].startTime instead
				var length = data.events.event[i].startDate.length;
				var shortDate = data.events.event[i].startDate.substring(0,length-9);
				
				//display events
				$('#mainContent').append( 
					"<h3>" + data.events.event[i].title + "</h3>" +
 					"<p>" + shortDate + " at " +
					data.events.event[i].venue.name + " in " +
					data.events.event[i].venue.location.city + "</p>"
				);
				
				/* Create markers to Google map */ 
				//REFERENCE: 
				//https://developers.google.com/maps/documentation/javascript/event
				//http://you.arenot.me/2010/06/29/google-maps-api-v3-0-multiple-markers-multiple-infowindows/
				var location = new google.maps.LatLng(data.events.event[i].venue.location["geo:point"]["geo:lat"], data.events.event[i].venue.location["geo:point"]["geo:long"]);
			    var marker = new google.maps.Marker({
			        position: location, 
			        title: data.events.event[i].title,
					html: "<h3>" + data.events.event[i].title + "</h3>" +
 					"<p>" + data.events.event[i].startDate + "</p>" +
					"<p>" + data.events.event[i].venue.name + "</p>" +
					"<p>" + data.events.event[i].venue.location.city + "</p>"
			    });
				
			    google.maps.event.addListener(marker, 'click', function() {
					infowindow.setContent(this.html);
					infowindow.open(map,this);
			    });
				marker.setMap(map);

					
			}

			/*printing some extra data can be helpful*/
			$('#dump').html(prettyPrint(data.events.event[0]));


		}, error: function(code, message){
			/* Show error message. */
			alert("ERROR: last.fm api failure");
		}});
		

	}
  /*Geolocation denied*/
	function error(msg) {
		var s = document.querySelector('#status');
		s.innerHTML = typeof msg == 'string' ? msg : "failed";
		s.className = 'fail';
	}

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(success, error);
	} else {
		error('not supported');
	}

}
