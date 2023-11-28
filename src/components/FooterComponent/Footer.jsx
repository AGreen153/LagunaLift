import './Footer.css'
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { WrapperContext } from '../WrapperComponent/Wrapper';
import svgWave from "../../assets/wave.svg"

const Footer = () => {
    const {isSignedIn} = useContext(WrapperContext);

    return ( 
        <section className="footer-component">
            <div className="background noselect">
                <object data={svgWave} type="image/svg+xml" className='noselect'></object>{/* https://stackoverflow.com/questions/10737166/chrome-not-rendering-svg-referenced-via-img-element */}
            </div>
            <div className="border">
                <a href="" id="logo">
                    <h1>Laguna</h1>
                    <h1>Lift</h1>
                </a>
                <div className="open-hours">
                    <figcaption>OPEN HOURS</figcaption>
                    <ul>
                        <li>Monday - Thursday   11:00AM - 12:00AM Midnight</li>
                        <li>Friday & Saturday   11:00AM - 2:00 AM</li>
                        <li>Sunday 12:00PM - 12:00AM Midnight</li>
                    </ul>
                </div>
                <div className="resources">
                    <figcaption>RESOURCES</figcaption>
                    <ul>
                        <li onClick={() => {document.documentElement.scrollTop =0; document.documentElement.scrollTop = 0;}}><Link to="/Services">Services</Link></li>
                        <li onClick={() => {document.documentElement.scrollTop =0; document.documentElement.scrollTop = 0;}}><Link to="/Facility">Facility</Link></li>
                        <li onClick={() => {document.documentElement.scrollTop =0; document.documentElement.scrollTop = 0;}}><Link to="/Merchandise">Merchandise</Link></li>
                        {!isSignedIn && <li onClick={() => {document.documentElement.scrollTop =0; document.documentElement.scrollTop = 0;}}><Link to="">Join Now</Link></li>}
                    </ul>
                </div>
                <div className="location">
                    <figcaption>CONTACT US</figcaption>
                    <ul>
                        <li>4946 Not Real Street, CA 92651</li>
                        <li>Phone: 1-555-776-2323</li>
                        <li>Email: andrew044green@gmail.com</li>
                    </ul>
                </div>
            </div>
        </section>
     );
}
export default Footer;