let selectedCategoriesGlobal = {};
//format of selectedCategoriesGlobal:
//{
  //'Deluxe-Ground Floor': { qty: 0, roomsId: [ '1', '3' ] }, qty is selected quantity
  //'Deluxe-First Floor': { qty: 1, roomsId: [ '2' ] }
//}

function checkBookingClash(myObject){
  console.log('checkbookingclash')
  selectedCategoriesGlobal={};
  document.getElementById('amount').innerHTML="";

  const checkIn = document.getElementById('checkIn').valueAsDate;
  const checkOut = document.getElementById('checkOut').valueAsDate;
  if(checkIn===null||checkOut===null)
  {
    if(checkIn===null)
    document.getElementById('availibility-info').innerHTML = '<p style="color:red">Please enter CheckIn!</p>';
    else
    document.getElementById('availibility-info').innerHTML = '<p style="color:red">Please enter CheckOut!</p>'
    return;
  }
  const utcCheckIn = Date.UTC(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
  const utcCheckOut = Date.UTC(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
  if(utcCheckIn==utcCheckOut)
  {
    document.getElementById('availibility-info').innerHTML = '<p style="color:red">CheckIn and CheckOut cannot be on same date!</p>';
    return;
  }
  else if(utcCheckIn>utcCheckOut)
  {
    document.getElementById('availibility-info').innerHTML = '<p style="color:red">CheckOut must be after CheckIn!</p>';
    return;
  }
  
  const objectSent={
      // "selectedRooms": selectedRooms,
      "checkIn": checkIn,
      "checkOut": checkOut
  }


  fetch("http://localhost:3000/bookings/info", {
  method: "POST",
  body: JSON.stringify(objectSent),
  headers: {
    "Content-type": "application/json; charset=UTF-8"
  }
})
  .then((response) =>
  {
    response.json()
    .then((availibilityInfo)=>{
      console.log(availibilityInfo);
      let htmltoInsert="";
      for(const categoryName in availibilityInfo)
      {
        let maxAvailable = availibilityInfo[categoryName].qty;
        selectedCategoriesGlobal[categoryName] = {};
        selectedCategoriesGlobal[categoryName].qty = 0;
        selectedCategoriesGlobal[categoryName].roomsId = availibilityInfo[categoryName].roomsId;
        htmltoInsert+=`<label>${categoryName}</label><select onchange="calculateAmount(this)"><option name="${categoryName}" value="0">0</option>`;
        for(let i=1;i<=maxAvailable;i++)
        {
          htmltoInsert+=`<option name="${categoryName}" value="${i}">${i}</option>`
        }
        htmltoInsert+=`</select><br>`;
      }
      document.getElementById('availibility-info').innerHTML = htmltoInsert;
    });
  });
}

function calculateAmount(selectedCategory)
{
  let categoryName = selectedCategory[0].attributes.name.textContent
  let categoryQty = selectedCategory.options.selectedIndex;
  selectedCategoriesGlobal[categoryName].qty = categoryQty;
  console.log(selectedCategoriesGlobal)
  fetch("http://localhost:3000/bookings/totalamount", {
  method: "POST",
  body: JSON.stringify(selectedCategoriesGlobal),
  headers: {
    "Content-type": "application/json; charset=UTF-8"
  }})
  .then((response) =>
  {
    response.json()
    .then((totalAmountObj)=>{
      console.log(totalAmountObj);
      const _MS_PER_DAY = 1000 * 60 * 60 * 24;
      const checkIn = document.getElementById('checkIn').valueAsDate;
      const checkOut = document.getElementById('checkOut').valueAsDate;
      const utcCheckIn = Date.UTC(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
      const utcCheckOut = Date.UTC(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
      const numberofDays = Math.floor((utcCheckOut - utcCheckIn) / _MS_PER_DAY);
      console.log(numberofDays);
      totalAmountObj.totalAmount = (totalAmountObj.totalAmount)*numberofDays;
      let htmltoInsert=`<p>amount: ₹${totalAmountObj.totalAmount}</p>`;
      document.getElementById('amount').innerHTML = htmltoInsert;
    });
  });
  // console.log(selectedCategory)
}
function postBooking()
{
  const checkIn = document.getElementById('checkIn')
  const checkOut = document.getElementById('checkOut')
  const objectSent={
    "checkIn": checkIn.valueAsDate,
    "checkOut": checkOut.valueAsDate,
    "categories":selectedCategoriesGlobal
  }
  fetch("http://localhost:3000/bookings/add", {
  method: "POST",
  body: JSON.stringify(objectSent),
  headers: {
    "Content-type": "application/json; charset=UTF-8"
  }
  })
  .then()
  


}