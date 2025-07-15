// Dohvati odredjeni proizvod i prikazi ga
const productContainer = document.querySelector(".product-container");

const getProduct = async function () {
  const productFetch = await fetch(`/api/v1/tours/6846f8cef4684e5d8b81b599`, {
    method: "GET",
    headers: {
      authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjI3NDU5YTc3MTlhNDk2YzFiMWI0OCIsImlhdCI6MTc1MjU5MDc0OCwiZXhwIjoxNzYwMzY2NzQ4fQ.DX0j-WtgfG6OinsTmzS7mxSP7vE3KxIqGvvclhg6Dbo`,
    },
  });
  const response = await productFetch.json();
  const product = response.data.singleTour;
  console.log(product);
  displayProduct(product);
};
getProduct();

function displayProduct(product) {
  let html = `
  <div class='product' data-tourId=${product._id}>
  <p>${product.tourName}</p>
  <p>${product.location}</p>
  <p>${product.difficulty}</p>
  <img class='tour-image' src="../img/tour.jpg" alt='tour image'/>
  <p>Petar Maricic</p>
  <p>${product.totalPrice}</p>
  <button class='btn'>Buy</button>
  </div>
  `;
  productContainer.insertAdjacentHTML("afterbegin", html);

  payout();
}

async function payout() {
  const payoutBtn = document.querySelector(".btn");

  payoutBtn.addEventListener("click", async function (e) {
    // 1. dohvati id
    // 1.1 Odi na parent element od mesta click-a i uzmi dataset atribut
    const id = e.target.closest(".product").dataset.tourid;
    const sessionFetch = await fetch(`api/v1/tour-checkout/${id}`, {
      method: "GET",
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjI3NDU5YTc3MTlhNDk2YzFiMWI0OCIsImlhdCI6MTc1MjU5MDc0OCwiZXhwIjoxNzYwMzY2NzQ4fQ.DX0j-WtgfG6OinsTmzS7mxSP7vE3KxIqGvvclhg6Dbo",
      },
    });
    const session = await sessionFetch.json();
    window.location.href = session.session.url;
  });
}

const payoutBtn = document.querySelector(".payout-btn");

if (payoutBtn) {
  payoutBtn.addEventListener("click", async function (e) {
    //
    const tourId = e.target.dataset.tourId;
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
