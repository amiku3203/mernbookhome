import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import CheckoutForm from "./CheckoutForm";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const { listingId } = useParams();
  const [listing, setListing] = useState({});
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const stripePromise = loadStripe("pk_test_51OstCZSEms8zIkO8cn5y4p0SCmkzRu6Icjedv3NuohunCIeGjF4KcX8XqFHrdHf5MzNJHTorI6vkaKBb3aw4Si8Y00Y87Tcdg4");
  const [paymentStatus, setPaymentStatus] = useState("checkout");

  useEffect(() => {
    const getListingDetails = async () => {
      try {
        const response = await fetch(
          `https://mernbookhome.onrender.com/properties/${listingId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch listing details");
        }
        const data = await response.json();
        console.log("data", data)
        setListing(data);
        setLoading(false);
      } catch (err) {
        console.log("Fetch Listing Details Failed", err.message);
        setLoading(false);
      }
    };
    getListingDetails();
  }, [listingId]);

  const makePayment = async () => {
    const stripe = await loadStripe("pk_test_51OstCZSEms8zIkO8cn5y4p0SCmkzRu6Icjedv3NuohunCIeGjF4KcX8XqFHrdHf5MzNJHTorI6vkaKBb3aw4Si8Y00Y87Tcdg4");

    const newListing = [{
      "amenities": listing.amenities,
      "aptSuite": listing.aptSuite,
      "bathroomCount": listing.bathroomCount,
      "bedCount": listing.bedCount,
      "bedroomCount": listing.bedroomCount,
      "category": listing.category,
      "city": listing.city,
      "country": listing.country,
      "createdAt": listing.createdAt,
      "description": listing.description,
      "price": listing.price,
      "listingId": listingId,
      "_id": listing._id
    }];

    const body = {
      products: newListing
    };

    const headers = {
      "Content-Type": "application/json"
    };

    const response = await fetch("https://mernbookhome.onrender.com/create-payment-intent", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    });

    const session = await response.json();

    const result = stripe.redirectToCheckout({
      sessionId: session.id
    });

    if (!result.error) {
      setPaymentStatus("paid");
    } else {
      console.log(result.error);
    }
  };

  const handleSelect = (ranges) => {
    setDateRange(ranges); // Set date range directly
  };

  const dayCount = Math.round((dateRange[1] - dateRange[0]) / (1000 * 60 * 60 * 24)) || 1; // Use dateRange[1] for end date
  const customerId = useSelector((state) => state?.user?._id);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator?._id,
        startDate: dateRange[0].toDateString(), // Access date objects directly
        endDate: dateRange[1].toDateString(), // Access date objects directly
        totalPrice: listing.price ? listing.price * dayCount : 0,
      };

      const response = await fetch("https://mernbookhome.onrender.com/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm),
      });

      if (response.ok) {
        navigate(`/${customerId}/trips`);
      }

    } catch (err) {
      console.log("Submit Booking Failed.", err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="listing-details">
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="title">
              <h1>{listing.title}</h1>
            </div>
            <div className="photos">
              {listing.listingPhotoPaths?.map((item, index) => (
                <img
                  key={index}
                  src={`https://mernbookhome.onrender.com/${item.replace("public", "")}`}
                  alt="listing photo"
                />
              ))}
            </div>
            <h2>
              {listing.type} in {listing.city}, {listing.province},{" "}
              {listing.country}
            </h2>
            <p>
              {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) -{" "}
              {listing.bedCount} bed(s) - {listing.bathroomCount} bathroom(s)
            </p>
            <hr />
            <div className="profile">
              <img
                src={`https://mernbookhome.onrender.com/${listing.creator?.profileImagePath?.replace(
                  "public",
                  ""
                )}`}
                alt="host profile"
              />
              <h3>
                Hosted by {listing.creator?.firstName}{" "}
                {listing.creator?.lastName}
              </h3>
            </div>
            <hr />
            <h3>Description</h3>
            <p>{listing.description}</p>
            <hr />
            <h3>{listing.highlight}</h3>
            <p>{listing.highlightDesc}</p>
            <hr />
            <div className="booking">
              <div>
                <h2>What this place offers?</h2>
                <div className="amenities">
                  {listing.amenities[0]?.split(",").map((item, index) => (
                    <div className="facility" key={index}>
                      <div className="facility_icon">
                        {
                          facilities.find((facility) => facility.name === item)
                            ?.icon
                        }
                      </div>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2>How long do you want to stay?</h2>
                <div className="date-range-calendar">
                  <Calendar
                    onChange={handleSelect}
                    value={dateRange}
                    selectRange={true}
                  />
                  <h2>
                    ${listing.price || 0} x {dayCount}{" "}
                    {dayCount > 1 ? "nights" : "night"}
                  </h2>
                  <h2>
                    Total price: ${listing.price ? listing.price * dayCount : 0}
                  </h2>
                  <p>Start Date: {dateRange[0].toDateString()}</p>
                  <p>End Date: {dateRange[1].toDateString()}</p>
                  <button
  className="button"
  type="submit"
  onClick={makePayment}
  disabled={listing.payment}
  style={{
    backgroundColor: listing.payment ? 'green' : 'transparent',
    color: listing.payment ? 'white' : 'white',
  }}
>
  {listing.payment ? 'Paid' : 'Checkout'}
</button>

                  <button
                    className="button"
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "BOOKING"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ListingDetails;
