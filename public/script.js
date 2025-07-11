const payoutBtn = document.querySelector(".payout-btn");

if (payoutBtn) {
  payoutBtn.addEventListener("click", async function (e) {
    //
    const tourId = e.target.dataset.tourId;
    console.log("alo");
    const stripeSession = await fetch(`/api/v1/tour-checkout/${tourId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjI3NDU5YTc3MTlhNDk2YzFiMWI0OCIsImlhdCI6MTc1MjI0MTQxMiwiZXhwIjoxNzYwMDE3NDEyfQ.9aeLndrfAEisQlMKgk4Jhqi1YNSElLKRDSd8GMwgTOE",
      },
    });
    const tourIDData = await stripeSession.json();
    window.location.href = tourIDData.session.url;
  });
}
