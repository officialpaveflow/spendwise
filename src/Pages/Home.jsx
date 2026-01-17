import Navbar from "../Components/Navbar";
import Hero from "../Components/Hero";
import Features from "../components/Features";
import Pricing from "../components/Pricing";
import Reviews from "../components/Reviews";
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

