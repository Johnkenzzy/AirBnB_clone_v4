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
