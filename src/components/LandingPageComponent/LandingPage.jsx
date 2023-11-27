import './LandingPage.css'
import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { WrapperContext } from '../WrapperComponent/Wrapper'

const LandingPage = () => {
    const {isSignedIn} = useContext(WrapperContext);

    return ( 
        <section className="landing-page-component">
            <header>
                <section className='landing-page'>
                    <section id='splash'>
                        <div>
                            <h1>Unleash Your<br/>Inner Athlete</h1>
                            <h2>We are dedicated to helping you transform your body and mind through the power of fitness</h2>
                            <div className="buttons noselect">
                                {!isSignedIn && <Link to="/Login"><button>Join Now</button></Link>}
                            </div>
                        </div>
                    </section>
                </section>
            </header>
        </section>
     );
}
 
export default LandingPage;