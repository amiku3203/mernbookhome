 
 const express = require("express");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
 const router = express.Router();
 const stripe = require("stripe")('sk_test_51OstCZSEms8zIkO8dr23pyrCYFTxeNgCX0zASYKzRthDr9Z3FR2iN1uIyFnv8bp96zhjIOIbzHgEOKe99cOWyRHW0070cFJ8L0');
 
 router.post("/create-payment-intent", async (req, res) => {
     try {
         const { products } = req.body;
        console.log(products)
        const lineItems = products.map(listing => {
            return {
              price_data: {
                currency: 'usd', // Specify the currency (adjust accordingly if different)
                product_data: {
                  name: listing.description // Use description as the name of the product or service
                },
                unit_amount: listing.price * 100, // Convert price to cents (Stripe requires amount in smallest currency unit)
              },
              quantity: 1, // Quantity of the product or service (assuming 1 for each listing)
            };
          });
          

console.log(lineItems);

        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            line_items:lineItems,
            mode:"payment",
             mode: "payment",
             success_url: `http://localhost:8000/properties/${products[0].listingId}`,
             cancel_url: "http://localhost:8000/cancel",
         });
        if(session.id){
          const booking=await  Listing.findById(products[0].listingId);
          booking.payment=true;
          await  booking.save();
        }
         res.json({ id: session.id });
     } catch (error) {
         console.error("Error creating payment intent:", error.message);
         res.status(500).json({ error: "Internal server error" });
     }
 });



 
 module.exports = router;
 