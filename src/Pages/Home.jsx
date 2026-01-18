import Navbar from "../Components/Navbar";
import Hero from "../Components/Hero";
import Features from "../Components/Features";
import Pricing from "../Components/Pricing";
import Reviews from "../Components/Reviews";
import Footer from "../Components/Footer";


export default function Home() {
  return (
    <>
      <Hero />
      <Navbar />
      <Features />
      <Pricing />
      <Reviews />
      <Footer />
    </>
  );
}

