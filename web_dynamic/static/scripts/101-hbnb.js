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
  const checkedStates = {};
  const checkedCities = {};
  const checkedAmenities = {};

  $('.locations input[type="checkbox"]').on('change', function () {
    const itemId = $(this).attr('data-id');
    const itemName = $(this).attr('data-name');

    if ($(this).is(':checked')) {
      if ($(this).closest('li').find('h2').length) {
        checkedStates[itemId] = itemName;
      } else {
        checkedCities[itemId] = itemName;
      }
    } else {
      delete checkedStates[itemId];
      delete checkedCities[itemId];
    }

    updateLocationsH4();
  });

  $('.amenities input[type="checkbox"]').on('change', function () {
    const amenityId = $(this).attr('data-id');
    const amenityName = $(this).attr('data-name');

    if ($(this).is(':checked')) {
      checkedAmenities[amenityId] = amenityName;
    } else {
      delete checkedAmenities[amenityId];
    }

    updateAmenitiesH4();
  });

  function updateAmenitiesH4 () {
    const ckList = Object.values(checkedAmenities).join(', ');
    $('.amenities h4').text(ckList || '\u00A0');
  }

  function updateLocationsH4 () {
    const locations = Object.values(checkedStates).concat(Object.values(checkedCities)).join(', ');
    $('.locations h4').text(locations || '\u00A0');
  }

  function fetchPlaces () {
    const searchParams = {
      amenities: Object.keys(checkedAmenities),
      states: Object.keys(checkedStates),
      cities: Object.keys(checkedCities)
    };

    $.ajax({
      url: 'http://127.0.0.1:5001/api/v1/places_search/',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(searchParams),
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
              <div class="reviews">
                <h2><span><span class="review-count">0</span> Reviews</span> <span class="toggle-reviews" data-place-id="${place.id}">show</span></h2>
                <div class="review-list"></div>
              </div>
              <div class="user"><span>Owner: ${owner}</span></div>
              <div class="description">${safeDescription}</div>
            </article>
          `);
          article.find('.description').html(safeDescription);
          $('.places').append(article);

          $.get(`http://127.0.0.1:5001/api/v1/places/${place.id}/reviews/`, function (reviews) {
            article.find('.review-count').text(reviews.length);
          });
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

  $(document).on('click', '.toggle-reviews', function () {
    const span = $(this);
    const placeId = span.attr('data-place-id');
    const reviewList = span.closest('.reviews').find('.review-list');

    if (span.text() === 'show') {
      $.ajax({
        url: `http://127.0.0.1:5001/api/v1/places/${placeId}/reviews/`,
        type: 'GET',
        dataType: 'json',
        success: function (reviews) {
          console.log('success');
          reviewList.empty();

          if (reviews.length === 0) {
            reviewList.append('<p>No reviews available.</p>');
          } else {
            const ul = $('<ul></ul>');
            reviews.forEach(review => {
              const reviewDate = new Date(review.created_at).toLocaleDateString();
              const userName = review.user ? `${review.user.first_name} ${review.user.last_name}` : 'Anonymous';

              const reviewItem = $(`
                <li>
                  <h3>From ${userName} on ${reviewDate}</h3>
                  <p>${$('<div>').text(review.text).html()}</p>
                </li>
              `);
              ul.append(reviewItem);
            });

            reviewList.append(ul);
          }

          span.text('hide');
        },
        error: function () {
          reviewList.html('<p>Error loading reviews.</p>');
        }
      });
    } else {
      reviewList.empty();
      span.text('show');
    }
  });
});
