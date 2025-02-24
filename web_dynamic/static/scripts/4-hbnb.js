$(function () {
  const url = 'http://127.0.0.1:5001/api/v1/status';

  $.get(url, function (data) {
    if (data.status === 'OK') {
      $('#api_status').addClass('available');
    } else {
      $('#api_status').removeClass('available');
    }
  });
});

$(function () {
  const checkedAmenities = {};

  $('input[type="checkbox"]').on('change', function () {
    const amenityId = $(this).attr('data-id');
    const amenityName = $(this).attr('data-name');

    if ($(this).is(':checked')) {
      checkedAmenities[amenityId] = amenityName;
    } else {
      delete checkedAmenities[amenityId];
    }

    updateH4();
  });

  function updateH4 () {
    const ckList = Object.values(checkedAmenities).join(', ');
    $('.amenities h4').text(ckList || '\u00A0');
  }

  function fetchPlaces () {
    const searchByAmts = Object.keys(checkedAmenities);

    $.ajax({
      url: 'http://127.0.0.1:5001/api/v1/places_search/',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ amenities: searchByAmts }),
      dataType: 'json',
      success: function (data) {
        console.log('success');

        $('.places').empty();

        $.each(data, function (index, place) {
          const guestInfo = `${place.max_guest} Guest${place.max_guest > 1 ? 's' : ''}`;
          const bdrmInfo = `${place.number_rooms} Bedroom${place.number_rooms > 1 ? 's' : ''}`;
          const bthrmInfo = `${place.number_bathrooms} Bathroom${place.number_bathrooms > 1 ? 's' : ''}`;
          const owner = place.user ? `${place.user.first_name} ${place.user.last_name}` : 'Unknown';
          const safeDescription = place.description ? place.description : 'No description available.';

          const article = $(`
            <article>
              <div class="title_box">
                <h2>${place.name}</h2>
                <div class="price_by_night">$${place.price_by_night}</div>
              </div>
              <div class="information">
                <div class="max_guest">${guestInfo}</div>
                <div class="number_rooms">${bdrmInfo}</div>
                <div class="number_bathrooms">${bthrmInfo}</div>
              </div>
              <div class="user"><span>Owner: ${owner}</span></div>
              <div class="description">${safeDescription}</div>
            </article>
          `);
          article.find('.description').html(safeDescription);
          $('.places').append(article);
        });
      },
      error: function (xhr, status, error) {
        console.error('Error:', error, status);
      }
    });
  }

  $('button').on('click', function () {
    fetchPlaces();
  });

  fetchPlaces();
});
