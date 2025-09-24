const Footer = ({ sidebarWidth }) => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto" style={{ marginLeft: sidebarWidth }}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="py-3 text-center text-sm text-gray-500">
          © 2025 Options Travel Services. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;