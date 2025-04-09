export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-primary-900 via-purple-900 to-indigo-900 text-white mt-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Top Section with Logo and Newsletter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pb-12 border-b border-white/10">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-primary-600 font-extrabold text-xl">A</span>
            </div>
            <span className="font-extrabold text-2xl text-white tracking-wider">AMKUSH</span>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 transition-colors rounded-full flex items-center justify-center text-white">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 transition-colors rounded-full flex items-center justify-center text-white">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 transition-colors rounded-full flex items-center justify-center text-white">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 transition-colors rounded-full flex items-center justify-center text-white">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <p className="text-white/80 mb-6">
              Secure payment processing solutions for businesses of all sizes with advanced fraud detection and seamless integrations.
            </p>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <i className="fas fa-envelope text-primary-300"></i>
                <a href="mailto:support@amkush.com" className="text-white/80 hover:text-white transition-colors">support@amkush.com</a>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-phone text-primary-300"></i>
                <a href="tel:+1234567890" className="text-white/80 hover:text-white transition-colors">+1 (234) 567-890</a>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg text-white mb-6">Solutions</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors flex items-center"><i className="fas fa-chevron-right text-xs mr-2 text-primary-300"></i> Payment Processing</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors flex items-center"><i className="fas fa-chevron-right text-xs mr-2 text-primary-300"></i> Online Payments</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors flex items-center"><i className="fas fa-chevron-right text-xs mr-2 text-primary-300"></i> Invoicing</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors flex items-center"><i className="fas fa-chevron-right text-xs mr-2 text-primary-300"></i> Subscriptions</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg text-white mb-6">Support</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors flex items-center"><i className="fas fa-chevron-right text-xs mr-2 text-primary-300"></i> Help Center</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors flex items-center"><i className="fas fa-chevron-right text-xs mr-2 text-primary-300"></i> Documentation</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors flex items-center"><i className="fas fa-chevron-right text-xs mr-2 text-primary-300"></i> Status Page</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors flex items-center"><i className="fas fa-chevron-right text-xs mr-2 text-primary-300"></i> Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg text-white mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors flex items-center"><i className="fas fa-chevron-right text-xs mr-2 text-primary-300"></i> Privacy Policy</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors flex items-center"><i className="fas fa-chevron-right text-xs mr-2 text-primary-300"></i> Terms of Service</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors flex items-center"><i className="fas fa-chevron-right text-xs mr-2 text-primary-300"></i> Cookie Policy</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors flex items-center"><i className="fas fa-chevron-right text-xs mr-2 text-primary-300"></i> Security</a></li>
            </ul>
          </div>
        </div>
        
        {/* Copyright and Security Badges */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 mb-6 md:mb-0">© {new Date().getFullYear()} AMKUSH. All rights reserved.</p>
          <div className="flex items-center flex-wrap justify-center gap-4">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center hover-lift">
              <i className="fas fa-lock text-primary-300 mr-2"></i>
              <span className="text-white">PCI Compliant</span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center hover-lift">
              <i className="fas fa-shield-alt text-primary-300 mr-2"></i>
              <span className="text-white">SSL Secured</span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center hover-lift">
              <i className="fas fa-user-shield text-primary-300 mr-2"></i>
              <span className="text-white">GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
