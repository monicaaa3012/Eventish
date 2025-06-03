import Navbar from "../../components/Navbar/Navbar"
import Header from "../../components/Header/Header"
import Hero from "../../components/Hero/Hero"
import Features from "../../components/Features/Features"
import Footer from "../../components/Footer/Footer"

const GeneralDashboard = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Header />
      <Hero />
      <Features />
      <Footer />
    </div>
  )
}

export default GeneralDashboard
