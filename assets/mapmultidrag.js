(function ($)
{

    $.mapDrag = function (element, options)
    {

        var defaults = {
            address: '#address',
            locationList: '#locations',
            language: 'en',
            updateAddressAfterDrag: true,
            listRemoveTemplate: '<button class="remove-marker">x</button>',
            attribute: ''
        };

        var plugin = this;
        var map = null;
        var markers = [];
        var _geocoder = new google.maps.Geocoder();

        plugin.settings = {};
        plugin.locations = {};
        plugin.markerCounter = 0;

        var $el = $(element);

        plugin.init = function ()
        {
            plugin.settings = $.extend({}, defaults, options);
            plugin.map = new GMaps({
                el: element,
                lat: 60.84705088629606,
                lng: 24.818115234375,
                zoom: 7,
                minZoom: 7,
                maxZoom: 14,
                zoomControl: true,
                panControl: true,
                streetViewControl: true,
                mapTypeControl: true,
                overviewMapControl: true
            });


            plugin.map.setContextMenu({
                control: 'map',
                options: [{
                    title: 'Add marker',
                    name: 'add_marker',
                    action: function (e)
                    {
                        var location =
                        {
                            lat: e.latLng.lat(),
                            lng: e.latLng.lng(),
                            components: '',
                            title: 'New marker',
                            id: plugin.markerCounter
                        };

                        plugin.AddMarkerFromLocation(location);
                    }
                }]
            });


            var ac = null;

            plugin.address = $(plugin.settings.address);
            plugin.locationList = $(plugin.settings.locationList);

            if (plugin.locationList.length)
            {
                plugin.locationList.on('click', 'button.remove-marker', function (e)
                {
                    var $el = $(this);
                    var $li = $el.closest('li');
                    var markerID = $li.attr('data-markerid');
                    var deletedIndex = -1;
                    $.each(plugin.locations, function (idx, location)
                    {
                        if (markerID == location.id)
                        {
                            location.marker.setMap(null);
                            deletedIndex = idx;
                        }
                    });

                    if (deletedIndex != -1)
                    {
                        delete plugin.locations[deletedIndex];
                    }

                    plugin.RefreshMap();
                    e.preventDefault();
                    return false;
                })
            }

            if (plugin.address.length)
            {
                plugin.address.on("keyup keypress", function (e)
                {
                    var code = e.keyCode || e.which;
                    if (code == 13)
                    {
                        e.preventDefault();
                        return false;
                    }
                });

                ac = new google.maps.places.Autocomplete(plugin.address[0], {language: plugin.settings.language});
                google.maps.event.addListener(ac, 'place_changed', function ()
                {
                    var place = ac.getPlace();
                    if (place != null)
                    {
                        if (place.geometry && place.geometry.location)
                        {
                            console.log(place);
                            var location =
                            {
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng(),
                                components: place.address_components,
                                title: plugin.address.val(),
                                id: plugin.markerCounter
                            };

                            plugin.AddMarkerFromLocation(location);
                            plugin.address.val('');
                        }
                    }
                });
            }


            plugin.attribute = $(plugin.settings.attribute);
            if (plugin.attribute.length)
            {
                var val = plugin.attribute.val();
                var json = '';
                try
                {
                    json = JSON.parse(val);
                    if ($.isArray(json))
                    {
                        $.each(json, function (idx, item)
                        {
                            if (item.hasOwnProperty('Latitude') && item.hasOwnProperty('Longitude') && item.hasOwnProperty('Title'))
                            {
                                var location =
                                {
                                    lat: parseFloat(item.Latitude),
                                    lng: parseFloat(item.Longitude),
                                    components: '',
                                    title: item.Title,
                                    id: plugin.markerCounter
                                };

                                plugin.AddMarkerFromLocation(location);
                            }
                        });
                    }
                }
                catch (e)
                {
                    console.log(e);
                }
            }

        };

        plugin.AddMarkerFromLocation = function (location)
        {
            var marker = plugin.map.addMarker({
                lat: location.lat,
                lng: location.lng,
                animation: google.maps.Animation.DROP,
                draggable: true,
                title: location.id.toString(),
                dragend: function (e2)
                {
                    var markerID = parseInt(marker.title) || 0;
                    var location = plugin.locations[markerID];
                    var latlng = new google.maps.LatLng(e2.latLng.lat(), e2.latLng.lng());

                    plugin.locations[markerID].lat = e2.latLng.lat();
                    plugin.locations[markerID].lng = e2.latLng.lng();

                    _geocoder.geocode({latLng: latlng, language: plugin.settings.language, region: plugin.settings.language }, function (results, status)
                    {
                        if (status == google.maps.GeocoderStatus.OK)
                        {
                            if (results[0] && results[0].address_components)
                            {
                                console.log(results[0]);
                                plugin.locations[markerID].components = results[0].address_components;
                                plugin.locations[markerID].title = results[0].formatted_address;
                                if (plugin.settings.updateAddressAfterDrag)
                                    plugin.address.val(results[0].formatted_address);
                            }
                            else
                            {
                                plugin.locations[markerID].components = '';
                                plugin.locations[markerID].title = '-no address-';
                            }
                        }
                        else
                        {
                            plugin.locations[markerID].components = '';
                            plugin.locations[markerID].title = '-no address-';
                        }

                        plugin.RefreshMap();
                    });
                }
            });
            plugin.locations[location.id] = location;
            plugin.locations[location.id].marker = marker;

            plugin.markerCounter++;
            plugin.RefreshMap();
        };

        plugin.RefreshMap = function ()
        {
            var bounds = new google.maps.LatLngBounds();
            var html = '';
            var arrayToSave = [];
            $.each(plugin.locations, function (idx, location)
            {
                bounds.extend(new google.maps.LatLng(location.lat, location.lng));
                html += '<li data-markerid="' + location.id + '">' + location.title + plugin.settings.listRemoveTemplate + '</li>';
                arrayToSave.push({
                    Latitude: location.lat,
                    Longitude: location.lng,
                    Title: location.title,
                    Components: location.components
                })
            });
            plugin.map.fitZoom();
            plugin.map.fitBounds(bounds);

            if(arrayToSave.length == 1)
                plugin.map.setZoom(14);

            if (plugin.locationList.length)
            {
                plugin.locationList.empty();
                plugin.locationList.html(html);
            }

            if (plugin.attribute.length)
            {
                plugin.attribute.val(JSON.stringify(arrayToSave));
            }
        };

        plugin.init();
    };

    $.fn.mapDrag = function (options)
    {
        return this.each(function ()
        {
            if (undefined == $(this).data('mapDrag'))
            {
                var plugin = new $.mapDrag(this, options);
                $(this).data('mapDrag', plugin);
            }
        });
    }

})(jQuery);












