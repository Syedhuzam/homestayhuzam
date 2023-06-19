const router = require('express').Router();
const bookingsModel = require('../models/bookingsModel');
const roomsModel = require('../models/roomStatusModel');
const metaModel = require('../models/metaModel');

// app.use(bodyParser.urlencoded({limit: '5000mMb', extended: true, parameterLimit: 100000000000}));
// app.set('view engine', 'ejs');
// app.set('views',__dirname + '/views');

async function getAndUpdateNumberofBookings()
{
    let doc = await metaModel.findById('meta');
    console.log(doc);
    let numberOfBookings = doc.numberofBookings;
    numberOfBookings++;
    const filter = { _id: 'meta' };
    const update = { "$set": {
        "numberofBookings":numberOfBookings
    }}
    await metaModel.findOneAndUpdate(filter, update);
    return numberOfBookings;
}

router.route('/new').get((req,res)=>{
    return res.render("newBooking")
})

router.route('/summary').get((req,res)=>{

    return res.render("bookingSummary")
})

router.route('/add').post(async(req, res) => {
    console.log(req.body)
    // let selectedRooms = req.body.select;
    let checkIn = req.body.checkIn;
    let checkOut = req.body.checkOut;
    let categories = req.body.categories;
    let numberOfBookings = await getAndUpdateNumberofBookings();

    console.log(numberOfBookings);
    let string1 = "";
    let string2 = numberOfBookings.toString();
    for(let i=1; i<=(5-string2.length); i++)string1+='0';
    let bookingId = string1+string2;

    let roomsId=[];
    console.log(categories);
    for(category in categories)
    {
        let qty = categories[category].qty;
        for(let i=0;i<qty;i++)
        {
            roomsId.push(categories[category].roomsId[i]);
        }
    }


    const newBooking = new bookingsModel({
        _id:bookingId,
        accountId:'1234',
        roomsBooked: roomsId,
        checkIn: checkIn,
        checkOut: checkOut,
        isBookingCompelete: false
    })
    console.log(newBooking)
    let response = await newBooking.save();
    console.log(response);
    res.redirect(`summary?id=${response._id}`);
    // for(let i=0;i<selectedRooms.length;i++)
    // {
    //     let doc = await roomsModel.findById(selectedRooms[i]);
    //     doc.bookings.push({
    //         "bookingId": bookingId,
    //         "checkIn": checkIn,
    //         "checkOut": checkOut
    //     })
    //     const filter = { _id: selectedRooms[i] };
    //     const update = { "$set": {
    //     bookings: doc.bookings
    //     }
    //     }
    //     await roomsModel.findOneAndUpdate(filter, update);
    // }
    

});

router.route('/info').post(async(req, res) => {
    // console.log(req.body)
    // let selectedRooms = req.body.selectedRooms
    let checkIn = req.body.checkIn;
    let checkOut = req.body.checkOut;
    checkIn = Date.parse(checkIn);
    checkOut = Date.parse(checkOut);
    let clash=0;
    let availibilityInfo = {};
    for(let i=1;i<=3;i++)//for each room
    {
        clash=0;
        let j = i.toString();
        let doc = await roomsModel.findById(j);
        let numberofActiveBookings = doc.bookings.length;
        for(let j=0;j<numberofActiveBookings;j++)//iterating through bookings of a room
        {
            // console.log(doc.bookings[j])
            if(!(checkOut<doc.bookings[j].checkIn||checkIn>doc.bookings[j].checkOut))
            {
                // console.log(doc);
                // let bookingsCheckout = doc.bookings[j].checkOut;
                // if(checkIn>doc.bookings[j].checkOut)
                // console.log('checkIn>doc.bookings[j].checkOut')
                // else
                // console.log('checkIn<=doc.bookings[j].checkOut')
                // console.log(typeof checkIn,bookingsCheckout)
                clash=1;
                // console.log(doc.bookings[j]);
                break;
            }
        }
        if(clash==0)
        {
            categoryName = doc.categoryName;
            if(availibilityInfo[categoryName] === undefined)
            {
                availibilityInfo[categoryName] = {
                    qty:1,
                    roomsId:[j]
                };
            }
            else
            {
                availibilityInfo[categoryName].qty++;
                availibilityInfo[categoryName].roomsId.push(j);
            }
        }
    }
    console.log(availibilityInfo)
    res.send(availibilityInfo);
});

router.route('/totalamount').post(async(req, res) => {
    selectedCategories = req.body;
    let totalAmount = 0;
    for(const categoryName in selectedCategories)
    {
        const filter = { categoryName: categoryName };
        let doc = await roomsModel.findOne(filter);
        totalAmount += (doc.amount)*(selectedCategories[categoryName].qty);
    }
    let totalAmountObj={};
    totalAmountObj.totalAmount=totalAmount;
    res.send(totalAmountObj);
});

module.exports = router;

