import './Facility.css'
import facilityFront from '../../assets/LagunaLift_Facility.png'
import facilityBack from "../../assets/LagunaLift_Swimming_Pool.png"

import imgMap from "../../assets/map.png"

const Facility = () => {
    return ( 
        <section className="facility-component">
            <figcaption>Places to Visit Near LagunaLift</figcaption>
            <div id="map-container">
                <img src={imgMap} alt="" id='mapImg'/>
            </div>
            <div id='image-container'>
                <figcaption id='facilityFrontLabel'>Facility Front</figcaption>
                <figcaption id='facilityBackLabel'>Facility Back</figcaption>
                <img src={facilityFront} id='facilityFront' alt="" />
                <img src={facilityBack} id='facilityBack' alt="" />
            </div>
            <h1 id="disclaimer">Disclaimer:<br></br>LagunaLift does not actually exist<br></br>All images were generated with MidJourney AI</h1>
        </section>
     );
}
 
export default Facility;