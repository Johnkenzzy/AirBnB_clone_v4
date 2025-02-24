$(document).ready(function () {
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
});

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
