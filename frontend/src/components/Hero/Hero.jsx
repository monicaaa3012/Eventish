import { Link } from "react-router-dom"

const Hero = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto text-center">
        <div className="mb-12">
          <h2 className="text-5xl md:text-7xl font-bold text-gradient mb-6 leading-tight">
            Create Magical
            <br />
            <span className="text-6xl md:text-8xl">Events</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your vision into unforgettable experiences with Eventish - where every celebration becomes
            extraordinary
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Link to="/register" className="btn-eventish text-lg px-8 py-4 animate-pulse-glow">
            Start Planning Now
          </Link>

          <Link
            to="/login"
            className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            Sign In
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="group glass rounded-3xl p-8 card-hover">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
              Easy Planning
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Streamlined event creation with intuitive tools and smart suggestions
            </p>
          </div>

          <div className="group glass rounded-3xl p-8 card-hover">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors duration-300">
              Vendor Network
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Connect with trusted service providers and vendors in your area
            </p>
          </div>

          <div className="group glass rounded-3xl p-8 card-hover">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors duration-300">
              Seamless Management
            </h3>
            <p className="text-gray-600 leading-relaxed">Track everything from one comprehensive dashboard</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
