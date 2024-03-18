import "./Navbar.css"
import navLogo from "../../Assets/nav-logo.svg"
import navProfile from "../../Assets/nav-profile.svg"

const Navbar = () => {
  return (
    <div className="navbar">
      <img src={navLogo} alt="nav-logo" className="nav-logo" />
      <img src={navProfile} alt="nav-profile" className="nav-profile" />
    </div>
  );
}

export default Navbar;
