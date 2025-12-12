import banner from "../../assets/Eventish.jpg"

const Header = () => {
  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${banner})`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-purple-900/70 to-pink-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-4">
        <div className="text-center text-white max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-7xl font-bold mb-6 animate-float">
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Welcome to Eventish
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Where extraordinary events come to life through seamless planning and unforgettable experiences
          </p>
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="btn-eventish text-lg px-8 py-4 animate-pulse-glow">Start Planning Today</button>
            
          </div> */}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
      <div
        className="absolute bottom-20 right-10 w-16 h-16 bg-purple-300/20 rounded-full animate-float"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-20 w-12 h-12 bg-pink-300/20 rounded-full animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
    </div>
  )
}

export default Header
